<?php

namespace App\Models;

class Event extends BaseModel
{
    protected $table = 'events';

    protected $fillable = [
        'title',
        'time',
        'date',
        'place',
        'category_id',
        'imageUrl',
        'description',
        'overview',
        'speakers',
        'schedule',
        'fee',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    protected $with = ['category'];

    public function category()
    {
        return $this->belongsTo(EventCategory::class, 'category_id');
    }
}
