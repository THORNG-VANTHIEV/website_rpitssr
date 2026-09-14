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
        $limit = (int) $request->input('limit', 20);
        $notices = Notice::orderBy('date', 'desc')->paginate($limit);

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
            'date' => 'nullable|date',
        ]);

        if (empty($validated['date'])) {
            $validated['date'] = now()->toDateString();
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
