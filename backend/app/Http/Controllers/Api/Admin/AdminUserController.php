<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AccountApprovedMail;
use App\Mail\AccountRejectedMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('role') && ! empty($request->role)) {
            $query->where('role', $request->role);
        }

        if ($request->has('status') && ! empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('fullName', 'like', "%{$search}%")
                    ->orWhere('studentId', 'like', "%{$search}%");
            });
        }

        $limit = (int) $request->input('limit', 100);
        $users = $query->orderBy('id', 'desc')->paginate($limit);

        return response()->json($users->items(), 200);
    }

    public function show($id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($user, 200);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Only administrators may manage user accounts.');

        $validated = $request->validate([
            'username' => 'required|string|min:3|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,teacher,sub_admin,admin',
            'status' => 'sometimes|in:pending,active,rejected',
            'studentId' => 'nullable|string',
            'fullName' => 'nullable|string',
            'className' => 'nullable|string',
            'semester' => 'nullable|string',
            'academicYear' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        if (! isset($validated['status'])) {
            $validated['status'] = 'active';
        }

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Only administrators may manage user accounts.');
        $user = User::find($id);

        if (! $user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'username' => 'sometimes|required|string|min:3|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|required|in:student,teacher,sub_admin,admin',
            'status' => 'sometimes|required|in:pending,active,rejected',
            'studentId' => 'nullable|string',
            'fullName' => 'nullable|string',
            'className' => 'nullable|string',
            'semester' => 'nullable|string',
            'academicYear' => 'nullable|string',
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        DB::transaction(function () use ($user, $validated): void {
            $user->update($validated);
        });

        return response()->json($user, 200);
    }

    public function approve(Request $request, $id): JsonResponse
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Only administrators may manage user accounts.');
        $user = User::find($id);

        if (! $user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->update(['status' => 'active']);

        try {
            if (! empty($user->email)) {
                Mail::to($user->email)->send(new AccountApprovedMail($user));
            }
        } catch (\Throwable $e) {
            Log::warning("Failed to send account approval email to {$user->email}: ".$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'បានអនុម័តគណនីជោគជ័យ! / User account approved successfully.',
            'user' => $user,
        ], 200);
    }

    public function reject(Request $request, $id): JsonResponse
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Only administrators may manage user accounts.');
        $user = User::find($id);

        if (! $user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->update(['status' => 'rejected']);

        try {
            if (! empty($user->email)) {
                Mail::to($user->email)->send(new AccountRejectedMail($user));
            }
        } catch (\Throwable $e) {
            Log::warning("Failed to send account rejection email to {$user->email}: ".$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'បានបដិសេធគណនី! / User account rejected.',
            'user' => $user,
        ], 200);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Only administrators may manage user accounts.');

        $currentUser = $request->user();

        // Security: Prevent self-deletion
        if ((int) $id === (int) $currentUser->id) {
            return response()->json([
                'error' => 'Action prohibited. You cannot delete your own logged-in account.',
            ], 422);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        DB::transaction(function () use ($user): void {
            $user->delete();
        });

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
