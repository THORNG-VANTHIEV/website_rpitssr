<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBlogPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::with(['category', 'authorUser:id,username,fullName']);

        if ($request->has('status') && ! empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('categoryId') && ! empty($request->categoryId)) {
            $query->where('categoryId', $request->categoryId);
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $page = (int) $request->input('page', 1);
        $limit = (int) $request->input('limit', 100);
        $total = $query->count();

        $posts = $query->orderBy('featured', 'desc')
            ->orderBy('createdAt', 'desc')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return response()->json([
            'posts' => $posts,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit),
        ], 200);
    }

    public function show($id): JsonResponse
    {
        $post = BlogPost::with(['category', 'authorUser:id,username,fullName', 'comments'])->find($id);

        if (! $post) {
            return response()->json(['error' => 'Blog post not found'], 404);
        }

        return response()->json($post, 200);
    }

    public function toggleStatus(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        $post = BlogPost::find($id);
        if (! $post) {
            return response()->json(['error' => 'Blog post not found'], 404);
        }

        // Security: Sub-admins can only toggle status on their own articles
        if (! $currentUser->isAdmin() && (int) $post->authorId !== (int) $currentUser->id) {
            return response()->json(['error' => 'Unauthorized. You can only change status on your own articles.'], 403);
        }

        $newStatus = ($post->status === 'published') ? 'draft' : 'published';
        $post->update([
            'status' => $newStatus,
            'publishedAt' => ($newStatus === 'published' && ! $post->publishedAt) ? now() : $post->publishedAt,
        ]);

        return response()->json([
            'message' => 'Status updated successfully',
            'post' => $post,
            'status' => $post->status,
        ], 200);
    }

    public function toggleFeatured(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        $post = BlogPost::find($id);
        if (! $post) {
            return response()->json(['error' => 'Blog post not found'], 404);
        }

        // Security: Only super administrators can feature articles on homepage
        if (! $currentUser->isAdmin()) {
            return response()->json(['error' => 'Unauthorized. Only super administrators can feature articles.'], 403);
        }

        $post->update(['featured' => ! $post->featured]);

        return response()->json([
            'message' => 'Featured status updated successfully',
            'post' => $post,
            'featured' => $post->featured,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:blog_posts,slug',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'imageUrl' => 'nullable|string',
            'categoryId' => 'nullable|integer',
            'tags' => 'nullable|string',
            'status' => 'nullable|in:draft,published',
            'type' => 'nullable|in:normal,facebook',
            'featured' => 'nullable|boolean',
            'publishedAt' => 'nullable|date',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']).'-'.time();
        }

        $validated['authorId'] = $request->user()->id;
        $validated['author'] = $request->user()->fullName ?? $request->user()->username;

        $post = BlogPost::create($validated);

        return response()->json($post, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        $post = BlogPost::find($id);

        if (! $post) {
            return response()->json(['error' => 'Blog post not found'], 404);
        }

        // Security: Sub-admins can only modify their own articles
        if (! $currentUser->isAdmin() && (int) $post->authorId !== (int) $currentUser->id) {
            return response()->json(['error' => 'Unauthorized. You can only edit your own articles.'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|unique:blog_posts,slug,'.$id,
            'content' => 'sometimes|required|string',
            'excerpt' => 'nullable|string',
            'imageUrl' => 'nullable|string',
            'categoryId' => 'nullable|integer',
            'tags' => 'nullable|string',
            'status' => 'nullable|in:draft,published',
            'type' => 'nullable|in:normal,facebook',
            'featured' => 'nullable|boolean',
            'publishedAt' => 'nullable|date',
        ]);

        $post->update($validated);

        return response()->json($post, 200);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        $post = BlogPost::find($id);

        if (! $post) {
            return response()->json(['error' => 'Blog post not found'], 404);
        }

        // Security: Sub-admins can only delete their own articles
        if (! $currentUser->isAdmin() && (int) $post->authorId !== (int) $currentUser->id) {
            return response()->json(['error' => 'Unauthorized. You can only delete your own articles.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Blog post deleted successfully'], 200);
    }
}
