<?php

namespace App\Models;

class Faq extends BaseModel
{
    protected $table = 'faqs';

    protected $fillable = [
        'question',
        'answer',
        'order',
    ];
}
