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

        // Security: Public API strictly serves published articles only
        $query->where('status', 'published');

        if ($request->has('categoryId') && ! empty($request->categoryId)) {
            $query->where('categoryId', $request->categoryId);
        }

        if ($request->has('featured')) {
            $isFeatured = filter_var($request->featured, FILTER_VALIDATE_BOOLEAN);
            $query->where('featured', $isFeatured);
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('tags', 'like', "%{$search}%");
            });
        }

        $page = (int) $request->input('page', 1);
        $limit = min(max((int) $request->input('limit', 10), 1), 50);
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
        // Security: Public readers can only view published posts and approved comments
        $query = BlogPost::with([
            'category',
            'authorUser:id,username,fullName',
            'comments' => function ($q) {
                $q->where(function ($sub) {
                    $sub->where('status', 'approved')->orWhereNull('status');
                })->whereNull('parentCommentId')
                    ->with(['replies' => function ($rq) {
                        $rq->where(function ($rsub) {
                            $rsub->where('status', 'approved')->orWhereNull('status');
                        });
                    }]);
            },
            'facebookEmbed',
        ])->where('status', 'published');

        $post = is_numeric($id) ? $query->find($id) : $query->where('slug', $id)->first();

        if (! $post) {
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
        // Security: Public readers can only view published posts and approved comments
        $post = BlogPost::with([
            'category',
            'authorUser:id,username,fullName',
            'comments' => function ($q) {
                $q->where(function ($sub) {
                    $sub->where('status', 'approved')->orWhereNull('status');
                })->whereNull('parentCommentId')
                    ->with(['replies' => function ($rq) {
                        $rq->where(function ($rsub) {
                            $rsub->where('status', 'approved')->orWhereNull('status');
                        });
                    }]);
            },
            'facebookEmbed',
        ])->where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (! $post) {
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
