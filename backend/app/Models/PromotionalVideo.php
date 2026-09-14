<?php

namespace App\Models;

class PromotionalVideo extends BaseModel
{
    protected $table = 'promotional_videos';

    protected $fillable = [
        'title',
        'video_url',
        'youtube_id',
        'description',
        'category',
        'thumbnail',
        'is_featured',
        'is_active',
        'order_index',
        'published_date',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'order_index' => 'integer',
    ];

    /**
     * Helper to extract YouTube video ID from a URL
     */
    public static function extractYouTubeId(?string $url): ?string
    {
        if (!$url) return null;
        if (preg_match('/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/', $url, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
