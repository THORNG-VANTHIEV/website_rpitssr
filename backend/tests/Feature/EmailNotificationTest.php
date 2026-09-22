<?php

namespace Tests\Feature;

use App\Mail\AccountApprovedMail;
use App\Mail\AccountRejectedMail;
use App\Mail\AdmissionStatusUpdatedMail;
use App\Mail\AdmissionSubmittedMail;
use App\Models\Admission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_approving_user_dispatches_account_approved_mail(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create([
            'status' => 'pending',
            'email' => 'pending_student@example.test',
            'role' => 'student',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/users/{$user->id}/approve");

        $response->assertOk();
        $this->assertSame('active', $user->fresh()->status);

        Mail::assertSent(AccountApprovedMail::class, function (AccountApprovedMail $mail) use ($user): bool {
            return $mail->hasTo('pending_student@example.test')
                && $mail->user->id === $user->id;
        });
    }

    public function test_rejecting_user_dispatches_account_rejected_mail(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create([
            'status' => 'pending',
            'email' => 'rejected_student@example.test',
            'role' => 'student',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/users/{$user->id}/reject");

        $response->assertOk();
        $this->assertSame('rejected', $user->fresh()->status);

        Mail::assertSent(AccountRejectedMail::class, function (AccountRejectedMail $mail) use ($user): bool {
            return $mail->hasTo('rejected_student@example.test')
                && $mail->user->id === $user->id;
        });
    }

    public function test_submitting_admission_dispatches_admission_submitted_mail(): void
    {
        Mail::fake();

        $payload = [
            'khmerName' => 'សុខ តារា',
            'latinName' => 'Sok Dara',
            'gender' => 'male',
            'phone' => '012345678',
            'email' => 'applicant@example.test',
            'degreeLevel' => 'bachelor',
            'major' => 'Information Technology',
            'shift' => 'morning',
        ];

        $response = $this->postJson('/api/admissions/apply', $payload);

        $response->assertStatus(201);
        $trackingCode = $response->json('data.trackingCode');
        $this->assertNotEmpty($trackingCode);

        Mail::assertSent(AdmissionSubmittedMail::class, function (AdmissionSubmittedMail $mail) use ($trackingCode): bool {
            return $mail->hasTo('applicant@example.test')
                && $mail->admission->trackingCode === $trackingCode
                && $mail->admission->latinName === 'Sok Dara';
        });
    }

    public function test_updating_admission_status_dispatches_status_updated_mail(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $admission = Admission::create([
            'khmerName' => 'ចាន់ ធីតា',
            'latinName' => 'Chan Thida',
            'gender' => 'female',
            'phone' => '098765432',
            'email' => 'chanthida@example.test',
            'degreeLevel' => 'bachelor',
            'major' => 'Civil Engineering',
            'shift' => 'weekend',
            'trackingCode' => 'APP-2026-TESTCODE',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/admissions/{$admission->id}/status", [
            'status' => 'approved',
            'adminNotes' => 'ឯកសារត្រូវបានផ្ទៀងផ្ទាត់ត្រឹមត្រូវ',
        ]);

        $response->assertOk();
        $this->assertSame('approved', $admission->fresh()->status);

        Mail::assertSent(AdmissionStatusUpdatedMail::class, function (AdmissionStatusUpdatedMail $mail): bool {
            return $mail->hasTo('chanthida@example.test')
                && $mail->admission->status === 'approved'
                && $mail->admission->adminNotes === 'ឯកសារត្រូវបានផ្ទៀងផ្ទាត់ត្រឹមត្រូវ';
        });
    }

    public function test_enrolling_admission_applicant_dispatches_enrollment_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $admission = Admission::create([
            'khmerName' => 'មាស សុខា',
            'latinName' => 'Meas Sokha',
            'gender' => 'male',
            'phone' => '099887766',
            'email' => 'meassokha@example.test',
            'degreeLevel' => 'bachelor',
            'major' => 'Electrical Engineering',
            'shift' => 'morning',
            'trackingCode' => 'APP-2026-ENROLL01',
            'status' => 'approved',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/admissions/{$admission->id}/enroll");

        $response->assertStatus(201);
        $enrolledStudentId = $response->json('student.studentId');
        $this->assertNotEmpty($enrolledStudentId);

        Mail::assertSent(AdmissionStatusUpdatedMail::class, function (AdmissionStatusUpdatedMail $mail) use ($enrolledStudentId): bool {
            return $mail->hasTo('meassokha@example.test')
                && $mail->admission->status === 'enrolled'
                && $mail->admission->enrolledStudentId === $enrolledStudentId;
        });
    }

    public function test_mailables_render_institutional_khmer_templates_correctly(): void
    {
        $user = User::factory()->make([
            'fullName' => 'តេស្ត អ្នកប្រើប្រាស់',
            'username' => 'testuser',
            'email' => 'test@example.test',
            'role' => 'student',
        ]);

        $admission = new Admission([
            'khmerName' => 'កែវ វិចិត្រ',
            'latinName' => 'Keo Vichet',
            'trackingCode' => 'APP-2026-MAILTEST',
            'major' => 'Computer Science',
            'degreeLevel' => 'bachelor',
            'status' => 'approved',
            'adminNotes' => 'Congratulations!',
        ]);

        $approvedMail = new AccountApprovedMail($user);
        $rejectedMail = new AccountRejectedMail($user);
        $submittedMail = new AdmissionSubmittedMail($admission);
        $statusMail = new AdmissionStatusUpdatedMail($admission);

        $renderedApproved = $approvedMail->render();
        $renderedRejected = $rejectedMail->render();
        $renderedSubmitted = $submittedMail->render();
        $renderedStatus = $statusMail->render();

        $this->assertStringContainsString('វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប', $renderedApproved);
        $this->assertStringContainsString('គណនីត្រូវបានអនុម័ត', $renderedApproved);

        $this->assertStringContainsString('ការចុះឈ្មោះមិនត្រូវបានអនុម័តឡើយ', $renderedRejected);

        $this->assertStringContainsString('APP-2026-MAILTEST', $renderedSubmitted);
        $this->assertStringContainsString('បានទទួលពាក្យសុំចុះឈ្មោះចូលរៀន', $renderedSubmitted);

        $this->assertStringContainsString('APP-2026-MAILTEST', $renderedStatus);
        $this->assertStringContainsString('Congratulations!', $renderedStatus);
    }
}
