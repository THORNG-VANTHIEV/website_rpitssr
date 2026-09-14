<?php

namespace App\Models;

class ScrollingBanner extends BaseModel
{
    protected $table = 'scrolling_banners';

    protected $fillable = [
        'is_active',
        'order_index',
        'message',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
