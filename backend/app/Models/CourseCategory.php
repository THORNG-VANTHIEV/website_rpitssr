<?php

namespace App\Models;

class CourseCategory extends BaseModel
{
    protected $table = 'course_categories';

    protected $fillable = [
        'name',
        'description',
        'slug',
        'imageUrl',
        'status',
        'order',
    ];

    public function courses()
    {
        return $this->hasMany(Course::class, 'categoryId');
    }
}
