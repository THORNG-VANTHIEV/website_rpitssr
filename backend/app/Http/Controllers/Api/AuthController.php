<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register new user
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:3|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|in:student,sub_admin,admin',
            'studentId' => 'nullable|string',
            'fullName' => 'nullable|string',
            'className' => 'nullable|string',
            'semester' => 'nullable|string',
            'academicYear' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'username' => $request->input('username'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role' => $request->input('role', 'student'),
            'studentId' => $request->input('studentId'),
            'fullName' => $request->input('fullName'),
            'className' => $request->input('className'),
            'semester' => $request->input('semester'),
            'academicYear' => $request->input('academicYear'),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Email and password are required',
                'errors' => $validator->errors(),
            ], 400);
        }

        $user = User::where('email', $request->input('email'))->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'error' => 'Invalid credentials',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 200);
    }

    /**
     * Get current authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user(), 200);
    }

    /**
     * Verify token
     */
    public function verify(Request $request): JsonResponse
    {
        return response()->json([
            'valid' => true,
            'user' => $request->user(),
        ], 200);
    }

    /**
     * Admin verify
     */
    public function adminVerify(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isSubAdmin()) {
            return response()->json([
                'valid' => false,
                'error' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        return response()->json([
            'valid' => true,
            'user' => $user,
        ], 200);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ], 200);
    }
}
