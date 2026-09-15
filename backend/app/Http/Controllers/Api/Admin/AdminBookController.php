<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCategory;
use App\Models\BookBorrowing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class AdminBookController extends Controller
{
    // ==========================================
    // BOOKS CRUD
    // ==========================================

    /**
     * Get all books with optional search, category filter, and sorting
     */
    public function getBooks(Request $request): JsonResponse
    {
        $query = Book::with('category');

        // Search query
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_km', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhere('call_number', 'like', "%{$search}%")
                  ->orWhere('shelf_location', 'like', "%{$search}%")
                  ->orWhere('publisher', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($catId = $request->input('category_id')) {
            if ($catId !== 'all') {
                $query->where('category_id', $catId);
            }
        }

        // Availability filter
        if ($avail = $request->input('availability')) {
            if ($avail === 'available') {
                $query->where('available_copies', '>', 0);
            } elseif ($avail === 'unavailable') {
                $query->where('available_copies', '<=', 0);
            } elseif ($avail === 'ebook') {
                $query->where('is_ebook', true);
            }
        }

        // Sort order
        $sortBy = $request->input('sort_by', 'newest');
        if ($sortBy === 'title_asc') {
            $query->orderBy('title_km', 'asc');
        } elseif ($sortBy === 'copies_desc') {
            $query->orderBy('total_copies', 'desc');
        } elseif ($sortBy === 'available_desc') {
            $query->orderBy('available_copies', 'desc');
        } else {
            $query->orderBy('id', 'desc');
        }

        $limit = (int) $request->input('limit', 100);
        $books = $query->limit($limit)->get();

        return response()->json($books);
    }

    /**
     * Get single book detail with recent borrowings
     */
    public function getBook($id): JsonResponse
    {
        $book = Book::with(['category', 'borrowings' => function ($q) {
            $q->orderBy('id', 'desc')->limit(10);
        }])->findOrFail($id);

        return response()->json($book);
    }

    /**
     * Store new book
     */
    public function storeBook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_km' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:100',
            'call_number' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:book_categories,id',
            'publisher' => 'nullable|string|max:255',
            'publish_year' => 'nullable|integer',
            'edition' => 'nullable|string|max:100',
            'language' => 'nullable|string|max:20',
            'total_copies' => 'required|integer|min:1',
            'available_copies' => 'nullable|integer|min:0',
            'shelf_location' => 'nullable|string|max:100',
            'cover_image' => 'nullable|string',
            'file_url' => 'nullable|string',
            'is_ebook' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if (!isset($validated['available_copies']) || $validated['available_copies'] === null) {
            $validated['available_copies'] = $validated['total_copies'];
        }

        // Clamp available copies to total copies
        if ($validated['available_copies'] > $validated['total_copies']) {
            $validated['available_copies'] = $validated['total_copies'];
        }

        $book = Book::create($validated);
        $book->load('category');

        return response()->json($book, 201);
    }

    /**
     * Update book
     */
    public function updateBook(Request $request, $id): JsonResponse
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title_km' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:100',
            'call_number' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:book_categories,id',
            'publisher' => 'nullable|string|max:255',
            'publish_year' => 'nullable|integer',
            'edition' => 'nullable|string|max:100',
            'language' => 'nullable|string|max:20',
            'total_copies' => 'required|integer|min:1',
            'available_copies' => 'nullable|integer|min:0',
            'shelf_location' => 'nullable|string|max:100',
            'cover_image' => 'nullable|string',
            'file_url' => 'nullable|string',
            'is_ebook' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if (isset($validated['total_copies']) && isset($validated['available_copies'])) {
            if ($validated['available_copies'] > $validated['total_copies']) {
                $validated['available_copies'] = $validated['total_copies'];
            }
        }

        $book->update($validated);
        $book->load('category');

        return response()->json($book);
    }

    /**
     * Delete book
     */
    public function deleteBook($id): JsonResponse
    {
        $book = Book::findOrFail($id);
        $book->delete();

        return response()->json([
            'success' => true,
            'message' => 'Book deleted successfully',
        ]);
    }

    /**
     * Upload cover image or book document
     */
    public function uploadCover(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:20480', // 20MB max
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $isPdf = $extension === 'pdf';
        
        $folder = $isPdf ? 'books/documents' : 'books/covers';
        $path = $file->store($folder, 'public');
        $url = Storage::url($path);

        return response()->json([
            'success' => true,
            'url' => $url,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $extension,
            'file_size' => $file->getSize(),
        ]);
    }

    // ==========================================
    // BOOK CATEGORIES CRUD
    // ==========================================

    public function getCategories(): JsonResponse
    {
        $categories = BookCategory::withCount('books')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($categories);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_km' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'shelf_location' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $category = BookCategory::create($validated);
        $category->books_count = 0;

        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, $id): JsonResponse
    {
        $category = BookCategory::findOrFail($id);

        $validated = $request->validate([
            'name_km' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'shelf_location' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($validated);
        $category->loadCount('books');

        return response()->json($category);
    }

    public function deleteCategory($id): JsonResponse
    {
        $category = BookCategory::findOrFail($id);
        
        // Disassociate books
        Book::where('category_id', $id)->update(['category_id' => null]);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Book category deleted successfully',
        ]);
    }

    // ==========================================
    // BORROWINGS / LOANS CRUD
    // ==========================================

    public function getBorrowings(Request $request): JsonResponse
    {
        $query = BookBorrowing::with('book');

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('student_name', 'like', "%{$search}%")
                  ->orWhere('student_id', 'like', "%{$search}%")
                  ->orWhereHas('book', function ($bq) use ($search) {
                      $bq->where('title_km', 'like', "%{$search}%")
                         ->orWhere('title_en', 'like', "%{$search}%");
                  });
            });
        }

        $borrowings = $query->orderBy('id', 'desc')->limit(100)->get();

        return response()->json($borrowings);
    }

    public function storeBorrowing(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'student_name' => 'required|string|max:255',
            'student_id' => 'required|string|max:100',
            'borrow_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:borrow_date',
            'notes' => 'nullable|string',
        ]);

        $book = Book::findOrFail($validated['book_id']);

        if ($book->available_copies <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Book is currently out of stock (no available copies)',
            ], 422);
        }

        // Decrement available copies
        $book->decrement('available_copies');

        $validated['status'] = 'borrowed';
        $borrowing = BookBorrowing::create($validated);
        $borrowing->load('book');

        return response()->json($borrowing, 201);
    }

    public function returnBorrowing(Request $request, $id): JsonResponse
    {
        $borrowing = BookBorrowing::findOrFail($id);

        if ($borrowing->status !== 'returned') {
            $borrowing->status = 'returned';
            $borrowing->return_date = Carbon::now()->toDateString();
            $borrowing->save();

            // Increment book available copies up to total_copies
            $book = Book::find($borrowing->book_id);
            if ($book && $book->available_copies < $book->total_copies) {
                $book->increment('available_copies');
            }
        }

        $borrowing->load('book');

        return response()->json([
            'success' => true,
            'message' => 'Book marked as returned successfully',
            'borrowing' => $borrowing,
        ]);
    }
}
