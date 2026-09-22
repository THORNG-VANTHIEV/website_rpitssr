<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $trustedProxies = config('security.trusted_proxies');

        if ($trustedProxies !== []) {
            TrustProxies::at($trustedProxies);
        }

        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        RateLimiter::for('health', fn (Request $request): Limit => Limit::perMinute(
            (int) config('rate_limits.health_per_minute')
        )->by('health:'.$request->ip()));

        RateLimiter::for('public-content', fn (Request $request): Limit => Limit::perMinute(
            (int) config('rate_limits.public_per_minute')
        )->by('public:'.$request->ip()));

        RateLimiter::for('download', fn (Request $request): Limit => Limit::perMinute(
            (int) config('rate_limits.download_per_minute')
        )->by('download:'.$request->ip().':'.(string) $request->route('id')));

        RateLimiter::for('login', function (Request $request): array {
            $ipAddress = $request->ip();
            $emailKey = $this->emailKey($request);
            $failedResponse = fn (Response $response): bool => $response->getStatusCode() >= 400
                && $response->getStatusCode() < 500;

            return [
                Limit::perMinute((int) config('rate_limits.login.per_ip_per_minute'))
                    ->by('login-ip:'.$ipAddress),
                Limit::perMinute((int) config('rate_limits.login.failed_per_minute'))
                    ->by('login-credentials:'.$emailKey.':'.$ipAddress)
                    ->after($failedResponse),
                Limit::perHour((int) config('rate_limits.login.failed_per_account_per_hour'))
                    ->by('login-account:'.$emailKey)
                    ->after($failedResponse),
            ];
        });

        RateLimiter::for('registration', fn (Request $request): Limit => Limit::perMinutes(
            (int) config('rate_limits.registration.decay_minutes'),
            (int) config('rate_limits.registration.attempts')
        )->by('registration:'.$request->ip()));

        RateLimiter::for('contact', fn (Request $request): Limit => Limit::perMinutes(
            (int) config('rate_limits.contact.decay_minutes'),
            (int) config('rate_limits.contact.attempts')
        )->by('contact:'.$request->ip()));

        RateLimiter::for('authenticated', function (Request $request): Limit {
            $actorKey = $this->actorKey($request);

            if ($this->isReadRequest($request)) {
                return Limit::perMinute((int) config('rate_limits.authenticated.reads_per_minute'))
                    ->by('authenticated-read:'.$actorKey);
            }

            return Limit::perMinute((int) config('rate_limits.authenticated.writes_per_minute'))
                ->by('authenticated-write:'.$actorKey);
        });

        RateLimiter::for('admin', function (Request $request): Limit {
            $actorKey = $this->actorKey($request);
            $actionMethod = $request->route()?->getActionMethod();

            if ($request->isMethod('DELETE') || in_array($actionMethod, ['createBackup', 'downloadBackup', 'clearLogs'], true)) {
                return Limit::perHour((int) config('rate_limits.admin.sensitive_per_hour'))
                    ->by('admin-sensitive:'.$actorKey);
            }

            if (in_array($actionMethod, ['upload', 'uploadThumbnail', 'uploadCover'], true)) {
                return Limit::perMinute((int) config('rate_limits.admin.uploads_per_minute'))
                    ->by('admin-upload:'.$actorKey);
            }

            if ($this->isReadRequest($request)) {
                return Limit::perMinute((int) config('rate_limits.admin.reads_per_minute'))
                    ->by('admin-read:'.$actorKey);
            }

            return Limit::perMinute((int) config('rate_limits.admin.writes_per_minute'))
                ->by('admin-write:'.$actorKey);
        });
    }

    private function actorKey(Request $request): string
    {
        $userId = $request->user()?->getAuthIdentifier();

        return $userId === null ? 'ip:'.$request->ip() : 'user:'.$userId;
    }

    private function emailKey(Request $request): string
    {
        $email = Str::lower(trim((string) $request->input('email')));

        return hash('sha256', $email);
    }

    private function isReadRequest(Request $request): bool
    {
        return in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true);
    }
}
