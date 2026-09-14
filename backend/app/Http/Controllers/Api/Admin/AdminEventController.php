<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminEventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 20);
        $events = Event::orderBy('date', 'desc')->paginate($limit);

        return response()->json($events->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        return response()->json($event, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'time' => 'nullable|string',
            'date' => 'required|date',
            'place' => 'nullable|string',
            'imageUrl' => 'nullable|string',
            'description' => 'nullable|string',
            'overview' => 'nullable|string',
            'speakers' => 'nullable|string',
            'schedule' => 'nullable|string',
            'fee' => 'nullable|string',
        ]);

        $event = Event::create($validated);

        return response()->json($event, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'time' => 'nullable|string',
            'date' => 'sometimes|required|date',
            'place' => 'nullable|string',
            'imageUrl' => 'nullable|string',
            'description' => 'nullable|string',
            'overview' => 'nullable|string',
            'speakers' => 'nullable|string',
            'schedule' => 'nullable|string',
            'fee' => 'nullable|string',
        ]);

        $event->update($validated);

        return response()->json($event, 200);
    }

    public function destroy($id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        $event->delete();

        return response()->json(['message' => 'Event deleted successfully'], 200);
    }
}
