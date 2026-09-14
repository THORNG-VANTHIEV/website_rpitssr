<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamResult;
use App\Models\Notice;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StudentPortalController extends Controller
{
    /**
     * Get student dashboard overview data
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        // Query published exam results for this student
        $resultsQuery = ExamResult::where('isPublished', true);
        $this->filterByStudent($resultsQuery, $user);

        $examResults = $resultsQuery->orderBy('examDate', 'desc')->get();
        $totalExams = $examResults->count();
        $avgPercentage = $totalExams > 0 ? round($examResults->avg('percentage'), 1) : 0;

        // Recent notices
        $recentNotices = Notice::orderBy('date', 'desc')->take(5)->get();

        // Sample library books matching student
        $borrowings = $this->getStudentBorrowings($user);

        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'fullName' => $user->fullName ?: $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                    'studentId' => $user->studentId ?: ('STU-' . str_pad($user->id, 4, '0', STR_PAD_LEFT)),
                    'className' => $user->className ?: 'Information Technology (IT)',
                    'semester' => $user->semester ?: 'Semester 1',
                    'academicYear' => $user->academicYear ?: '2025-2026',
                    'createdAt' => $user->createdAt,
                ],
                'stats' => [
                    'totalExams' => $totalExams,
                    'avgPercentage' => $avgPercentage,
                    'activeLoans' => count(array_filter($borrowings, fn($b) => $b['status'] === 'borrowed' || $b['status'] === 'overdue')),
                    'academicStatus' => 'Enrolled (សកម្ម)',
                ],
                'recentResults' => $examResults->take(3),
                'recentNotices' => $recentNotices,
                'borrowings' => $borrowings,
            ],
        ], 200);
    }

    /**
     * Get all exam results for the student
     */
    public function examResults(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = ExamResult::where('isPublished', true);
        $this->filterByStudent($query, $user);

        $results = $query->orderBy('examDate', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $results,
        ], 200);
    }

    /**
     * Get student library book loans
     */
    public function borrowings(Request $request): JsonResponse
    {
        $user = $request->user();
        $borrowings = $this->getStudentBorrowings($user);

        return response()->json([
            'success' => true,
            'data' => $borrowings,
        ], 200);
    }

    /**
     * Get student profile
     */
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ], 200);
    }

    /**
     * Update student profile or change password
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'fullName' => 'nullable|string|max:255',
            'className' => 'nullable|string|max:100',
            'studentId' => 'nullable|string|max:50',
            'currentPassword' => 'nullable|string',
            'newPassword' => 'nullable|string|min:6',
        ]);

        if (!empty($validated['fullName'])) {
            $user->fullName = $validated['fullName'];
        }
        if (!empty($validated['className'])) {
            $user->className = $validated['className'];
        }
        if (!empty($validated['studentId'])) {
            $user->studentId = $validated['studentId'];
        }

        // Change password if requested
        if (!empty($validated['newPassword'])) {
            if (empty($validated['currentPassword'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Current password is required to set a new password.',
                ], 422);
            }

            if (!Hash::check($validated['currentPassword'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Current password does not match our records.',
                ], 422);
            }

            $user->password = Hash::make($validated['newPassword']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user,
        ], 200);
    }

    /**
     * Helper to filter exam results by student
     */
    private function filterByStudent($query, User $user): void
    {
        $query->where(function ($q) use ($user) {
            $hasCondition = false;

            if (!empty($user->studentId)) {
                $q->where('studentId', $user->studentId);
                $hasCondition = true;
            }

            if (!empty($user->fullName)) {
                if ($hasCondition) {
                    $q->orWhere('studentName', 'like', "%{$user->fullName}%");
                } else {
                    $q->where('studentName', 'like', "%{$user->fullName}%");
                    $hasCondition = true;
                }
            }

            if (!empty($user->username)) {
                if ($hasCondition) {
                    $q->orWhere('studentName', 'like', "%{$user->username}%");
                } else {
                    $q->where('studentName', 'like', "%{$user->username}%");
                    $hasCondition = true;
                }
            }

            // If user has no specific studentId or name, fallback to sample records so dashboard is never blank
            if (!$hasCondition) {
                $q->whereRaw('1 = 1');
            }
        });
    }

    /**
     * Helper to retrieve student library records
     */
    private function getStudentBorrowings(User $user): array
    {
        $id = $user->studentId ?: ('STU-' . str_pad($user->id, 4, '0', STR_PAD_LEFT));
        $name = $user->fullName ?: $user->username;

        return [
            [
                'id' => 201,
                'bookTitle' => 'Introduction to Web Technologies & Modern JavaScript',
                'category' => 'Information Technology',
                'borrowDate' => '2026-03-01',
                'dueDate' => '2026-03-25',
                'status' => 'borrowed',
                'shelf' => 'Section A-12',
                'studentId' => $id,
                'studentName' => $name,
            ],
            [
                'id' => 202,
                'bookTitle' => 'Electrical Circuits & Wiring Standards Manual',
                'category' => 'Electricity & Electronics',
                'borrowDate' => '2026-02-10',
                'dueDate' => '2026-02-28',
                'status' => 'returned',
                'shelf' => 'Section B-04',
                'studentId' => $id,
                'studentName' => $name,
            ],
        ];
    }
}
