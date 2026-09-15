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
        $categories = CourseCategory::withCount('courses')
            ->with(['courses' => function ($query) {
                $query->select('id', 'title', 'categoryId', 'fee', 'duration', 'credit', 'semester', 'imageUrl');
            }])
            ->orderBy('name', 'asc')
            ->get();
        return response()->json($categories);
    }

    public function storeCourseCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
            'order' => 'nullable|integer',
        ]);

        if (empty($validated['slug']) && !empty($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }
        if (empty($validated['status'])) {
            $validated['status'] = 'active';
        }

        $category = CourseCategory::create($validated);
        $category->loadCount('courses');
        $category->load(['courses' => function ($query) {
            $query->select('id', 'title', 'categoryId', 'fee', 'duration', 'credit', 'semester', 'imageUrl');
        }]);
        return response()->json($category, 201);
    }

    public function updateCourseCategory(Request $request, $id): JsonResponse
    {
        $category = CourseCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
            'order' => 'nullable|integer',
        ]);

        if (empty($validated['slug']) && !empty($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $category->update($validated);
        $category->loadCount('courses');
        $category->load(['courses' => function ($query) {
            $query->select('id', 'title', 'categoryId', 'fee', 'duration', 'credit', 'semester', 'imageUrl');
        }]);
        return response()->json($category);
    }

    public function destroyCourseCategory($id): JsonResponse
    {
        $category = CourseCategory::findOrFail($id);
        
        if ($category->courses()->count() > 0) {
            return response()->json([
                'message' => 'មិនអាចលុបប្រភេទនេះបានទេ ពីព្រោះមានវគ្គសិក្សាកំពុងភ្ជាប់ជាមួយ។ សូមផ្លាស់ប្តូរប្រភេទវគ្គសិក្សាជាមុនសិន។ / Cannot delete category with associated courses. Please reassign courses first.'
            ], 422);
        }

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
