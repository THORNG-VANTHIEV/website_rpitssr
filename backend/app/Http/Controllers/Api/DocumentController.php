<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    /**
     * Display a listing of active documents.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::where('is_active', true);

        // Filter by category
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        // Filter by format/file_type
        if ($request->filled('format') && $request->input('format') !== 'all') {
            $query->where('file_type', strtolower($request->input('format')));
        }

        // Search in title, code, or description
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title_km', 'like', "%{$search}%")
                    ->orWhere('title_en', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description_km', 'like', "%{$search}%")
                    ->orWhere('description_en', 'like', "%{$search}%");
            });
        }

        // Ordering
        $documents = $query->orderBy('order', 'asc')
            ->orderBy('downloads_count', 'desc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $documents->count(),
            'data' => $documents,
        ], 200);
    }

    /**
     * Display the specified document.
     */
    public function show($id): JsonResponse
    {
        $document = Document::where('is_active', true)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('code', $id);
            })->first();

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => 'Document not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $document,
        ], 200);
    }

    /**
     * Increment download count when a user downloads the document.
     */
    public function incrementDownload($id): JsonResponse
    {
        $document = Document::where('is_active', true)->find($id);

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => 'Document not found',
            ], 404);
        }

        $document->increment('downloads_count');

        return response()->json([
            'success' => true,
            'downloads_count' => $document->downloads_count,
            'message' => 'Download count updated successfully',
        ], 200);
    }
}
