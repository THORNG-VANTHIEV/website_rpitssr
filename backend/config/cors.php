<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values(array_filter(
        array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))),
        static fn (string $origin): bool => (bool) preg_match('#^https?://(?:[a-z0-9-]+(?:\.[a-z0-9-]+)*|\[[a-f0-9:]+\])(?::[0-9]{1,5})?$#i', $origin),
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];
