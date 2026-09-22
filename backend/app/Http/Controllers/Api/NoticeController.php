<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 50);
        $notices = Notice::orderBy('isPinned', 'desc')->orderBy('date', 'desc')->paginate($limit);

        return response()->json($notices->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $notice = Notice::find($id);

        if (! $notice) {
            return response()->json([
                'success' => false,
                'error' => 'Notice not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $notice,
        ], 200);
    }
}
