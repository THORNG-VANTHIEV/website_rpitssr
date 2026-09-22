<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
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
        // Security: Check if public registration is currently enabled in institutional settings
        $setting = Setting::first();
        if ($setting && $setting->enableRegistration === false) {
            return response()->json([
                'success' => false,
                'message' => 'ការចុះឈ្មោះត្រូវបានផ្អាកជាបណ្តោះអាសន្ន។ / Public registration is currently closed.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:3|max:255|unique:users,username',
            'email' => [
                'required',
                'email',
                'unique:users,email',
                'regex:/^[a-zA-Z0-9._%+-]+@rpitssr\.edu\.kh$/i',
            ],
            'password' => 'required|string|min:8',
            'fullName' => 'nullable|string',
            'className' => 'nullable|string',
            'semester' => 'nullable|string',
            'academicYear' => 'nullable|string',
        ], [
            'email.regex' => 'សូមប្រើប្រាស់គណនីអ៊ីមែលផ្លូវការរបស់វិទ្យាស្ថាន (@rpitssr.edu.kh) / Please use official institutional email (@rpitssr.edu.kh).',
            'email.unique' => 'អ៊ីមែលនេះមានក្នុងប្រព័ន្ធរួចហើយ។ / This email is already registered.',
            'username.unique' => 'ឈ្មោះអ្នកប្រើប្រាស់នេះមានក្នុងប្រព័ន្ធរួចហើយ។ / This username is already taken.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'username' => $request->input('username'),
            'email' => strtolower($request->input('email')),
            'password' => Hash::make($request->input('password')),
            'role' => 'student', // Security: Public registration is strictly restricted to students
            'status' => 'pending', // Security: Requires admin approval before login
            'studentId' => null, // Security: Official Student IDs are strictly assigned and verified by Registrar/Administration
            'fullName' => $request->input('fullName'),
            'className' => $request->input('className'),
            'semester' => $request->input('semester'),
            'academicYear' => $request->input('academicYear'),
        ]);

        return response()->json([
            'success' => true,
            'status' => 'pending',
            'message' => 'ការចុះឈ្មោះទទួលបានជោគជ័យ! គណនីរបស់អ្នកកំពុងរង់ចាំការត្រួតពិនិត្យ និងអនុម័តពីគណៈគ្រប់គ្រងសាលា។ / Registration successful! Your account is pending admin approval.',
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

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'error' => 'Invalid credentials',
            ], 401);
        }

        // Security: Check student account status
        if ($user->status === 'pending') {
            return response()->json([
                'success' => false,
                'status' => 'pending',
                'error' => 'គណនីរបស់អ្នកកំពុងរង់ចាំការត្រួតពិនិត្យ និងអនុម័តពីគណៈគ្រប់គ្រងសាលា (Pending Admin Approval)។ សូមទាក់ទងការិយាល័យសិក្សា ឬរង់ចាំការជូនដំណឹង។',
                'message' => 'គណនីរបស់អ្នកកំពុងរង់ចាំការត្រួតពិនិត្យ និងអនុម័តពីគណៈគ្រប់គ្រងសាលា (Pending Admin Approval)។ សូមទាក់ទងការិយាល័យសិក្សា ឬរង់ចាំការជូនដំណឹង។',
            ], 403);
        }

        if ($user->status === 'rejected') {
            return response()->json([
                'success' => false,
                'status' => 'rejected',
                'error' => 'គណនីនេះត្រូវបានបដិសេធ (Account Registration Rejected)។ សូមទាក់ទងការិយាល័យសិក្សាសម្រាប់ព័ត៌មានបន្ថែម។',
                'message' => 'គណនីនេះត្រូវបានបដិសេធ (Account Registration Rejected)។ សូមទាក់ទងការិយាល័យសិក្សាសម្រាប់ព័ត៌មានបន្ថែម។',
            ], 403);
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

        if (! $user || ! $user->isSubAdmin()) {
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
        $user = $request->user();
        if ($user && method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ], 200);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out of all devices successfully',
        ]);
    }
}
