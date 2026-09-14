<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $table = 'promotions';

    protected $fillable = [
        'type',
        'title',
        'description',
        'message',
        'image_url',
        'background_image',
        'background_color',
        'button_text',
        'button_link',
        'position',
        'delay',
        'show_once',
        'is_active',
        'priority',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_once' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'delay' => 'integer',
        'priority' => 'integer',
    ];
}
