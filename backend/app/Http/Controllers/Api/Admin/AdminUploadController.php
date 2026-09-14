<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminUploadController extends Controller
{
    /**
     * Upload an image securely
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:10240', // max 10MB, strictly raster images
            'file' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf|max:20480', // max 20MB
            'subDir' => 'nullable|string|in:blog,courses,events,teachers,gallery,exam-results,settings,general',
        ]);

        $file = $request->file('image') ?? $request->file('file');

        if (!$file) {
            return response()->json([
                'success' => false,
                'error' => 'No file uploaded',
            ], 400);
        }

        $subDir = $request->input('subDir', 'general');
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::random(24) . '_' . time() . '.' . $extension;
        $filePath = "uploads/{$subDir}/{$fileName}";

        // Store file on public disk
        Storage::disk('public')->putFileAs("uploads/{$subDir}", $file, $fileName);

        $url = "/storage/{$filePath}";

        return response()->json([
            'success' => true,
            'url' => $url,
            'imageUrl' => $url,
            'fileName' => $fileName,
            'filePath' => $filePath,
        ], 200);
    }
}
