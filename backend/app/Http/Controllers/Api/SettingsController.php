<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromotionalVideo;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Client\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class SettingsController extends Controller
{
    private const YouTubeFeedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC88b1w6PZ02seTQB1zkIDwQ';

    private const YouTubeFeedMaxBytes = 1048576;

    public function publicSettings(): JsonResponse
    {
        $setting = Setting::first();

        if (! $setting) {
            return response()->json([
                'success' => true,
                'data' => [
                    'siteName' => 'RPITSSR',
                    'siteDescription' => 'Regional Polytechnic Institute Techo Sen Siem Reap',
                ],
            ], 200);
        }

        // Return only safe public fields
        $publicData = [
            'siteName' => $setting->siteName,
            'siteDescription' => $setting->siteDescription,
            'siteUrl' => $setting->siteUrl,
            'contactEmail' => $setting->contactEmail,
            'contactPhone' => $setting->contactPhone,
            'address' => $setting->address,
            'logoUrl' => $setting->logoUrl,
            'metaTitle' => $setting->metaTitle,
            'metaDescription' => $setting->metaDescription,
            'metaKeywords' => $setting->metaKeywords,
            'facebookUrl' => $setting->facebookUrl,
            'twitterUrl' => $setting->twitterUrl,
            'linkedinUrl' => $setting->linkedinUrl,
            'instagramUrl' => $setting->instagramUrl,
            'youtubeUrl' => $setting->youtubeUrl,
            'primaryColor' => $setting->primaryColor,
            'secondaryColor' => $setting->secondaryColor,
            'academicYear' => $setting->academicYear,
            'defaultLanguage' => $setting->defaultLanguage,
        ];

        return response()->json([
            'success' => true,
            'data' => $publicData,
        ], 200);
    }

    /**
     * Get latest promotional videos from database or YouTube channel
     */
    public function youtubeVideos(): JsonResponse
    {
        $dbVideos = PromotionalVideo::where('is_active', true)
            ->orderBy('is_featured', 'desc')
            ->orderBy('order_index', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        if ($dbVideos->isNotEmpty()) {
            $mapped = $dbVideos->map(function ($v) {
                $isFb = str_contains(strtolower($v->video_url ?? ''), 'facebook.com') || str_contains(strtolower($v->video_url ?? ''), 'fb.watch');

                return [
                    'id' => $v->youtube_id ?: (string) $v->id,
                    'youtubeId' => $v->youtube_id,
                    'youtubeUrl' => $v->video_url,
                    'videoUrl' => $v->video_url,
                    'platform' => $isFb ? 'facebook' : 'youtube',
                    'title' => $v->title,
                    'description' => $v->description,
                    'publishedDate' => $v->published_date ?: 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
                    'isNew' => true,
                    'category' => $v->category ?: 'សកម្មភាពទូទៅ',
                    'thumbnail' => $v->thumbnail ?: ($v->youtube_id ? "https://img.youtube.com/vi/{$v->youtube_id}/maxresdefault.jpg" : '/images/logo.png'),
                    'isFeatured' => (bool) $v->is_featured,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'channelUrl' => 'https://youtube.com/@rpitssr_edu',
                    'videos' => $mapped,
                ],
            ], 200);
        }

        $videos = Cache::remember('rpitssr_edu_youtube_latest_videos_v2', 1800, function () {
            try {
                $response = Http::accept('application/atom+xml, application/xml, text/xml')
                    ->withoutRedirecting()
                    ->connectTimeout(2)
                    ->timeout(5)
                    ->get(self::YouTubeFeedUrl);
                if (! $response->successful() || ! $this->isValidYouTubeFeedResponse($response)) {
                    return $this->fallbackVideos();
                }

                $xmlStr = $response->body();
                if (strlen($xmlStr) > self::YouTubeFeedMaxBytes) {
                    return $this->fallbackVideos();
                }

                $dom = new \DOMDocument;
                $dom->substituteEntities = false;
                @$dom->loadXML($xmlStr, LIBXML_NONET | LIBXML_NOWARNING | LIBXML_NOERROR);
                $entries = $dom->getElementsByTagName('entry');

                if ($entries->length === 0) {
                    return $this->fallbackVideos();
                }

                $now = Carbon::now();
                $list = [];

                for ($i = 0; $i < $entries->length; $i++) {
                    $entry = $entries->item($i);
                    $videoId = $entry->getElementsByTagName('videoId')->item(0)?->nodeValue;
                    $rawTitle = trim($entry->getElementsByTagName('title')->item(0)?->nodeValue ?? '');
                    $publishedStr = $entry->getElementsByTagName('published')->item(0)?->nodeValue;
                    $rawDesc = $entry->getElementsByTagName('description')->item(0)?->nodeValue ?? '';

                    if (! $videoId || ! $rawTitle) {
                        continue;
                    }

                    $pubDate = $publishedStr ? Carbon::parse($publishedStr) : $now;
                    $diffDays = (int) abs($now->diffInDays($pubDate, false));
                    $isUnderMonth = ($diffDays <= 31);

                    $title = $this->formatVideoTitle($rawTitle);
                    $dateKhmer = $this->formatDateKhmer((int) $diffDays, $pubDate);
                    $caption = $this->cleanVideoCaption($rawDesc, $title);
                    $category = $this->determineCategory($title, $rawDesc);

                    $list[] = [
                        'id' => $videoId,
                        'youtubeId' => $videoId,
                        'youtubeUrl' => "https://www.youtube.com/watch?v={$videoId}",
                        'title' => $title,
                        'description' => $caption,
                        'publishedDate' => $dateKhmer,
                        'rawDate' => $pubDate->toIso8601String(),
                        'diffDays' => (int) $diffDays,
                        'isNew' => $isUnderMonth,
                        'category' => $category,
                        'thumbnail' => "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg",
                    ];
                }

                usort($list, function ($a, $b) {
                    return strcmp($b['rawDate'], $a['rawDate']);
                });

                return $list;
            } catch (\Throwable $e) {
                return $this->fallbackVideos();
            }
        });

        return response()->json([
            'success' => true,
            'data' => [
                'channelUrl' => 'https://youtube.com/@rpitssr_edu',
                'videos' => $videos,
            ],
        ], 200);
    }

    private function isValidYouTubeFeedResponse(Response $response): bool
    {
        return str_contains(strtolower((string) $response->header('Content-Type')), 'xml');
    }

    private function formatVideoTitle(string $rawTitle): string
    {
        $clean = trim(preg_replace('/^#\S+\s*/u', '', $rawTitle));
        if (str_contains($clean, 'សិស្សវគ្គc1') || str_contains($clean, 'សិស្សវគ្គ c1')) {
            return 'សកម្មភាពការសិក្សា និងការអនុវត្តផ្ទាល់របស់សិស្សវគ្គ C1 (TVET 1.5M)';
        }
        if (str_contains($clean, 'ឈន់ ស្រីខួច')) {
            return 'បទសម្ភាសន៍ និងចំណាប់អារម្មណ៍របស់និស្សិត ឈន់ ស្រីខួច (ជំនាន់ទី ១៨)';
        }
        if ($clean === 'ដំណើរទស្សនកិច្ចសិក្សា') {
            return 'ដំណើរទស្សនកិច្ចសិក្សាស្វែងយល់ការងារជាក់ស្តែងរបស់និស្សិត RPITSSR';
        }
        if (str_contains($clean, 'អាហារូបករណ៍១០០%') || str_contains($clean, 'អាហារូបករណ៍ 100%')) {
            return '📣 សេចក្តីជូនដំណឹង៖ វគ្គសិក្សាអាហារូបករណ៍ ១០០% សម្រាប់ឆ្នាំសិក្សាថ្មី';
        }

        return $clean;
    }

    private function cleanVideoCaption(?string $desc, string $title): string
    {
        if (str_contains($title, 'សិស្សវគ្គ C1') || str_contains($title, 'វគ្គc1')) {
            return 'ទស្សនាសកម្មភាពរៀន និងអនុវត្តផ្ទាល់របស់សិស្សវគ្គ C1 ក្នុងកម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស ១.៥ លាននាក់ (1.5M) — រៀនដោយឥតគិតថ្លៃ ព្រមទាំងទទួលបានប្រាក់ឧបត្ថម្ភ។';
        }
        if (str_contains($title, 'ឈន់ ស្រីខួច')) {
            return 'ចំណាប់អារម្មណ៍ និងបទពិសោធន៍ផ្ទាល់របស់និស្សិត ឈន់ ស្រីខួច លើគុណភាពនៃការបណ្តុះបណ្តាល និងបរិយាកាសសិក្សាជាក់ស្តែងនៅវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប។';
        }
        if (str_contains($title, 'ទស្សនកិច្ចសិក្សា')) {
            return 'សកម្មភាពដំណើរទស្សនកិច្ចសិក្សាទៅកាន់បណ្តាសហគ្រាស និងរោងចក្រដៃគូ ដើម្បីដកស្រង់បទពិសោធន៍ការងារ និងផ្សារភ្ជាប់ទ្រឹស្តីទៅនឹងការអនុវត្តជាក់ស្តែងក្នុងវិស័យការងារ។';
        }
        if (str_contains($title, 'អាហារូបករណ៍')) {
            return 'សូមស្វាគមន៍មកកាន់វិទ្យាស្ថានក្នុងឆ្នាំសិក្សាថ្មី! ចាប់ផ្តើមទទួលចុះឈ្មោះចូលសិក្សាថ្នាក់បរិញ្ញាបត្របច្ចេកវិទ្យា និងសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង) អាហារូបករណ៍ ១០០% — TVET ជំនាញពិត ជីវិតប្រសើរ រៀនឲ្យចេះ ឲ្យចប់ ឲ្យមានការងារ!';
        }

        if (! $desc) {
            return 'ទស្សនាវីដេអូស្តីពី៖ '.$title.' របស់វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)។';
        }

        $lines = explode("\n", $desc);
        $cleanedLines = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (empty($trimmed)) {
                continue;
            }
            if (preg_match('/^(☎️|អាសយដ្ឋាន|🌎|Facebook|🎥|📩|Telegram|#)/u', $trimmed)) {
                break;
            }
            $cleanedLines[] = $trimmed;
        }

        $caption = implode(' ', $cleanedLines);
        $caption = preg_replace('/#\S+/u', '', $caption);
        $caption = trim(preg_replace('/\s+/', ' ', $caption));

        if (mb_strlen($caption) < 20) {
            return 'ទស្សនាវីដេអូស្តីពី៖ '.$title.' របស់វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)។';
        }

        return $caption;
    }

    private function formatDateKhmer(int $diffDays, Carbon $pubDate): string
    {
        if ($diffDays <= 1) {
            return 'ទើបបង្ហោះថ្មីៗ';
        }
        if ($diffDays <= 7) {
            return 'សប្តាហ៍នេះ';
        }
        if ($diffDays <= 14) {
            return '១ សប្តាហ៍មុន';
        }
        if ($diffDays <= 21) {
            return '២ សប្តាហ៍មុន';
        }
        if ($diffDays <= 31) {
            return 'ថ្មីៗនេះ (ក្រោម ១ ខែ)';
        }
        if ($diffDays <= 60) {
            return '១ ខែមុន';
        }
        if ($diffDays <= 90) {
            return '២ ខែមុន';
        }

        return $pubDate->format('d/m/Y');
    }

    private function determineCategory(string $title, string $desc): string
    {
        $t = mb_strtolower($title);
        $d = mb_strtolower($desc);

        if (str_contains($t, 'ទស្សនកិច្ច')) {
            return 'ទស្សនកិច្ចសិក្សា';
        }
        if (str_contains($t, 'c1') || str_contains($t, '1.5m') || str_contains($t, 'សិស្សវគ្គ')) {
            return 'កម្មវិធី TVET 1.5M';
        }
        if (str_contains($t, 'ស្រីខួច') || str_contains($t, 'សម្ភាសន៍') || str_contains($t, 'និស្សិត')) {
            return 'បទសម្ភាសន៍និស្សិត';
        }
        if (str_contains($t, 'អាហារូបករណ៍')) {
            return 'អាហារូបករណ៍ ១០០%';
        }
        if (str_contains($t, 'រោងជាង') || str_contains($t, 'បង្រៀន')) {
            return 'សកម្មភាពរោងជាង';
        }
        if (str_contains($t, 'អគ្គិសនី') || str_contains($t, 'plc')) {
            return 'ជំនាញអគ្គិសនី';
        }
        if (str_contains($t, 'រថយន្ត') || str_contains($t, 'មេកានិក')) {
            return 'ជំនាញមេកានិក';
        }
        if (str_contains($d, 'អាហារូបករណ៍')) {
            return 'អាហារូបករណ៍ ១០០%';
        }

        return 'ផ្សព្វផ្សាយទូទៅ';
    }

    private function fallbackVideos(): array
    {
        return [
            [
                'id' => 'v7UHTRM4Qmo',
                'youtubeId' => 'v7UHTRM4Qmo',
                'youtubeUrl' => 'https://www.youtube.com/watch?v=v7UHTRM4Qmo',
                'title' => '📣 សេចក្តីជូនដំណឹង៖ វគ្គសិក្សាអាហារូបករណ៍ ១០០% សម្រាប់ឆ្នាំសិក្សាថ្មី',
                'description' => 'សូមស្វាគមន៍មកកាន់វិទ្យាស្ថានក្នុងឆ្នាំសិក្សាថ្មី! ចាប់ផ្តើមទទួលចុះឈ្មោះចូលសិក្សាថ្នាក់បរិញ្ញាបត្របច្ចេកវិទ្យា និងសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង) អាហារូបករណ៍ ១០០% — TVET ជំនាញពិត ជីវិតប្រសើរ រៀនឲ្យចេះ ឲ្យចប់ ឲ្យមានការងារ!',
                'publishedDate' => 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
                'rawDate' => '2026-08-14T09:29:47+00:00',
                'diffDays' => 30,
                'isNew' => true,
                'category' => 'អាហារូបករណ៍ ១០០%',
                'thumbnail' => 'https://img.youtube.com/vi/v7UHTRM4Qmo/maxresdefault.jpg',
            ],
            [
                'id' => 'jO6qbRaqOow',
                'youtubeId' => 'jO6qbRaqOow',
                'youtubeUrl' => 'https://www.youtube.com/watch?v=jO6qbRaqOow',
                'title' => 'សកម្មភាពការសិក្សា និងការអនុវត្តផ្ទាល់របស់សិស្សវគ្គ C1 (TVET 1.5M)',
                'description' => 'ទស្សនាសកម្មភាពរៀន និងអនុវត្តផ្ទាល់របស់សិស្សវគ្គ C1 ក្នុងកម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស ១.៥ លាននាក់ (1.5M) — រៀនដោយឥតគិតថ្លៃ ព្រមទាំងទទួលបានប្រាក់ឧបត្ថម្ភ។',
                'publishedDate' => 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
                'rawDate' => '2026-08-14T09:34:03+00:00',
                'diffDays' => 30,
                'isNew' => true,
                'category' => 'កម្មវិធី TVET 1.5M',
                'thumbnail' => 'https://img.youtube.com/vi/jO6qbRaqOow/maxresdefault.jpg',
            ],
            [
                'id' => 'rF0eP2now0Q',
                'youtubeId' => 'rF0eP2now0Q',
                'youtubeUrl' => 'https://www.youtube.com/watch?v=rF0eP2now0Q',
                'title' => 'បទសម្ភាសន៍ និងចំណាប់អារម្មណ៍របស់និស្សិត ឈន់ ស្រីខួច (ជំនាន់ទី ១៨)',
                'description' => 'ចំណាប់អារម្មណ៍ និងបទពិសោធន៍ផ្ទាល់របស់និស្សិត ឈន់ ស្រីខួច លើគុណភាពនៃការបណ្តុះបណ្តាល និងបរិយាកាសសិក្សាជាក់ស្តែងនៅវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប។',
                'publishedDate' => 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
                'rawDate' => '2026-08-14T09:33:44+00:00',
                'diffDays' => 30,
                'isNew' => true,
                'category' => 'បទសម្ភាសន៍និស្សិត',
                'thumbnail' => 'https://img.youtube.com/vi/rF0eP2now0Q/maxresdefault.jpg',
            ],
            [
                'id' => 'QMpV0pgfFqU',
                'youtubeId' => 'QMpV0pgfFqU',
                'youtubeUrl' => 'https://www.youtube.com/watch?v=QMpV0pgfFqU',
                'title' => 'ដំណើរទស្សនកិច្ចសិក្សាស្វែងយល់ការងារជាក់ស្តែងរបស់និស្សិត RPITSSR',
                'description' => 'សកម្មភាពដំណើរទស្សនកិច្ចសិក្សាទៅកាន់បណ្តាសហគ្រាស និងរោងចក្រដៃគូ ដើម្បីដកស្រង់បទពិសោធន៍ការងារ និងផ្សារភ្ជាប់ទ្រឹស្តីទៅនឹងការអនុវត្តជាក់ស្តែងក្នុងវិស័យការងារ។',
                'publishedDate' => 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
                'rawDate' => '2026-08-14T09:32:10+00:00',
                'diffDays' => 30,
                'isNew' => true,
                'category' => 'ទស្សនកិច្ចសិក្សា',
                'thumbnail' => 'https://img.youtube.com/vi/QMpV0pgfFqU/maxresdefault.jpg',
            ],
        ];
    }
}
