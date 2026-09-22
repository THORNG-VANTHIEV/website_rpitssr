<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends BaseModel
{
    protected $table = 'books';

    const CREATED_AT = 'created_at';

    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'title_km',
        'title_en',
        'author',
        'isbn',
        'call_number',
        'category_id',
        'publisher',
        'publish_year',
        'edition',
        'language',
        'total_copies',
        'available_copies',
        'shelf_location',
        'cover_image',
        'file_url',
        'is_ebook',
        'is_featured',
        'status',
        'description',
    ];

    protected $casts = [
        'is_ebook' => 'boolean',
        'is_featured' => 'boolean',
        'total_copies' => 'integer',
        'available_copies' => 'integer',
        'publish_year' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(BookCategory::class, 'category_id');
    }

    public function borrowings(): HasMany
    {
        return $this->hasMany(BookBorrowing::class, 'book_id');
    }
}
