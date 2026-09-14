<?php

namespace App\Models;

class FacebookEmbed extends BaseModel
{
    protected $table = 'facebook_embeds';

    protected $fillable = [
        'postId',
        'facebookUrl',
        'facebookPostId',
        'embedCode',
        'status',
    ];

    public function post()
    {
        return $this->belongsTo(BlogPost::class, 'postId');
    }
}
