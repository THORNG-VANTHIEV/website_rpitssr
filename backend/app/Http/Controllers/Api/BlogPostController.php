<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::with(['category', 'authorUser:id,username,fullName']);

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'published');
        }

        if ($request->has('categoryId') && !empty($request->categoryId)) {
            $query->where('categoryId', $request->categoryId);
        }

        if ($request->has('featured')) {
            $isFeatured = filter_var($request->featured, FILTER_VALIDATE_BOOLEAN);
            $query->where('featured', $isFeatured);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('tags', 'like', "%{$search}%");
            });
        }

        $page = (int) $request->input('page', 1);
        $limit = (int) $request->input('limit', 10);
        $total = $query->count();

        $posts = $query->orderBy('createdAt', 'desc')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'posts' => $posts,
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit),
            ],
        ], 200);
    }

    public function show($id): JsonResponse
    {
        $query = BlogPost::with(['category', 'authorUser:id,username,fullName', 'comments.replies', 'facebookEmbed']);
        $post = is_numeric($id) ? $query->find($id) : $query->where('slug', $id)->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'error' => 'Blog post not found',
            ], 404);
        }

        $post->increment('viewCount');

        return response()->json([
            'success' => true,
            'data' => $post,
        ], 200);
    }

    public function bySlug($slug): JsonResponse
    {
        $post = BlogPost::with(['category', 'authorUser:id,username,fullName', 'comments.replies', 'facebookEmbed'])
            ->where('slug', $slug)
            ->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'error' => 'Blog post not found',
            ], 404);
        }

        $post->increment('viewCount');

        return response()->json([
            'success' => true,
            'data' => $post,
        ], 200);
    }

    public function categories(): JsonResponse
    {
        $categories = BlogCategory::where('status', 'active')
            ->orderBy('order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ], 200);
    }
}
