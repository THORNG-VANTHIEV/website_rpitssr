<?php

namespace App\Models;

class BlogPost extends BaseModel
{
    protected $table = 'blog_posts';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'imageUrl',
        'categoryId',
        'author',
        'authorId',
        'tags',
        'status',
        'type',
        'viewCount',
        'featured',
        'publishedAt',
    ];

    protected $casts = [
        'featured' => 'boolean',
        'publishedAt' => 'datetime',
        'viewCount' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'categoryId');
    }

    public function authorUser()
    {
        return $this->belongsTo(User::class, 'authorId');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'blogPostId');
    }

    public function facebookEmbed()
    {
        return $this->hasOne(FacebookEmbed::class, 'postId');
    }
}
