<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminDocumentController extends Controller
{
    /**
     * Display a paginated listing of documents with summary metrics.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::query();

        // Search query
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title_km', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description_km', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        // Format filter
        if ($request->filled('format') && $request->input('format') !== 'all') {
            $query->where('file_type', strtolower($request->input('format')));
        }

        // Status filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('is_active', $request->input('status') === 'active');
        }

        // Summary metrics
        $metrics = [
            'total_documents' => Document::count(),
            'total_downloads' => (int) Document::sum('downloads_count'),
            'active_documents' => Document::where('is_active', true)->count(),
            'popular_documents' => Document::where('is_popular', true)->count(),
        ];

        $limit = (int) $request->input('limit', 50);
        $documents = $query->orderBy('order', 'asc')
                           ->orderBy('id', 'desc')
                           ->paginate($limit);

        return response()->json([
            'success' => true,
            'metrics' => $metrics,
            'data' => $documents->items(),
            'pagination' => [
                'total' => $documents->total(),
                'per_page' => $documents->perPage(),
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
            ],
        ], 200);
    }

    /**
     * Display the specified document.
     */
    public function show($id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json(['success' => false, 'error' => 'Document not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $document], 200);
    }

    /**
     * Store a newly created document.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_km' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:100',
            'category' => 'required|string|max:100',
            'file_type' => 'nullable|string|max:20',
            'file_size' => 'nullable|string|max:50',
            'file_path' => 'nullable|string|max:500',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip|max:25600',
            'description_km' => 'nullable|string',
            'description_en' => 'nullable|string',
            'submission_office' => 'nullable|string|max:255',
            'required_docs_km' => 'nullable',
            'required_docs_en' => 'nullable',
            'downloads_count' => 'nullable|integer',
            'is_popular' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        // Handle file upload if present
        if ($request->hasFile('file')) {
            $uploaded = $this->handleFileUpload($request->file('file'));
            $validated['file_path'] = $uploaded['url'];
            $validated['file_type'] = $uploaded['extension'];
            $validated['file_size'] = $uploaded['size'];
        }

        // Normalize JSON arrays for required_docs
        $validated['required_docs_km'] = $this->normalizeArrayInput($request->input('required_docs_km'));
        $validated['required_docs_en'] = $this->normalizeArrayInput($request->input('required_docs_en'));

        $document = Document::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Document created successfully',
            'data' => $document,
        ], 201);
    }

    /**
     * Update the specified document.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json(['success' => false, 'error' => 'Document not found'], 404);
        }

        $validated = $request->validate([
            'title_km' => 'sometimes|required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:100',
            'category' => 'sometimes|required|string|max:100',
            'file_type' => 'nullable|string|max:20',
            'file_size' => 'nullable|string|max:50',
            'file_path' => 'nullable|string|max:500',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip|max:25600',
            'description_km' => 'nullable|string',
            'description_en' => 'nullable|string',
            'submission_office' => 'nullable|string|max:255',
            'required_docs_km' => 'nullable',
            'required_docs_en' => 'nullable',
            'downloads_count' => 'nullable|integer',
            'is_popular' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        // Handle file upload if new file provided
        if ($request->hasFile('file')) {
            $uploaded = $this->handleFileUpload($request->file('file'));
            $validated['file_path'] = $uploaded['url'];
            $validated['file_type'] = $uploaded['extension'];
            $validated['file_size'] = $uploaded['size'];
        }

        // Normalize JSON arrays for required_docs
        if ($request->has('required_docs_km')) {
            $validated['required_docs_km'] = $this->normalizeArrayInput($request->input('required_docs_km'));
        }
        if ($request->has('required_docs_en')) {
            $validated['required_docs_en'] = $this->normalizeArrayInput($request->input('required_docs_en'));
        }

        $document->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Document updated successfully',
            'data' => $document,
        ], 200);
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroy($id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json(['success' => false, 'error' => 'Document not found'], 404);
        }

        // Attempt to clean up stored physical file if hosted locally
        if ($document->file_path && Str::startsWith($document->file_path, '/storage/uploads/documents/')) {
            $relativePath = Str::after($document->file_path, '/storage/');
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ], 200);
    }

    /**
     * Toggle the popular status of a document.
     */
    public function togglePopular($id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json(['success' => false, 'error' => 'Document not found'], 404);
        }

        $document->is_popular = !$document->is_popular;
        $document->save();

        return response()->json([
            'success' => true,
            'is_popular' => $document->is_popular,
            'message' => $document->is_popular ? 'Marked as popular' : 'Unmarked from popular',
        ], 200);
    }

    /**
     * Toggle the active status of a document.
     */
    public function toggleActive($id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json(['success' => false, 'error' => 'Document not found'], 404);
        }

        $document->is_active = !$document->is_active;
        $document->save();

        return response()->json([
            'success' => true,
            'is_active' => $document->is_active,
            'message' => $document->is_active ? 'Document activated' : 'Document deactivated',
        ], 200);
    }

    /**
     * Standalone file upload endpoint for documents.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip|max:25600',
        ]);

        $uploaded = $this->handleFileUpload($request->file('file'));

        return response()->json([
            'success' => true,
            'url' => $uploaded['url'],
            'filePath' => $uploaded['url'],
            'fileName' => $uploaded['original_name'],
            'fileSize' => $uploaded['size'],
            'fileType' => $uploaded['extension'],
        ], 200);
    }

    /**
     * Internal helper to store uploaded document file and calculate size.
     */
    protected function handleFileUpload($file): array
    {
        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension() ?: 'pdf');
        $rawBytes = $file->getSize();

        // Calculate human readable file size
        if ($rawBytes >= 1048576) {
            $formattedSize = number_format($rawBytes / 1048576, 1) . ' MB';
        } elseif ($rawBytes >= 1024) {
            $formattedSize = number_format($rawBytes / 1024, 0) . ' KB';
        } else {
            $formattedSize = $rawBytes . ' B';
        }

        $safeName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME));
        $uniqueFileName = $safeName . '_' . time() . '.' . $extension;

        Storage::disk('public')->putFileAs('uploads/documents', $file, $uniqueFileName);

        return [
            'url' => "/storage/uploads/documents/{$uniqueFileName}",
            'extension' => $extension,
            'size' => $formattedSize,
            'original_name' => $originalName,
        ];
    }

    /**
     * Helper to normalize array input from json strings or arrays.
     */
    protected function normalizeArrayInput($value): ?array
    {
        if (is_null($value)) {
            return null;
        }

        if (is_array($value)) {
            return array_values(array_filter($value, fn($item) => !empty(trim((string)$item))));
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                return array_values(array_filter($decoded, fn($item) => !empty(trim((string)$item))));
            }
            // If comma or newline separated
            $lines = preg_split('/[\r\n]+/', $value);
            return array_values(array_filter(array_map('trim', $lines), fn($item) => !empty($item)));
        }

        return null;
    }
}
