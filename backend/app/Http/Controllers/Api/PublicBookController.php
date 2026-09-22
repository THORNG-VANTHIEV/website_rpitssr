<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicBookCategoryResource;
use App\Http\Resources\PublicBookResource;
use App\Models\Book;
use App\Models\BookCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicBookController extends Controller
{
    private function catalogQuery(): Builder
    {
        return Book::query()
            ->select([
                'id', 'title_km', 'title_en', 'author', 'isbn', 'call_number',
                'category_id', 'publisher', 'publish_year', 'edition', 'language',
                'total_copies', 'available_copies', 'shelf_location', 'cover_image',
                'file_url', 'is_ebook', 'is_featured', 'status', 'description',
            ])
            ->with('category:id,name_km,name_en,code,shelf_location,description,is_active');
    }

    public function index(Request $request): JsonResponse
    {
        $query = $this->catalogQuery();

        if ($search = $request->input('search')) {
            $query->where(function (Builder $query) use ($search): void {
                $query->where('title_km', 'like', "%{$search}%")
                    ->orWhere('title_en', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%")
                    ->orWhere('call_number', 'like', "%{$search}%")
                    ->orWhere('shelf_location', 'like', "%{$search}%")
                    ->orWhere('publisher', 'like', "%{$search}%");
            });
        }

        $categoryId = $request->input('category_id');
        if ($categoryId && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        match ($request->input('availability')) {
            'available' => $query->where('available_copies', '>', 0),
            'unavailable' => $query->where('available_copies', '<=', 0),
            'ebook' => $query->where('is_ebook', true),
            default => null,
        };

        match ($request->input('sort_by', 'newest')) {
            'title_asc' => $query->orderBy('title_km'),
            'copies_desc' => $query->orderByDesc('total_copies'),
            'available_desc' => $query->orderByDesc('available_copies'),
            default => $query->orderByDesc('id'),
        };

        $limit = max(1, min((int) $request->input('limit', 100), 100));

        return response()->json(PublicBookResource::collection($query->limit($limit)->get())->resolve($request));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $book = $this->catalogQuery()->findOrFail($id);

        return response()->json((new PublicBookResource($book))->resolve($request));
    }

    public function categories(Request $request): JsonResponse
    {
        $categories = BookCategory::query()
            ->select(['id', 'name_km', 'name_en', 'code', 'shelf_location', 'description', 'is_active'])
            ->withCount('books')
            ->orderBy('id')
            ->get();

        return response()->json(PublicBookCategoryResource::collection($categories)->resolve($request));
    }
}
