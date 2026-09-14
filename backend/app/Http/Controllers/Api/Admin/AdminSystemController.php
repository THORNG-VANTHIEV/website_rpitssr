<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Backup;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminSystemController extends Controller
{
    public function getSummary(): JsonResponse
    {
        $dbHealth = 'healthy';
        try {
            DB::select('SELECT 1');
        } catch (\Exception $e) {
            $dbHealth = 'error';
        }

        $storageHealth = Storage::disk('public')->exists('.') ? 'healthy' : 'warning';

        $lastBackupRecord = Backup::orderBy('createdAt', 'desc')->first();
        $lastBackup = $lastBackupRecord ? $lastBackupRecord->createdAt->toIso8601String() : now()->subDay()->toIso8601String();

        return response()->json([
            'success' => true,
            'systemInfo' => [
                'lastBackup' => $lastBackup,
                'uptime' => 24,
                'version' => '1.0.0',
                'environment' => config('app.env', 'local'),
            ],
            'systemHealth' => [
                'database' => $dbHealth,
                'api' => 'healthy',
                'storage' => $storageHealth,
            ],
        ], 200);
    }
}
