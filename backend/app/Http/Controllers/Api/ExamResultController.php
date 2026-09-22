<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamResultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ExamResult::where('isPublished', true);

        if ($request->has('courseName') && ! empty($request->courseName)) {
            $query->where('courseName', 'like', '%'.$request->courseName.'%');
        }

        if ($request->has('semester') && ! empty($request->semester)) {
            $query->where('semester', $request->semester);
        }

        if ($request->has('generation') && ! empty($request->generation)) {
            $query->where('generation', $request->generation);
        }

        if ($request->has('year') && ! empty($request->year)) {
            $query->where('year', $request->year);
        }

        if ($request->has('studentId') && ! empty($request->studentId)) {
            $query->where('studentId', 'like', '%'.$request->studentId.'%');
        }

        if ($request->has('search') && ! empty($request->search)) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('courseName', 'like', "%{$s}%")
                    ->orWhere('studentName', 'like', "%{$s}%")
                    ->orWhere('studentId', 'like', "%{$s}%")
                    ->orWhere('subject', 'like', "%{$s}%")
                    ->orWhere('className', 'like', "%{$s}%")
                    ->orWhere('examName', 'like', "%{$s}%");
            });
        }

        $query->orderBy('examDate', 'desc')->orderBy('id', 'desc');

        // Security: Bound page size to max 50 to prevent bulk scraping and memory exhaustion
        $limit = min(max((int) $request->input('limit', 25), 1), 50);
        $results = $query->paginate($limit);

        return response()->json($results->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $result = ExamResult::where('isPublished', true)->find($id);

        if (! $result) {
            return response()->json([
                'success' => false,
                'error' => 'Exam result not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ], 200);
    }

    public function filters(): JsonResponse
    {
        $courses = ExamResult::where('isPublished', true)->distinct()->pluck('courseName')->filter()->values();
        $semesters = ExamResult::where('isPublished', true)->distinct()->pluck('semester')->filter()->values();
        $generations = ExamResult::where('isPublished', true)->distinct()->pluck('generation')->filter()->values();
        $years = ExamResult::where('isPublished', true)->distinct()->pluck('year')->filter()->values();

        return response()->json([
            'success' => true,
            'data' => [
                'courses' => $courses,
                'semesters' => $semesters,
                'generations' => $generations,
                'years' => $years,
            ],
        ], 200);
    }
}
