<?php

namespace App\Models;

class Comment extends BaseModel
{
    protected $table = 'comments';

    protected $fillable = [
        'author',
        'email',
        'phone',
        'title',
        'time',
        'content',
        'status',
        'blogPostId',
        'parentCommentId',
    ];

    /**
     * The attributes that should be hidden for public serialization (PII Protection).
     */
    protected $hidden = [
        'email',
        'phone',
    ];

    public function post()
    {
        return $this->belongsTo(BlogPost::class, 'blogPostId');
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parentCommentId');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parentCommentId');
    }
}
