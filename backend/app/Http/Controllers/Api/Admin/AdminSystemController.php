<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Backup;
use App\Models\BlogPost;
use App\Models\Course;
use App\Models\Document;
use App\Models\Event;
use App\Models\ExamResult;
use App\Models\GalleryImage;
use App\Models\Notice;
use App\Models\Teacher;
use App\Models\User;
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
        $lastBackup = $lastBackupRecord && $lastBackupRecord->createdAt 
            ? $lastBackupRecord->createdAt->toIso8601String() 
            : now()->subDay()->toIso8601String();

        $counts = [
            'courses' => Course::count(),
            'teachers' => Teacher::count(),
            'users' => User::count(),
            'students' => User::where('role', 'student')->count(),
            'staff' => User::whereIn('role', ['admin', 'sub_admin'])->count(),
            'examResults' => ExamResult::count(),
            'documents' => Document::count(),
            'notices' => Notice::count(),
            'events' => Event::count(),
            'blogPosts' => BlogPost::count(),
            'galleryImages' => GalleryImage::count(),
        ];

        $recentNotices = Notice::orderBy('id', 'desc')->take(5)->get();
        $recentExamResults = ExamResult::orderBy('id', 'desc')->take(5)->get();
        $recentUsers = User::orderBy('id', 'desc')->take(5)->get(['id', 'username', 'email', 'role', 'fullName', 'studentId', 'createdAt']);

        return response()->json([
            'success' => true,
            'counts' => $counts,
            'recentActivity' => [
                'notices' => $recentNotices,
                'examResults' => $recentExamResults,
                'users' => $recentUsers,
            ],
            'systemInfo' => [
                'lastBackup' => $lastBackup,
                'uptime' => 24,
                'version' => '1.2.0',
                'environment' => config('app.env', 'production'),
                'phpVersion' => phpversion(),
                'laravelVersion' => app()->version(),
            ],
            'systemHealth' => [
                'database' => $dbHealth,
                'api' => 'healthy',
                'storage' => $storageHealth,
            ],
        ], 200);
    }
}
