<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AdmissionStatusUpdatedMail;
use App\Models\Admission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AdminAdmissionController extends Controller
{
    /**
     * Get list of admission applications with metrics and filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Admission::query()->orderBy('createdAt', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('courseType')) {
            $query->where('courseType', $request->courseType);
        }

        if ($request->filled('degreeLevel')) {
            $query->where('degreeLevel', $request->degreeLevel);
        }

        if ($request->filled('major')) {
            $query->where('major', 'like', "%{$request->major}%");
        }

        if ($request->filled('search')) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('khmerName', 'like', "%{$s}%")
                    ->orWhere('latinName', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%")
                    ->orWhere('trackingCode', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $allAdmissions = Admission::all(['id', 'status', 'courseType', 'degreeLevel']);
        $metrics = [
            'total' => $allAdmissions->count(),
            'pending' => $allAdmissions->where('status', 'pending')->count(),
            'contacted' => $allAdmissions->where('status', 'contacted')->count(),
            'approved' => $allAdmissions->where('status', 'approved')->count(),
            'enrolled' => $allAdmissions->where('status', 'enrolled')->count(),
            'rejected' => $allAdmissions->where('status', 'rejected')->count(),
            'longTerm' => $allAdmissions->filter(fn ($a) => ($a->courseType ?? '') === 'long_term' || in_array($a->degreeLevel, ['bachelor', 'higher_diploma']))->count(),
            'shortTerm' => $allAdmissions->filter(fn ($a) => ($a->courseType ?? '') === 'short_term' || in_array($a->degreeLevel, ['tvet_short', 'short_course']))->count(),
        ];

        $perPage = $request->input('perPage', 50);
        $admissions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'metrics' => $metrics,
            'data' => $admissions->items(),
            'pagination' => [
                'currentPage' => $admissions->currentPage(),
                'lastPage' => $admissions->lastPage(),
                'total' => $admissions->total(),
                'perPage' => $admissions->perPage(),
            ],
        ], 200);
    }

    /**
     * Show single application details
     */
    public function show($id): JsonResponse
    {
        $admission = Admission::with('enrolledUser')->find($id);

        if (! $admission) {
            return response()->json([
                'success' => false,
                'message' => 'រកមិនឃើញពាក្យសុំនេះឡើយ / Admission application not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $admission,
        ], 200);
    }

    /**
     * Update application status and admin notes
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $admission = Admission::find($id);

        if (! $admission) {
            return response()->json([
                'success' => false,
                'message' => 'រកមិនឃើញពាក្យសុំនេះឡើយ / Admission application not found',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,contacted,approved,rejected,enrolled',
            'adminNotes' => 'nullable|string',
        ]);

        $admission->update($validated);

        try {
            if (! empty($admission->email)) {
                Mail::to($admission->email)->send(new AdmissionStatusUpdatedMail($admission));
            }
        } catch (\Throwable $e) {
            Log::warning("Failed to send admission status update email to {$admission->email}: ".$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'បានកែប្រែស្ថានភាពពាក្យសុំជោគជ័យ! / Status updated successfully!',
            'data' => $admission,
        ], 200);
    }

    /**
     * 1-Click Enroll Applicant into Official Student Account
     */
    public function enroll(Request $request, $id): JsonResponse
    {
        $admission = Admission::find($id);

        if (! $admission) {
            return response()->json([
                'success' => false,
                'message' => 'រកមិនឃើញពាក្យសុំនេះឡើយ / Admission application not found',
            ], 404);
        }

        // Auto-generate or accept student ID
        $year = date('Y');
        $studentId = $request->input('studentId');
        if (empty($studentId)) {
            $lastUser = User::where('studentId', 'like', "STU-{$year}-%")->orderBy('id', 'desc')->first();
            $nextSeq = 1;
            if ($lastUser && preg_match('/STU-\d{4}-(\d+)/', $lastUser->studentId, $matches)) {
                $nextSeq = intval($matches[1]) + 1;
            }
            $studentId = sprintf('STU-%s-%03d', $year, $nextSeq);
        }

        // Auto-generate username from Latin Name (e.g. "Sok Dara" -> "sok_dara")
        $baseUsername = Str::slug($admission->latinName ?: $admission->khmerName, '_');
        $username = $baseUsername;
        $counter = 1;
        while (User::where('username', $username)->exists()) {
            $username = "{$baseUsername}_{$counter}";
            $counter++;
        }

        // Auto-generate official email (e.g. "sok_dara@rpitssr.edu.kh")
        $email = $request->input('email');
        if (empty($email)) {
            $email = "{$username}@rpitssr.edu.kh";
        }

        // Initial default password
        $password = $request->input('password', 'Rpitssr@2026');

        // Create the user account with active status
        $user = User::create([
            'username' => $username,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'student',
            'status' => 'active',
            'studentId' => $studentId,
            'fullName' => $admission->khmerName.($admission->latinName ? " ({$admission->latinName})" : ''),
            'className' => $request->input('className', $admission->major),
            'semester' => $request->input('semester', '1'),
            'academicYear' => $request->input('academicYear', "{$year}-".($year + 1)),
        ]);

        // Link admission
        $admission->update([
            'status' => 'enrolled',
            'enrolledStudentId' => $studentId,
            'enrolledUserId' => $user->id,
            'adminNotes' => ($admission->adminNotes ? $admission->adminNotes."\n" : '')."Enrolled as student [{$studentId}] on ".date('Y-m-d H:i:s'),
        ]);

        try {
            $notifyEmail = ! empty($admission->email) ? $admission->email : $user->email;
            if (! empty($notifyEmail)) {
                Mail::to($notifyEmail)->send(new AdmissionStatusUpdatedMail($admission));
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to send admission enrollment email to notify recipient: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "បានចុះឈ្មោះបេក្ខជនជាផ្លូវការជោគជ័យ! អត្តលេខនិស្សិត ៖ {$studentId} / Successfully enrolled as official student!",
            'student' => $user,
            'admission' => $admission,
            'credentials' => [
                'studentId' => $studentId,
                'email' => $email,
                'username' => $username,
                'temporaryPassword' => $password,
            ],
        ], 201);
    }

    /**
     * Delete an admission record
     */
    public function destroy($id): JsonResponse
    {
        $admission = Admission::find($id);

        if (! $admission) {
            return response()->json([
                'success' => false,
                'message' => 'រកមិនឃើញពាក្យសុំនេះឡើយ / Admission application not found',
            ], 404);
        }

        $admission->delete();

        return response()->json([
            'success' => true,
            'message' => 'បានលុបពាក្យសុំដោយជោគជ័យ / Admission record deleted successfully',
        ], 200);
    }
}
