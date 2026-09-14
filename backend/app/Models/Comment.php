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
        'blogPostId',
        'parentCommentId',
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
