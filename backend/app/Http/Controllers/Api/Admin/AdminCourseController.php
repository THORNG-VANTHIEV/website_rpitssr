<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::with('category');

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $limit = (int) $request->input('limit', 100);
        $courses = $query->orderBy('createdAt', 'desc')->paginate($limit);

        return response()->json($courses->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $course = Course::with(['category', 'reviews'])->find($id);

        if (! $course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        return response()->json($course, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'imageUrl' => 'nullable|string',
            'description' => 'nullable|string',
            'overview' => 'nullable|string',
            'categoryId' => 'nullable|integer',
            'benefits' => 'nullable|string',
            'fee' => 'nullable|string',
            'duration' => 'nullable|string',
            'credit' => 'nullable|string',
            'semester' => 'nullable|string',
        ]);

        $course = Course::create($validated);

        return response()->json($course, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $course = Course::find($id);

        if (! $course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'imageUrl' => 'nullable|string',
            'description' => 'nullable|string',
            'overview' => 'nullable|string',
            'categoryId' => 'nullable|integer',
            'benefits' => 'nullable|string',
            'fee' => 'nullable|string',
            'duration' => 'nullable|string',
            'credit' => 'nullable|string',
            'semester' => 'nullable|string',
        ]);

        $course->update($validated);

        return response()->json($course, 200);
    }

    public function destroy($id): JsonResponse
    {
        $course = Course::find($id);

        if (! $course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully'], 200);
    }
}
