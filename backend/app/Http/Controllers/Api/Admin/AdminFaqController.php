<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFaqController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 50);
        $faqs = Faq::orderBy('order', 'asc')->paginate($limit);

        return response()->json($faqs->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $faq = Faq::find($id);

        if (!$faq) {
            return response()->json(['error' => 'FAQ not found'], 404);
        }

        return response()->json($faq, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'answer' => 'required|string',
            'order' => 'nullable|integer',
        ]);

        $faq = Faq::create($validated);

        return response()->json($faq, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (!$faq) {
            return response()->json(['error' => 'FAQ not found'], 404);
        }

        $validated = $request->validate([
            'question' => 'sometimes|required|string',
            'answer' => 'sometimes|required|string',
            'order' => 'nullable|integer',
        ]);

        $faq->update($validated);

        return response()->json($faq, 200);
    }

    public function destroy($id): JsonResponse
    {
        $faq = Faq::find($id);

        if (!$faq) {
            return response()->json(['error' => 'FAQ not found'], 404);
        }

        $faq->delete();

        return response()->json(['message' => 'FAQ deleted successfully'], 200);
    }
}
