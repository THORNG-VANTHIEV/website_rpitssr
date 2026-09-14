<?php

namespace App\Models;

class Review extends BaseModel
{
    protected $table = 'reviews';

    protected $fillable = [
        'courseId',
        'userId',
        'rating',
        'comment',
        'isApproved',
    ];

    protected $casts = [
        'isApproved' => 'boolean',
        'rating' => 'integer',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'courseId');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
