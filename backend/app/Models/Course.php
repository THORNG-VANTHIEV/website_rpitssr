<?php

namespace App\Models;

class Course extends BaseModel
{
    protected $table = 'courses';

    protected $fillable = [
        'title',
        'imageUrl',
        'description',
        'overview',
        'categoryId',
        'benefits',
        'fee',
        'duration',
        'credit',
        'semester',
    ];

    public function category()
    {
        return $this->belongsTo(CourseCategory::class, 'categoryId');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'courseId');
    }
}
