<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookBorrowing;
use App\Models\ExamResult;
use App\Models\Notice;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // Credit completion calculation
        $totalCredits = $user->totalCredits ?: (in_array(strtolower($user->degreeLevel ?? ''), ['higher_diploma', 'diploma']) ? 60 : 120);
        $passedExamsCount = $examResults->filter(function ($r) {
            $grade = strtoupper($r->grade ?? '');

            return $grade !== 'F' && $grade !== 'FAIL' && ($r->percentage ?? 0) >= 50;
        })->count();

        // Use stored completed credits if set, otherwise calculate based on passed exams (e.g. 3 credits/subject)
        $completedCredits = $user->completedCredits > 0
            ? $user->completedCredits
            : ($totalExams > 0 ? min($passedExamsCount * 3, $totalCredits) : 0);
        $creditPercentage = $totalCredits > 0 ? round(($completedCredits / $totalCredits) * 100, 1) : 0;

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
                    'khmerName' => $user->khmerName ?: ($user->fullName ?: $user->username),
                    'latinName' => $user->latinName ?: strtoupper($user->username),
                    'gender' => $user->gender ?: 'male',
                    'dob' => $user->dob ? ($user->dob instanceof \DateTimeInterface ? $user->dob->format('Y-m-d') : (string) $user->dob) : null,
                    'phone' => $user->phone ?: '',
                    'avatarUrl' => $user->avatarUrl,
                    'email' => $user->email,
                    'role' => $user->role,
                    'studentId' => $user->studentId ?: ('STU-'.str_pad($user->id, 4, '0', STR_PAD_LEFT)),
                    'className' => $user->className ?: 'Information Technology (IT)',
                    'semester' => $user->semester ?: '2',
                    'academicYear' => $user->academicYear ?: '2025-2026',
                    'generation' => $user->generation ?: '13',
                    'shift' => $user->shift ?: 'morning',
                    'room' => $user->room ?: 'Building B - Lab 3',
                    'faculty' => $user->faculty ?: 'ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាព័ត៌មាន',
                    'degreeLevel' => $user->degreeLevel ?: 'បរិញ្ញាបត្រ (Bachelor)',
                    'totalCredits' => $totalCredits,
                    'completedCredits' => $completedCredits,
                    'creditPercentage' => $creditPercentage,
                    'scholarshipType' => $user->scholarshipType ?: 'អាហារូបករណ៍ ១០០% TVET ឥតគិតថ្លៃ',
                    'academicStatus' => $user->status === 'active' ? 'កំពុងសិក្សា (Enrolled)' : 'សកម្ម',
                    'createdAt' => $user->createdAt,
                ],
                'stats' => [
                    'totalExams' => $totalExams,
                    'avgPercentage' => $avgPercentage,
                    'totalCredits' => $totalCredits,
                    'completedCredits' => $completedCredits,
                    'creditPercentage' => $creditPercentage,
                    'activeLoans' => count(array_filter($borrowings, fn ($b) => $b['status'] === 'borrowed' || $b['status'] === 'overdue')),
                    'attendanceRate' => '96.5%',
                    'academicStatus' => $user->status === 'active' ? 'កំពុងសិក្សា (Enrolled)' : 'សកម្ម',
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
            'phone' => 'nullable|string|max:50',
            'currentPassword' => 'nullable|string',
            'newPassword' => 'nullable|string|min:8',
        ]);

        if (! empty($validated['fullName'])) {
            $user->fullName = $validated['fullName'];
        }
        if (! empty($validated['className'])) {
            $user->className = $validated['className'];
        }
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }
        // Note: Official Student IDs are strictly issued and managed by Institute Administration/Registrar.
        // Students cannot self-assign or modify their studentId to prevent unauthorized identity switching.

        // Change password if requested
        if (! empty($validated['newPassword'])) {
            if (empty($validated['currentPassword'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Current password is required to set a new password.',
                ], 422);
            }

            if (! Hash::check($validated['currentPassword'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Current password does not match our records.',
                ], 422);
            }

            $user->password = Hash::make($validated['newPassword']);
        }

        $passwordChanged = $user->isDirty('password');

        DB::transaction(function () use ($user): void {
            $user->save();
        });

        return response()->json([
            'success' => true,
            'message' => $passwordChanged ? 'Password updated. Please sign in again.' : 'Profile updated successfully',
            'requiresReauthentication' => $passwordChanged,
            'data' => $user,
        ], 200);
    }

    /**
     * Helper to filter exam results by student
     * Enforces strict Student ID isolation: a student can ONLY view results matching their official studentId.
     */
    private function filterByStudent($query, User $user): void
    {
        // Security: Strict student ID binding.
        // A student can ONLY access records matching their official studentId assigned by the institute.
        // Changing URL parameters has zero effect because queries are locked to the authenticated user's ID.
        if (! empty($user->studentId)) {
            $query->where('studentId', $user->studentId);
        } else {
            // If student has no official student ID assigned by administration, return empty results.
            $query->whereRaw('0 = 1');
        }
    }

    /**
     * Helper to retrieve student library records safely from database
     */
    private function getStudentBorrowings(User $user): array
    {
        $borrowings = BookBorrowing::with(['book.category'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);

                if (! empty($user->studentId)) {
                    $q->orWhere(function ($legacyQuery) use ($user) {
                        $legacyQuery->whereNull('user_id')
                            ->where('student_id', $user->studentId);
                    });
                }
            })
            ->orderBy('id', 'desc')
            ->get();

        return $borrowings->map(function ($b) use ($user) {
            return [
                'id' => $b->id,
                'bookTitle' => $b->book?->title_km ?: ($b->book?->title_en ?: 'N/A'),
                'category' => $b->book?->category?->name_km ?: ($b->book?->category?->name_en ?: 'ទូទៅ'),
                'borrowDate' => $b->borrow_date?->format('Y-m-d') ?: (string) $b->borrow_date,
                'dueDate' => $b->due_date?->format('Y-m-d') ?: (string) $b->due_date,
                'returnDate' => $b->return_date?->format('Y-m-d') ?: (string) $b->return_date,
                'status' => $b->status,
                'shelf' => $b->book?->shelf_location ?: 'N/A',
                'studentId' => $user->studentId ?: ('STU-'.str_pad($user->id, 4, '0', STR_PAD_LEFT)),
                'studentName' => $user->fullName ?: $user->username,
            ];
        })->toArray();
    }
}
