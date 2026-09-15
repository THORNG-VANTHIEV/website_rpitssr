<?php

namespace App\Models;

class EventCategory extends BaseModel
{
    protected $table = 'event_categories';

    protected $fillable = [
        'name',
        'description',
        'slug',
        'imageUrl',
        'status',
        'order',
    ];

    public function events()
    {
        return $this->hasMany(Event::class, 'category_id');
    }
}
