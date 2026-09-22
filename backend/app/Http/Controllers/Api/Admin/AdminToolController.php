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

class AdminToolController extends Controller
{
    // ==========================================
    // BACKUPS (Secure Storage - Super Admin Only)
    // ==========================================
    public function getBackups(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        if (! $currentUser || ! $currentUser->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Only super administrators can access database backups.',
            ], 403);
        }

        $backups = Backup::orderBy('createdAt', 'desc')->get();

        return response()->json($backups);
    }

    public function createBackup(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        if (! $currentUser || ! $currentUser->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Only super administrators can create database backups.',
            ], 403);
        }

        return response()->json([
            'error' => 'On-demand backups are disabled until a protected backup provider is configured.',
        ], 503);
    }

    /**
     * Download backup securely (authenticated super admin only)
     */
    public function downloadBackup(Request $request, $id)
    {
        $currentUser = $request->user();
        if (! $currentUser || ! $currentUser->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Only super administrators can download database backups.',
            ], 403);
        }

        if (! config('backups.downloads_enabled')) {
            return response()->json([
                'error' => 'Backup downloads are disabled until protected backup storage is configured.',
            ], 503);
        }

        $backup = Backup::findOrFail($id);

        $securePath = $this->backupFilePath($backup);
        if ($securePath !== null) {
            return response()->download($securePath, $backup->fileName, [
                'Content-Type' => 'application/sql',
            ]);
        }

        return response()->json(['error' => 'Backup file not found on disk'], 404);
    }

    public function deleteBackup(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if (! $currentUser || ! $currentUser->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Only super administrators can delete database backups.',
            ], 403);
        }

        $backup = Backup::findOrFail($id);

        $securePath = $this->backupFilePath($backup);
        if ($securePath !== null) {
            unlink($securePath);
        }

        $backup->delete();

        return response()->json(['message' => 'Backup deleted successfully']);
    }

    // ==========================================
    // SYSTEM LOGS
    // ==========================================
    public function getLogs(Request $request): JsonResponse
    {
        $query = SystemLog::with('user');

        if ($request->has('level') && ! empty($request->level) && strtoupper($request->level) !== 'ALL') {
            $query->where('level', strtolower($request->level));
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%");
            });
        }

        $logs = $query->orderBy('createdAt', 'desc')->limit(100)->get();

        return response()->json($logs);
    }

    public function clearLogs(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        // Security: Only super administrators can clear system audit logs
        if (! $currentUser || ! $currentUser->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Only super administrators have permission to clear audit logs.',
            ], 403);
        }

        SystemLog::truncate();

        // Immediately record an audit trail event documenting who cleared the logs
        SystemLog::create([
            'level' => 'warning',
            'action' => 'LOGS_CLEARED',
            'message' => "System audit logs were cleared by administrator {$currentUser->username} (ID: {$currentUser->id})",
            'userId' => $currentUser->id,
            'ipAddress' => $request->ip(),
            'userAgent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'System logs cleared and audit event recorded successfully']);
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
        $promo->is_active = ! $promo->is_active;
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
        $comments->each(function ($comment) {
            $comment->makeVisible(['email', 'phone']);
        });

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
    // PLUGINS (Configuration Strictly Super Admin)
    // ==========================================
    public function getPlugins(): JsonResponse
    {
        $plugins = Plugin::orderBy('id', 'asc')->get();

        return response()->json($plugins);
    }

    public function togglePlugin(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if (! $currentUser || ! $currentUser->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Only super administrators can toggle system plugins.',
            ], 403);
        }

        $plugin = Plugin::findOrFail($id);
        $plugin->isActive = ! $plugin->isActive;
        $plugin->save();

        return response()->json([
            'success' => true,
            'message' => 'Plugin status updated successfully',
            'plugin' => $plugin,
        ]);
    }

    public function updatePluginConfig(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if (! $currentUser || ! $currentUser->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Only super administrators can update plugin configuration.',
            ], 403);
        }

        $plugin = Plugin::findOrFail($id);
        if ($request->has('configData')) {
            $plugin->configData = is_array($request->configData)
                ? json_encode($request->configData)
                : $request->configData;
        }
        $plugin->save();

        return response()->json([
            'success' => true,
            'message' => 'Plugin configuration saved successfully',
            'plugin' => $plugin,
        ]);
    }

    private function backupFilePath(Backup $backup): ?string
    {
        $fileName = $backup->fileName;
        if (! is_string($fileName) || ! preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:sql|sql\.gz)\z/', $fileName)) {
            return null;
        }

        $directory = storage_path('app/backups');
        $directoryPath = realpath($directory);
        $candidatePath = $directory.DIRECTORY_SEPARATOR.$fileName;
        $filePath = realpath($candidatePath);

        if (
            $directoryPath === false
            || $filePath === false
            || is_link($candidatePath)
            || ! is_file($filePath)
            || ! str_starts_with($filePath, $directoryPath.DIRECTORY_SEPARATOR)
        ) {
            return null;
        }

        return $filePath;
    }
}
