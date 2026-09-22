<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 50);
        $offset = (int) $request->input('offset', 0);

        $faqs = Faq::orderBy('order', 'asc')
            ->skip($offset)
            ->take($limit)
            ->get();

        return response()->json($faqs, 200);
    }

    public function show($id): JsonResponse
    {
        $faq = Faq::find($id);

        if (! $faq) {
            return response()->json([
                'success' => false,
                'error' => 'FAQ not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $faq,
        ], 200);
    }
}
