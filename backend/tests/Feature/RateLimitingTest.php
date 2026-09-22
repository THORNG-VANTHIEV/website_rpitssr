<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_api_route_has_rate_limiting_middleware(): void
    {
        $apiRoutes = collect(Route::getRoutes()->getRoutes())
            ->filter(fn ($route): bool => str_starts_with($route->uri(), 'api/'));

        $this->assertNotEmpty($apiRoutes);

        $apiRoutesWithoutRateLimiting = $apiRoutes
            ->reject(function ($route): bool {
                return collect($route->gatherMiddleware())->contains(
                    fn (string $middleware): bool => str_starts_with($middleware, 'throttle:')
                        || str_starts_with($middleware, ThrottleRequests::class.':')
                );
            })
            ->map(fn ($route): string => implode('|', $route->methods()).' '.$route->uri())
            ->values()
            ->all();

        $this->assertSame([], $apiRoutesWithoutRateLimiting);
    }

    public function test_public_content_is_limited_by_ip(): void
    {
        config(['rate_limits.public_per_minute' => 2]);

        $this->getJson('/api/courses')->assertOk();
        $this->getJson('/api/courses')->assertOk();
        $this->getJson('/api/courses')
            ->assertTooManyRequests()
            ->assertHeader('X-RateLimit-Limit', '2')
            ->assertHeader('Retry-After');
    }

    public function test_health_endpoint_has_its_own_limit(): void
    {
        config(['rate_limits.health_per_minute' => 2]);

        $this->getJson('/api/health')->assertOk();
        $this->getJson('/api/health')->assertOk();
        $this->getJson('/api/health')->assertTooManyRequests();
    }

    public function test_only_failed_logins_consume_the_credentials_limit(): void
    {
        config([
            'rate_limits.login.failed_per_minute' => 2,
            'rate_limits.login.per_ip_per_minute' => 100,
            'rate_limits.login.failed_per_account_per_hour' => 100,
        ]);

        $user = User::factory()->create();

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $this->postJson('/api/auth/login', [
                'email' => $user->email,
                'password' => 'password',
            ])->assertOk();
        }

        for ($attempt = 0; $attempt < 2; $attempt++) {
            $this->postJson('/api/auth/login', [
                'email' => strtoupper($user->email),
                'password' => 'incorrect-password',
            ])->assertUnauthorized();
        }

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertTooManyRequests()
            ->assertHeader('X-RateLimit-Limit', '2');
    }

    public function test_registration_and_contact_have_ten_minute_budgets(): void
    {
        config([
            'rate_limits.registration.attempts' => 2,
            'rate_limits.contact.attempts' => 2,
        ]);

        $this->postJson('/api/auth/register')->assertUnprocessable();
        $this->postJson('/api/auth/register')->assertUnprocessable();
        $this->postJson('/api/auth/register')->assertTooManyRequests();

        $this->postJson('/api/contact')->assertOk();
        $this->postJson('/api/contact')->assertOk();
        $this->postJson('/api/contact')->assertTooManyRequests();
    }

    public function test_authenticated_read_and_write_budgets_are_separate(): void
    {
        config([
            'rate_limits.authenticated.reads_per_minute' => 2,
            'rate_limits.authenticated.writes_per_minute' => 2,
        ]);

        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/auth/me')->assertOk();
        $this->getJson('/api/auth/me')->assertOk();
        $this->getJson('/api/auth/me')->assertTooManyRequests();

        $this->putJson('/api/student/profile')->assertOk();
        $this->putJson('/api/student/profile')->assertOk();
        $this->putJson('/api/student/profile')->assertTooManyRequests();
    }

    public function test_admin_reads_writes_uploads_and_sensitive_actions_use_distinct_limits(): void
    {
        config([
            'rate_limits.admin.reads_per_minute' => 1,
            'rate_limits.admin.writes_per_minute' => 1,
            'rate_limits.admin.uploads_per_minute' => 1,
            'rate_limits.admin.sensitive_per_hour' => 1,
        ]);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->getJson('/api/admin/verify')->assertOk();
        $this->getJson('/api/admin/verify')->assertTooManyRequests();

        $this->postJson('/api/admin/faqs')->assertUnprocessable();
        $this->postJson('/api/admin/faqs')->assertTooManyRequests();

        $this->postJson('/api/admin/upload')->assertBadRequest();
        $this->postJson('/api/admin/upload')->assertTooManyRequests();

        $this->deleteJson('/api/admin/faqs/missing')->assertNotFound();
        $this->deleteJson('/api/admin/faqs/missing')->assertTooManyRequests();
    }
}
