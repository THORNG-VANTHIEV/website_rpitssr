<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminExamResultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ExamResult::query();

        if ($request->has('courseName') && ! empty($request->courseName)) {
            $query->where('courseName', $request->courseName);
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
            $query->where('studentId', $request->studentId);
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('studentName', 'like', "%{$search}%")
                    ->orWhere('studentId', 'like', "%{$search}%")
                    ->orWhere('courseName', 'like', "%{$search}%");
            });
        }

        $limit = (int) $request->input('limit', 100);
        $results = $query->orderBy('id', 'desc')->paginate($limit);

        return response()->json([
            'results' => $results->items(),
            'total' => $results->total(),
            'page' => $results->currentPage(),
            'pages' => $results->lastPage(),
        ], 200);
    }

    public function show($id): JsonResponse
    {
        $result = ExamResult::find($id);

        if (! $result) {
            return response()->json(['error' => 'Exam result not found'], 404);
        }

        return response()->json($result, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'courseName' => 'required|string|max:255',
            'semester' => 'required|string|max:50',
            'generation' => 'nullable|string|max:50',
            'year' => 'nullable|string',
            'examName' => 'nullable|string',
            'studentId' => 'nullable|string',
            'studentName' => 'nullable|string',
            'className' => 'nullable|string',
            'subject' => 'nullable|string',
            'totalMarks' => 'nullable|integer',
            'obtainedMarks' => 'nullable|integer',
            'percentage' => 'nullable|numeric',
            'grade' => 'nullable|string',
            'examDate' => 'nullable|date',
            'isPublished' => 'nullable|boolean',
            'remarks' => 'nullable|string',
            'resultImageUrl' => 'nullable|string',
            'resultPdfUrl' => 'nullable|string',
            'documentType' => 'nullable|string',
        ]);

        $validated['createdById'] = $request->user()->id;

        $result = ExamResult::create($validated);

        return response()->json($result, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $result = ExamResult::find($id);

        if (! $result) {
            return response()->json(['error' => 'Exam result not found'], 404);
        }

        $validated = $request->validate([
            'courseName' => 'sometimes|required|string|max:255',
            'semester' => 'sometimes|required|string|max:50',
            'generation' => 'nullable|string|max:50',
            'year' => 'nullable|string',
            'examName' => 'nullable|string',
            'studentId' => 'nullable|string',
            'studentName' => 'nullable|string',
            'className' => 'nullable|string',
            'subject' => 'nullable|string',
            'totalMarks' => 'nullable|integer',
            'obtainedMarks' => 'nullable|integer',
            'percentage' => 'nullable|numeric',
            'grade' => 'nullable|string',
            'examDate' => 'nullable|date',
            'isPublished' => 'nullable|boolean',
            'remarks' => 'nullable|string',
            'resultImageUrl' => 'nullable|string',
            'resultPdfUrl' => 'nullable|string',
            'documentType' => 'nullable|string',
        ]);

        $validated['lastUpdatedById'] = $request->user()->id;
        $validated['lastUpdatedAt'] = now();

        $result->update($validated);

        return response()->json($result, 200);
    }

    public function destroy($id): JsonResponse
    {
        $result = ExamResult::find($id);

        if (! $result) {
            return response()->json(['error' => 'Exam result not found'], 404);
        }

        $result->delete();

        return response()->json(['message' => 'Exam result deleted successfully'], 200);
    }
}
