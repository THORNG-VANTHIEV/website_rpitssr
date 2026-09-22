<?php

return [
    'health_per_minute' => 60,
    'public_per_minute' => 120,
    'download_per_minute' => 10,

    'login' => [
        'failed_per_minute' => 5,
        'per_ip_per_minute' => 30,
        'failed_per_account_per_hour' => 20,
    ],

    'registration' => [
        'attempts' => 3,
        'decay_minutes' => 10,
    ],

    'contact' => [
        'attempts' => 3,
        'decay_minutes' => 10,
    ],

    'authenticated' => [
        'reads_per_minute' => 120,
        'writes_per_minute' => 20,
    ],

    'admin' => [
        'reads_per_minute' => 180,
        'writes_per_minute' => 30,
        'uploads_per_minute' => 10,
        'sensitive_per_hour' => 2,
    ],
];
