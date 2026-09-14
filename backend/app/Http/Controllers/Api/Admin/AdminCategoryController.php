<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\CourseCategory;
use App\Models\EventCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    // Course Categories
    public function getCourseCategories(): JsonResponse
    {
        $categories = CourseCategory::withCount('courses')->orderBy('name', 'asc')->get();
        return response()->json($categories);
    }

    public function storeCourseCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $category = CourseCategory::create($validated);
        return response()->json($category, 201);
    }

    public function updateCourseCategory(Request $request, $id): JsonResponse
    {
        $category = CourseCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroyCourseCategory($id): JsonResponse
    {
        $category = CourseCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Course category deleted successfully']);
    }

    // Blog Categories
    public function getBlogCategories(): JsonResponse
    {
        $categories = BlogCategory::withCount('posts')->orderBy('name', 'asc')->get();
        return response()->json($categories);
    }

    public function storeBlogCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $category = BlogCategory::create($validated);
        return response()->json($category, 201);
    }

    public function updateBlogCategory(Request $request, $id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroyBlogCategory($id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Blog category deleted successfully']);
    }

    // Event Categories
    public function getEventCategories(): JsonResponse
    {
        $categories = EventCategory::withCount('events')->orderBy('name', 'asc')->get();
        return response()->json($categories);
    }

    public function storeEventCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category = EventCategory::create($validated);
        return response()->json($category, 201);
    }

    public function updateEventCategory(Request $request, $id): JsonResponse
    {
        $category = EventCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroyEventCategory($id): JsonResponse
    {
        $category = EventCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Event category deleted successfully']);
    }
}
