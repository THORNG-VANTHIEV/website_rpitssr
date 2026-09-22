<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Teacher::query();

        if ($request->has('department') && ! empty($request->department)) {
            $query->where('department', $request->department);
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('designation', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%");
            });
        }

        $limit = (int) $request->input('limit', 20);
        $teachers = $query->paginate($limit);

        return response()->json($teachers->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $teacher = Teacher::find($id);

        if (! $teacher) {
            return response()->json([
                'success' => false,
                'error' => 'Teacher not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $teacher,
        ], 200);
    }
}
