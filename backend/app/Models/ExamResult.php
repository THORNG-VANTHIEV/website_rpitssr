<?php

namespace App\Models;

class ExamResult extends BaseModel
{
    protected $table = 'exam_results';

    protected $fillable = [
        'courseName',
        'semester',
        'generation',
        'year',
        'examName',
        'studentId',
        'studentName',
        'className',
        'subject',
        'totalMarks',
        'obtainedMarks',
        'percentage',
        'grade',
        'examDate',
        'isPublished',
        'remarks',
        'resultImageUrl',
        'resultPdfUrl',
        'documentType',
        'createdById',
        'lastUpdatedById',
        'lastUpdatedAt',
    ];

    protected $casts = [
        'isPublished' => 'boolean',
        'examDate' => 'date',
        'lastUpdatedAt' => 'datetime',
        'percentage' => 'float',
        'totalMarks' => 'integer',
        'obtainedMarks' => 'integer',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdById');
    }
}
