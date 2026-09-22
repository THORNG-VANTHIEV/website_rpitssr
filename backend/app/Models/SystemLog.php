<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    use HasFactory;

    protected $table = 'systemLogs';

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = null;

    protected $fillable = [
        'level',
        'action',
        'message',
        'userId',
        'ipAddress',
        'userAgent',
        'metadata',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
