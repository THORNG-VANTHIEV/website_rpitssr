<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApiSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_protected_api_returns_json_401_without_accept_header(): void
    {
        $this->get('/api/admin/users')
            ->assertUnauthorized()
            ->assertHeader('Content-Type', 'application/json')
            ->assertExactJson(['message' => 'Unauthenticated.']);
    }

    public function test_protected_api_returns_json_401_with_html_or_json_accept_header(): void
    {
        foreach (['text/html', 'application/json'] as $accept) {
            $this->get('/api/student/profile', ['Accept' => $accept])
                ->assertUnauthorized()
                ->assertExactJson(['message' => 'Unauthenticated.']);
        }
    }

    public function test_unexpected_api_errors_hide_internal_details(): void
    {
        Route::get('/api/security-test-failure', function (): never {
            throw new \RuntimeException('Private internal exception detail');
        });

        $this->get('/api/security-test-failure')
            ->assertStatus(500)
            ->assertExactJson(['message' => 'Server Error']);
    }

    public function test_api_has_enforced_security_headers(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
            ->assertHeaderMissing('X-Powered-By')
            ->assertHeaderMissing('Strict-Transport-Security');
    }

    public function test_cors_allows_only_configured_origins(): void
    {
        config(['cors.allowed_origins' => ['https://school.example', 'https://www.school.example']]);
        $this->getJson('/api/health', ['Origin' => 'https://school.example'])
            ->assertHeader('Access-Control-Allow-Origin', 'https://school.example');
        $this->getJson('/api/health', ['Origin' => 'https://unapproved.example'])
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_cors_preflight_supports_frontend_bearer_requests(): void
    {
        config(['cors.allowed_origins' => ['https://school.example']]);
        $this->options('/api/admin/users', [], [
            'Origin' => 'https://school.example',
            'Access-Control-Request-Method' => 'PUT',
            'Access-Control-Request-Headers' => 'authorization,content-type',
        ])->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'https://school.example')
            ->assertHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->assertHeader('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With');
    }

    public function test_single_origin_cors_never_reflects_an_unapproved_origin(): void
    {
        config(['cors.allowed_origins' => ['https://school.example']]);
        $response = $this->getJson('/api/health', ['Origin' => 'https://unapproved.example']);
        $this->assertNotSame('https://unapproved.example', $response->headers->get('Access-Control-Allow-Origin'));
        $this->assertNotSame('*', $response->headers->get('Access-Control-Allow-Origin'));
    }

    public function test_empty_cors_allowlist_denies_cross_origin_access(): void
    {
        config(['cors.allowed_origins' => []]);
        $this->getJson('/api/health', ['Origin' => 'https://unapproved.example'])
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_html_csp_starts_in_report_only_mode(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertHeader('Content-Security-Policy-Report-Only', config('security.html_csp'))
            ->assertHeaderMissing('Content-Security-Policy');
    }

    public function test_hsts_requires_https_production_and_explicit_enablement(): void
    {
        $this->app->instance('env', 'production');
        config(['security.hsts_enabled' => true]);
        $this->get('https://school.example/api/health')
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000');
        $this->get('http://school.example/api/health')->assertHeaderMissing('Strict-Transport-Security');
        $this->app->instance('env', 'testing');
        $this->get('https://school.example/api/health')->assertHeaderMissing('Strict-Transport-Security');
    }

    public function test_admission_application_generates_high_entropy_tracking_code(): void
    {
        $response = $this->postJson('/api/admissions/apply', [
            'khmerName' => 'សុខ សាន',
            'latinName' => 'Sok San',
            'gender' => 'male',
            'phone' => '012345678',
            'degreeLevel' => 'bachelor',
            'major' => 'Information Technology',
            'shift' => 'morning',
        ])->assertCreated();

        $trackingCode = $response->json('trackingCode');
        $this->assertMatchesRegularExpression('/^APP-\d{4}-[A-Z0-9]{8}$/', $trackingCode);
    }

    public function test_admission_document_upload_validates_types_and_size(): void
    {
        Storage::fake('public');

        // Valid image
        $validFile = UploadedFile::fake()->image('id_card.jpg', 600, 400)->size(1024);
        $this->postJson('/api/admissions/upload-document', [
            'file' => $validFile,
            'type' => 'idCard',
        ])->assertCreated()->assertJsonPath('success', true);

        // Disallowed executable script disguised as jpg or plain php
        $dangerousFile = UploadedFile::fake()->create('shell.php', 50, 'application/x-php');
        $this->postJson('/api/admissions/upload-document', [
            'file' => $dangerousFile,
            'type' => 'certificate',
        ])->assertUnprocessable();

        // Exceeding 5MB limit
        $oversizedFile = UploadedFile::fake()->create('huge.pdf', 6000, 'application/pdf');
        $this->postJson('/api/admissions/upload-document', [
            'file' => $oversizedFile,
            'type' => 'certificate',
        ])->assertUnprocessable();
    }
}
