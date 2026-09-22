<?php

return [
    'hsts_enabled' => (bool) env('SECURITY_HSTS_ENABLED', false),
    'csp_report_only' => (bool) env('SECURITY_CSP_REPORT_ONLY', true),
    'trusted_proxies' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('TRUSTED_PROXIES', ''))
    ))),
    'html_csp' => "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob: https:; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://www.youtube.com https://www.facebook.com https://www.google.com; media-src 'self' blob: https:",
];
