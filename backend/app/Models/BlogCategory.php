<?php

namespace App\Models;

class BlogCategory extends BaseModel
{
    protected $table = 'blog_categories';

    protected $fillable = [
        'name',
        'description',
        'slug',
        'imageUrl',
        'status',
        'order',
    ];

    public function posts()
    {
        return $this->hasMany(BlogPost::class, 'categoryId');
    }
}
