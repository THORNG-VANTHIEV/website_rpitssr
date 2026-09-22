<?php

namespace App\Models;

class Document extends BaseModel
{
    protected $table = 'documents';

    const CREATED_AT = 'created_at';

    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'code',
        'title_km',
        'title_en',
        'category',
        'file_type',
        'file_size',
        'file_path',
        'description_km',
        'description_en',
        'submission_office',
        'required_docs_km',
        'required_docs_en',
        'downloads_count',
        'is_popular',
        'is_active',
        'order',
    ];

    protected $casts = [
        'required_docs_km' => 'array',
        'required_docs_en' => 'array',
        'downloads_count' => 'integer',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}
