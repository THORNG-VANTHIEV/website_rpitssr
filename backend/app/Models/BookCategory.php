<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class BookCategory extends BaseModel
{
    protected $table = 'book_categories';

    const CREATED_AT = 'created_at';

    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'name_km',
        'name_en',
        'code',
        'shelf_location',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function books(): HasMany
    {
        return $this->hasMany(Book::class, 'category_id');
    }
}
