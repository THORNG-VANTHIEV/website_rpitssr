<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromotionalVideo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPromotionalVideoController extends Controller
{
    public function index(): JsonResponse
    {
        $videos = PromotionalVideo::orderBy('order_index', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $videos,
        ], 200);
    }

    public function show($id): JsonResponse
    {
        $video = PromotionalVideo::find($id);

        if (! $video) {
            return response()->json(['error' => 'Video not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $video,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'video_url' => 'required|string|max:500',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'thumbnail' => 'nullable|string|max:500',
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
            'published_date' => 'nullable|string|max:100',
        ]);

        $youtubeId = PromotionalVideo::extractYouTubeId($validated['video_url']);
        $thumbnail = $validated['thumbnail'] ?? null;

        if (! $thumbnail && $youtubeId) {
            $thumbnail = "https://img.youtube.com/vi/{$youtubeId}/maxresdefault.jpg";
        }

        $publishedDate = $validated['published_date'] ?? 'ថ្មីៗនេះ (ក្រោម ១ ខែ)';

        // If marked as featured, optionally unfeature others if we only want one main featured
        if (! empty($validated['is_featured'])) {
            PromotionalVideo::where('is_featured', true)->update(['is_featured' => false]);
        }

        $video = PromotionalVideo::create([
            'title' => $validated['title'],
            'video_url' => $validated['video_url'],
            'youtube_id' => $youtubeId,
            'description' => $validated['description'] ?? '',
            'category' => $validated['category'] ?? 'សកម្មភាពទូទៅ',
            'thumbnail' => $thumbnail,
            'is_featured' => $validated['is_featured'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'order_index' => $validated['order_index'] ?? 0,
            'published_date' => $publishedDate,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Video created successfully',
            'data' => $video,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $video = PromotionalVideo::find($id);

        if (! $video) {
            return response()->json(['error' => 'Video not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'video_url' => 'sometimes|required|string|max:500',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'thumbnail' => 'nullable|string|max:500',
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
            'published_date' => 'nullable|string|max:100',
        ]);

        if (isset($validated['video_url'])) {
            $youtubeId = PromotionalVideo::extractYouTubeId($validated['video_url']);
            $validated['youtube_id'] = $youtubeId;
            if (empty($validated['thumbnail']) && $youtubeId) {
                $validated['thumbnail'] = "https://img.youtube.com/vi/{$youtubeId}/maxresdefault.jpg";
            }
        }

        if (! empty($validated['is_featured'])) {
            PromotionalVideo::where('id', '!=', $id)->where('is_featured', true)->update(['is_featured' => false]);
        }

        $video->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Video updated successfully',
            'data' => $video,
        ], 200);
    }

    public function destroy($id): JsonResponse
    {
        $video = PromotionalVideo::find($id);

        if (! $video) {
            return response()->json(['error' => 'Video not found'], 404);
        }

        $video->delete();

        return response()->json([
            'success' => true,
            'message' => 'Video deleted successfully',
        ], 200);
    }

    public function toggle($id): JsonResponse
    {
        $video = PromotionalVideo::find($id);

        if (! $video) {
            return response()->json(['error' => 'Video not found'], 404);
        }

        $video->is_active = ! $video->is_active;
        $video->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => $video,
        ], 200);
    }

    /**
     * Manual Thumbnail Upload
     */
    public function uploadThumbnail(Request $request): JsonResponse
    {
        $request->validate([
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $rawExt = strtolower($file->extension() ?: $file->guessExtension() ?: 'jpg');
            $allowedExtensions = ['jpeg', 'jpg', 'png', 'webp'];
            $extension = in_array($rawExt, $allowedExtensions, true) ? $rawExt : 'jpg';
            $filename = 'thumb_'.time().'_'.uniqid().'.'.$extension;
            $dir = public_path('uploads/videos');
            if (! file_exists($dir)) {
                mkdir($dir, 0755, true);
            }
            $file->move($dir, $filename);
            $url = '/uploads/videos/'.$filename;

            // Also copy to frontend public directory
            $frontendDir = base_path('../frontend/public/uploads/videos');
            if (file_exists(base_path('../frontend/public'))) {
                if (! file_exists($frontendDir)) {
                    mkdir($frontendDir, 0755, true);
                }
                @copy($dir.'/'.$filename, $frontendDir.'/'.$filename);
            }

            return response()->json([
                'success' => true,
                'thumbnail_url' => $url,
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }
}
