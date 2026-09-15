<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNoticeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notice::query();

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $limit = (int) $request->input('limit', 100);
        $notices = $query->orderBy('isPinned', 'desc')
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($limit);

        return response()->json($notices->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $notice = Notice::find($id);

        if (!$notice) {
            return response()->json(['error' => 'Notice not found'], 404);
        }

        return response()->json($notice, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string|max:100',
            'fileUrl' => 'nullable|string|max:500',
            'isPinned' => 'nullable|boolean',
            'date' => 'nullable|date',
        ]);

        if (empty($validated['date'])) {
            $validated['date'] = now()->toDateString();
        }

        if (empty($validated['category'])) {
            $validated['category'] = 'general';
        }

        $notice = Notice::create($validated);

        return response()->json($notice, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $notice = Notice::find($id);

        if (!$notice) {
            return response()->json(['error' => 'Notice not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'category' => 'nullable|string|max:100',
            'fileUrl' => 'nullable|string|max:500',
            'isPinned' => 'nullable|boolean',
            'date' => 'nullable|date',
        ]);

        $notice->update($validated);

        return response()->json($notice, 200);
    }

    public function destroy($id): JsonResponse
    {
        $notice = Notice::find($id);

        if (!$notice) {
            return response()->json(['error' => 'Notice not found'], 404);
        }

        $notice->delete();

        return response()->json(['message' => 'Notice deleted successfully'], 200);
    }
}
