<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\CourseCategory;
use App\Models\EventCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

        if (empty($validated['slug']) && ! empty($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
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

        if (empty($validated['slug']) && ! empty($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
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
                'message' => 'មិនអាចលុបប្រភេទនេះបានទេ ពីព្រោះមានវគ្គសិក្សាកំពុងភ្ជាប់ជាមួយ។ សូមផ្លាស់ប្តូរប្រភេទវគ្គសិក្សាជាមុនសិន។ / Cannot delete category with associated courses. Please reassign courses first.',
            ], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Course category deleted successfully']);
    }

    // Blog Categories
    public function getBlogCategories(): JsonResponse
    {
        $categories = BlogCategory::withCount('posts')
            ->with(['posts' => function ($query) {
                $query->select('id', 'title', 'slug', 'status', 'featured', 'categoryId', 'createdAt')
                    ->orderBy('createdAt', 'desc')
                    ->limit(5);
            }])
            ->orderBy('order', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($categories);
    }

    public function storeBlogCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
            'order' => 'nullable|integer',
        ]);

        if (empty($validated['slug']) && ! empty($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        if (empty($validated['status'])) {
            $validated['status'] = 'active';
        }

        $category = BlogCategory::create($validated);
        $category->loadCount('posts');

        return response()->json($category, 201);
    }

    public function updateBlogCategory(Request $request, $id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
            'order' => 'nullable|integer',
        ]);

        if (empty($validated['slug']) && ! empty($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);
        $category->loadCount('posts');

        return response()->json($category);
    }

    public function toggleBlogCategoryStatus($id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);
        $category->status = ($category->status === 'active') ? 'inactive' : 'active';
        $category->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'category' => $category,
            'status' => $category->status,
        ]);
    }

    public function destroyBlogCategory($id): JsonResponse
    {
        $category = BlogCategory::withCount('posts')->findOrFail($id);
        if ($category->posts_count > 0) {
            return response()->json([
                'error' => 'Cannot delete category that contains articles. Please reassign or delete articles first.',
                'posts_count' => $category->posts_count,
            ], 422);
        }
        $category->delete();

        return response()->json(['message' => 'Blog category deleted successfully']);
    }

    public function getEventCategories(): JsonResponse
    {
        $categories = EventCategory::withCount('events')
            ->with(['events' => function ($query) {
                $query->select('id', 'title', 'date', 'time', 'place', 'fee', 'imageUrl', 'category_id');
            }])
            ->orderBy('order', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($categories);
    }

    public function storeEventCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
            'order' => 'nullable|integer',
        ]);

        if (empty($validated['slug']) && ! empty($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        if (empty($validated['status'])) {
            $validated['status'] = 'active';
        }

        $category = EventCategory::create($validated);
        $category->loadCount('events');
        $category->load(['events' => function ($query) {
            $query->select('id', 'title', 'date', 'time', 'place', 'fee', 'imageUrl', 'category_id');
        }]);

        return response()->json($category, 201);
    }

    public function updateEventCategory(Request $request, $id): JsonResponse
    {
        $category = EventCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
            'order' => 'nullable|integer',
        ]);

        if (empty($validated['slug']) && ! empty($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);
        $category->loadCount('events');
        $category->load(['events' => function ($query) {
            $query->select('id', 'title', 'date', 'time', 'place', 'fee', 'imageUrl', 'category_id');
        }]);

        return response()->json($category);
    }

    public function destroyEventCategory($id): JsonResponse
    {
        $category = EventCategory::findOrFail($id);

        if ($category->events()->count() > 0) {
            return response()->json([
                'message' => 'មិនអាចលុបប្រភេទនេះបានទេ ពីព្រោះមានព្រឹត្តិការណ៍កំពុងភ្ជាប់ជាមួយ។ សូមផ្លាស់ប្តូរប្រភេទព្រឹត្តិការណ៍ជាមុនសិន។ / Cannot delete category with associated events. Please reassign events first.',
            ], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Event category deleted successfully']);
    }
}
