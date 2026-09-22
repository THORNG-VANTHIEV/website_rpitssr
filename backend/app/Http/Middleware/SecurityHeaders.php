<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request and attach standard OWASP security headers to the response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->remove('X-Powered-By');
        if (function_exists('header_remove') && ! headers_sent()) {
            header_remove('X-Powered-By');
        }

        if ($request->is('api/*')) {
            $response->headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
            $response->headers->set('Cache-Control', 'no-store, private');
        } else {
            $header = config('security.csp_report_only')
                ? 'Content-Security-Policy-Report-Only'
                : 'Content-Security-Policy';
            $response->headers->set($header, config('security.html_csp'));
        }

        if (app()->environment('production') && $request->isSecure() && config('security.hsts_enabled')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000');
        }

        return $response;
    }
}
