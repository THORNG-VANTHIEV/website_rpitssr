<?php

namespace Tests\Feature;

use App\Models\PromotionalVideo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PromotionalVideoSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
        Http::fake();

        Sanctum::actingAs(User::create([
            'username' => 'video-editor',
            'email' => 'video-editor@example.test',
            'password' => 'strong-test-password',
            'role' => 'sub_admin',
        ]));
    }

    public function test_removed_metadata_endpoint_cannot_make_outbound_requests(): void
    {
        foreach ([
            'https://www.facebook.com/reel/123456',
            'http://127.0.0.1/internal',
            'http://169.254.169.254/latest/meta-data/',
            'https://facebook.com.attacker.example/video',
        ] as $url) {
            $this->postJson('/api/admin/promotional-videos/fetch-metadata', ['url' => $url])
                ->assertStatus(405);
        }

        Http::assertNothingSent();
    }

    public function test_creating_facebook_video_does_not_fetch_metadata_or_thumbnails(): void
    {
        $this->postJson('/api/admin/promotional-videos', [
            'title' => 'Campus activities',
            'video_url' => 'https://www.facebook.com/reel/123456',
            'thumbnail' => null,
        ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Campus activities')
            ->assertJsonPath('data.thumbnail', null);

        Http::assertNothingSent();
    }

    public function test_updating_facebook_video_does_not_fetch_metadata_or_thumbnails(): void
    {
        $video = PromotionalVideo::create([
            'title' => 'Original activities',
            'video_url' => 'https://www.facebook.com/reel/123456',
        ]);

        $this->putJson('/api/admin/promotional-videos/'.$video->id, [
            'title' => 'Updated activities',
            'video_url' => 'https://www.facebook.com/reel/654321',
            'thumbnail' => null,
        ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated activities')
            ->assertJsonPath('data.thumbnail', null);

        Http::assertNothingSent();
    }

    public function test_uploaded_thumbnail_and_youtube_thumbnail_urls_are_preserved_without_fetching(): void
    {
        $this->postJson('/api/admin/promotional-videos', [
            'title' => 'Campus tour',
            'video_url' => 'https://www.facebook.com/reel/123456',
            'thumbnail' => '/uploads/videos/campus.webp',
        ])
            ->assertCreated()
            ->assertJsonPath('data.thumbnail', '/uploads/videos/campus.webp');

        $this->postJson('/api/admin/promotional-videos', [
            'title' => 'Institute introduction',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ])
            ->assertCreated()
            ->assertJsonPath('data.youtube_id', 'dQw4w9WgXcQ')
            ->assertJsonPath('data.thumbnail', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');

        Http::assertNothingSent();
    }

    public function test_thumbnail_upload_rejects_non_images_and_oversized_files(): void
    {
        $this->postJson('/api/admin/promotional-videos/upload-thumbnail', [
            'thumbnail' => UploadedFile::fake()->create('script.php', 1, 'text/x-php'),
        ])->assertUnprocessable()->assertJsonValidationErrors('thumbnail');

        $this->postJson('/api/admin/promotional-videos/upload-thumbnail', [
            'thumbnail' => UploadedFile::fake()->create('large.jpg', 5121, 'image/jpeg'),
        ])->assertUnprocessable()->assertJsonValidationErrors('thumbnail');

        Http::assertNothingSent();
    }
}
