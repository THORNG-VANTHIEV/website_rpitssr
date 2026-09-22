<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGalleryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GalleryImage::query();

        if ($request->has('category') && ! empty($request->category)) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $limit = (int) $request->input('limit', 100);
        $images = $query->orderBy('order', 'asc')->orderBy('id', 'desc')->paginate($limit);

        return response()->json($images->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $image = GalleryImage::find($id);

        if (! $image) {
            return response()->json(['error' => 'Gallery image not found'], 404);
        }

        return response()->json($image, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'imageUrl' => 'required|string',
            'category' => 'nullable|string',
            'isActive' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        $image = GalleryImage::create($validated);

        return response()->json($image, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $image = GalleryImage::find($id);

        if (! $image) {
            return response()->json(['error' => 'Gallery image not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'imageUrl' => 'sometimes|required|string',
            'category' => 'nullable|string',
            'isActive' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        $image->update($validated);

        return response()->json($image, 200);
    }

    public function destroy($id): JsonResponse
    {
        $image = GalleryImage::find($id);

        if (! $image) {
            return response()->json(['error' => 'Gallery image not found'], 404);
        }

        $image->delete();

        return response()->json(['message' => 'Gallery image deleted successfully'], 200);
    }
}
