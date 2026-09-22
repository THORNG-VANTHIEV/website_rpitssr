<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::with('category')->orderBy('id', 'desc');

        if ($request->has('categoryId') && ! empty($request->categoryId)) {
            $query->where('categoryId', $request->categoryId);
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $limit = (int) $request->input('limit', 20);
        $courses = $query->paginate($limit);

        // Frontend expects direct courses array or standard paginated response
        return response()->json($courses->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $course = Course::with(['category', 'reviews.user'])->find($id);

        if (! $course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        return response()->json($course, 200);
    }

    public function categories(): JsonResponse
    {
        $categories = CourseCategory::where('status', 'active')
            ->orderBy('order', 'asc')
            ->get();

        return response()->json($categories, 200);
    }
}
