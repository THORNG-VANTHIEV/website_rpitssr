<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScrollingBanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminScrollingBannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = ScrollingBanner::orderBy('order_index', 'asc')->get();

        return response()->json($banners, 200);
    }

    public function show($id): JsonResponse
    {
        $banner = ScrollingBanner::find($id);

        if (!$banner) {
            return response()->json(['error' => 'Banner not found'], 404);
        }

        return response()->json($banner, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'is_active' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
        ]);

        $banner = ScrollingBanner::create([
            'message' => $validated['message'],
            'is_active' => $validated['is_active'] ?? true,
            'order_index' => $validated['order_index'] ?? 0,
        ]);

        return response()->json($banner, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $banner = ScrollingBanner::find($id);

        if (!$banner) {
            return response()->json(['error' => 'Banner not found'], 404);
        }

        $validated = $request->validate([
            'message' => 'sometimes|required|string',
            'is_active' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
        ]);

        $banner->update($validated);

        return response()->json($banner, 200);
    }

    public function destroy($id): JsonResponse
    {
        $banner = ScrollingBanner::find($id);

        if (!$banner) {
            return response()->json(['error' => 'Banner not found'], 404);
        }

        $banner->delete();

        return response()->json(['message' => 'Banner deleted successfully'], 200);
    }

    public function toggle($id): JsonResponse
    {
        $banner = ScrollingBanner::find($id);

        if (!$banner) {
            return response()->json(['error' => 'Banner not found'], 404);
        }

        $banner->update([
            'is_active' => !$banner->is_active,
        ]);

        return response()->json([
            'success' => true,
            'data' => $banner,
            'message' => 'Banner status toggled',
        ], 200);
    }
}
