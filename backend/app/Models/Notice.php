<?php

namespace App\Models;

class Notice extends BaseModel
{
    protected $table = 'notices';

    protected $fillable = [
        'title',
        'content',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
