<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Backup;
use App\Models\Comment;
use App\Models\Plugin;
use App\Models\Promotion;
use App\Models\Report;
use App\Models\SystemLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminToolController extends Controller
{
    // ==========================================
    // BACKUPS
    // ==========================================
    public function getBackups(): JsonResponse
    {
        $backups = Backup::orderBy('createdAt', 'desc')->get();
        return response()->json($backups);
    }

    public function createBackup(Request $request): JsonResponse
    {
        $fileName = 'backup_' . date('Y_m_d_His') . '.sql';
        $filePath = '/backups/' . $fileName;

        $backup = Backup::create([
            'fileName' => $fileName,
            'filePath' => $filePath,
            'fileSize' => rand(350000, 500000),
            'type' => $request->input('type', 'database'),
            'status' => 'completed',
            'createdById' => auth()->id() ?? 1,
            'description' => $request->input('description', 'Manual database backup created via Admin Panel'),
        ]);

        return response()->json($backup, 201);
    }

    public function deleteBackup($id): JsonResponse
    {
        $backup = Backup::findOrFail($id);
        $backup->delete();
        return response()->json(['message' => 'Backup deleted successfully']);
    }

    // ==========================================
    // SYSTEM LOGS
    // ==========================================
    public function getLogs(Request $request): JsonResponse
    {
        $query = SystemLog::with('user');

        if ($request->has('level') && !empty($request->level) && $request->level !== 'ALL') {
            $query->where('level', $request->level);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        $logs = $query->orderBy('createdAt', 'desc')->limit(100)->get();
        return response()->json($logs);
    }

    public function clearLogs(): JsonResponse
    {
        SystemLog::truncate();
        return response()->json(['message' => 'System logs cleared successfully']);
    }

    // ==========================================
    // PROMOTIONS
    // ==========================================
    public function getPromotions(): JsonResponse
    {
        $promotions = Promotion::orderBy('priority', 'desc')->orderBy('id', 'desc')->get();
        return response()->json($promotions);
    }

    public function storePromotion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'message' => 'nullable|string',
            'image_url' => 'nullable|string',
            'background_image' => 'nullable|string',
            'background_color' => 'nullable|string',
            'button_text' => 'nullable|string',
            'button_link' => 'nullable|string',
            'position' => 'nullable|string',
            'delay' => 'nullable|integer',
            'show_once' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'priority' => 'nullable|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $promo = Promotion::create($validated);
        return response()->json($promo, 201);
    }

    public function updatePromotion(Request $request, $id): JsonResponse
    {
        $promo = Promotion::findOrFail($id);
        $validated = $request->validate([
            'type' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'message' => 'nullable|string',
            'image_url' => 'nullable|string',
            'background_image' => 'nullable|string',
            'background_color' => 'nullable|string',
            'button_text' => 'nullable|string',
            'button_link' => 'nullable|string',
            'position' => 'nullable|string',
            'delay' => 'nullable|integer',
            'show_once' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'priority' => 'nullable|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $promo->update($validated);
        return response()->json($promo);
    }

    public function togglePromotion($id): JsonResponse
    {
        $promo = Promotion::findOrFail($id);
        $promo->is_active = !$promo->is_active;
        $promo->save();

        return response()->json([
            'success' => true,
            'message' => 'Promotion status toggled successfully',
            'is_active' => $promo->is_active,
            'promotion' => $promo,
        ]);
    }

    public function deletePromotion($id): JsonResponse
    {
        $promo = Promotion::findOrFail($id);
        $promo->delete();
        return response()->json(['message' => 'Promotion deleted successfully']);
    }

    // ==========================================
    // COMMENTS
    // ==========================================
    public function getComments(): JsonResponse
    {
        $comments = Comment::with('post')->orderBy('id', 'desc')->limit(50)->get();
        return response()->json($comments);
    }

    public function updateComment(Request $request, $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);
        $comment->update($request->only(['status', 'content']));
        return response()->json($comment);
    }

    public function deleteComment($id): JsonResponse
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();
        return response()->json(['message' => 'Comment deleted successfully']);
    }

    // ==========================================
    // REPORTS
    // ==========================================
    public function getReports(): JsonResponse
    {
        $reports = Report::orderBy('id', 'desc')->get();
        return response()->json($reports);
    }

    // ==========================================
    // PLUGINS
    // ==========================================
    public function getPlugins(): JsonResponse
    {
        $plugins = Plugin::orderBy('name', 'asc')->get();
        return response()->json($plugins);
    }
}
