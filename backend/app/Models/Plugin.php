<?php

namespace App\Models;

class Plugin extends BaseModel
{
    protected $table = 'plugins';

    protected $fillable = [
        'name',
        'version',
        'description',
        'author',
        'isActive',
        'isInstalled',
        'installedAt',
        'configData',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'isInstalled' => 'boolean',
        'installedAt' => 'datetime',
    ];
}
