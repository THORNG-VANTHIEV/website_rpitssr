<?php

namespace App\Models;

class Teacher extends BaseModel
{
    protected $table = 'teachers';

    protected $fillable = [
        'name',
        'imageUrl',
        'designation',
        'department',
        'description',
        'email',
        'phone',
        'skype',
        'facebook',
        'twitter',
        'instagram',
        'linkedin',
        'experience',
        'educationalQualifications',
        'achievements',
    ];
}
