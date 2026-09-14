<?php

namespace App\Models;

class Setting extends BaseModel
{
    protected $table = 'settings';

    protected $fillable = [
        'siteName',
        'siteDescription',
        'siteUrl',
        'contactEmail',
        'contactPhone',
        'address',
        'logoUrl',
        'metaTitle',
        'metaDescription',
        'metaKeywords',
        'facebookUrl',
        'twitterUrl',
        'linkedinUrl',
        'instagramUrl',
        'youtubeUrl',
        'enableRegistration',
        'enableComments',
        'primaryColor',
        'secondaryColor',
        'academicYear',
        'defaultLanguage',
        'updatedById',
        'lastUpdated',
    ];

    protected $casts = [
        'enableRegistration' => 'boolean',
        'enableComments' => 'boolean',
        'lastUpdated' => 'datetime',
    ];
}
