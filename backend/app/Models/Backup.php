<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Backup extends Model
{
    use HasFactory;

    protected $table = 'backups';

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = null;

    protected $fillable = [
        'fileName',
        'filePath',
        'fileSize',
        'type',
        'status',
        'createdById',
        'description',
        'tables',
    ];

    protected $casts = [
        'fileSize' => 'integer',
        'tables' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdById');
    }
}
