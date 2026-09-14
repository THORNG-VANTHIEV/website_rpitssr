<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::query();

        if ($request->has('upcoming') && filter_var($request->upcoming, FILTER_VALIDATE_BOOLEAN)) {
            $query->where('date', '>=', now()->toDateString());
        }

        if ($request->has('past') && filter_var($request->past, FILTER_VALIDATE_BOOLEAN)) {
            $query->where('date', '<', now()->toDateString());
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('place', 'like', "%{$search}%");
            });
        }

        $limit = (int) $request->input('limit', 20);
        $events = $query->orderBy('date', 'desc')->paginate($limit);

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

    public function categories(): JsonResponse
    {
        $categories = EventCategory::where('status', 'active')
            ->orderBy('order', 'asc')
            ->get();

        return response()->json($categories, 200);
    }
}
