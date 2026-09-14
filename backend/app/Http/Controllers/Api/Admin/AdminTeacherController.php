<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTeacherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 50);
        $teachers = Teacher::orderBy('id', 'desc')->paginate($limit);

        return response()->json($teachers->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }

        return response()->json($teacher, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'imageUrl' => 'nullable|string',
            'designation' => 'nullable|string',
            'department' => 'nullable|string',
            'description' => 'nullable|string',
            'email' => 'nullable|email|unique:teachers,email',
            'phone' => 'nullable|string',
            'skype' => 'nullable|string',
            'facebook' => 'nullable|string',
            'twitter' => 'nullable|string',
            'instagram' => 'nullable|string',
            'linkedin' => 'nullable|string',
            'experience' => 'nullable|string',
            'educationalQualifications' => 'nullable|string',
            'achievements' => 'nullable|string',
        ]);

        $teacher = Teacher::create($validated);

        return response()->json($teacher, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'imageUrl' => 'nullable|string',
            'designation' => 'nullable|string',
            'department' => 'nullable|string',
            'description' => 'nullable|string',
            'email' => 'nullable|email|unique:teachers,email,' . $id,
            'phone' => 'nullable|string',
            'skype' => 'nullable|string',
            'facebook' => 'nullable|string',
            'twitter' => 'nullable|string',
            'instagram' => 'nullable|string',
            'linkedin' => 'nullable|string',
            'experience' => 'nullable|string',
            'educationalQualifications' => 'nullable|string',
            'achievements' => 'nullable|string',
        ]);

        $teacher->update($validated);

        return response()->json($teacher, 200);
    }

    public function destroy($id): JsonResponse
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }

        $teacher->delete();

        return response()->json(['message' => 'Teacher deleted successfully'], 200);
    }
}
