<?php

namespace App\Models;

class Report extends BaseModel
{
    protected $table = 'reports';

    protected $fillable = [
        'type',
        'status',
        'fileName',
        'filePath',
        'fileSize',
        'generatedById',
        'dateRange',
        'startDate',
        'endDate',
        'data',
    ];

    protected $casts = [
        'startDate' => 'date',
        'endDate' => 'date',
        'fileSize' => 'integer',
    ];

    public function generator()
    {
        return $this->belongsTo(User::class, 'generatedById');
    }
}
