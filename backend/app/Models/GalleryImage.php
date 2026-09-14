<?php

namespace App\Models;

class GalleryImage extends BaseModel
{
    protected $table = 'gallery_images';

    protected $fillable = [
        'title',
        'description',
        'imageUrl',
        'category',
        'isActive',
        'order',
    ];

    protected $casts = [
        'isActive' => 'boolean',
    ];
}
