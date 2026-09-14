<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GalleryImage::where('isActive', true);

        if ($request->has('category') && !empty($request->category)) {
            $query->where('category', $request->category);
        }

        $limit = (int) $request->input('limit', 50);
        $images = $query->orderBy('order', 'asc')->paginate($limit);

        return response()->json($images->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $image = GalleryImage::find($id);

        if (!$image) {
            return response()->json([
                'success' => false,
                'error' => 'Gallery image not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $image,
        ], 200);
    }
}
