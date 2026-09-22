<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class YouTubeFeedSecurityTest extends TestCase
{
    use RefreshDatabase;

    private const FeedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC88b1w6PZ02seTQB1zkIDwQ';

    protected function setUp(): void
    {
        parent::setUp();

        Cache::forget('rpitssr_edu_youtube_latest_videos_v2');
        Http::preventStrayRequests();
    }

    public function test_video_feed_uses_only_the_fixed_https_youtube_url(): void
    {
        Http::fake([
            self::FeedUrl => Http::response($this->validFeed(), 200, ['Content-Type' => 'application/atom+xml']),
        ]);

        $this->getJson('/api/youtube-videos?feed_url=http://127.0.0.1/internal')
            ->assertOk()
            ->assertJsonPath('data.videos.0.id', 'dQw4w9WgXcQ');

        Http::assertSent(function (Request $request): bool {
            return $request->url() === self::FeedUrl;
        });
    }

    public function test_redirects_non_xml_and_oversized_feed_responses_use_safe_fallbacks(): void
    {
        foreach ([
            Http::response('', 302, ['Location' => 'https://example.test/']),
            Http::response('<html>not a feed</html>', 200, ['Content-Type' => 'text/html']),
            Http::response(str_repeat('x', 1048577), 200, ['Content-Type' => 'application/xml']),
        ] as $response) {
            Cache::forget('rpitssr_edu_youtube_latest_videos_v2');
            Http::fake([self::FeedUrl => $response]);

            $this->getJson('/api/youtube-videos')
                ->assertOk()
                ->assertJsonPath('data.videos.0.id', 'v7UHTRM4Qmo');
        }
    }

    private function validFeed(): string
    {
        return <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015">
    <entry>
        <yt:videoId>dQw4w9WgXcQ</yt:videoId>
        <title>Institute video</title>
        <published>2026-09-19T00:00:00+00:00</published>
        <description>Institute video description.</description>
    </entry>
</feed>
XML;
    }
}
