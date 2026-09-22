<?php

namespace Tests\Feature;

use App\Models\Admission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentExtendedProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_admission_enrollment_populates_all_extended_student_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $admission = Admission::create([
            'khmerName' => 'ថង វ៉ាន់ថី',
            'latinName' => 'THORNG VANTHEY',
            'gender' => 'male',
            'dob' => '2000-07-11',
            'phone' => '093794815',
            'email' => 'thorng.vanthey@example.test',
            'degreeLevel' => 'bachelor',
            'major' => 'ព័ត៌មានវិទ្យា (Information Technology)',
            'shift' => 'evening',
            'photoUrl' => '/uploads/admissions/vanthey_photo.jpg',
            'trackingCode' => 'APP-2026-EXTTEST01',
            'status' => 'approved',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/admissions/{$admission->id}/enroll", [
            'generation' => '13',
            'room' => 'ប្រាសាទព្រះខ័ន',
            'faculty' => 'មហាវិទ្យាល័យ វិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា',
        ]);

        $response->assertStatus(201);

        $studentUser = User::where('studentId', $response->json('student.studentId'))->first();
        $this->assertNotNull($studentUser);
        $this->assertSame('ថង វ៉ាន់ថី', $studentUser->khmerName);
        $this->assertSame('THORNG VANTHEY', $studentUser->latinName);
        $this->assertSame('2000-07-11', $studentUser->dob ? (is_string($studentUser->dob) ? $studentUser->dob : $studentUser->dob->format('Y-m-d')) : null);
        $this->assertSame('093794815', $studentUser->phone);
        $this->assertSame('13', $studentUser->generation);
        $this->assertSame('evening', $studentUser->shift);
        $this->assertSame('ប្រាសាទព្រះខ័ន', $studentUser->room);
        $this->assertSame('bachelor', $studentUser->degreeLevel);
        $this->assertSame(120, $studentUser->totalCredits);
    }

    public function test_student_dashboard_returns_credit_gauge_and_extended_identity(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
            'status' => 'active',
            'studentId' => 'BSR130154',
            'khmerName' => 'ថង វ៉ាន់ថី',
            'latinName' => 'THORNG VANTHEY',
            'generation' => '13',
            'semester' => '2',
            'academicYear' => '2021 - 2022',
            'shift' => 'evening',
            'room' => 'ប្រាសាទព្រះខ័ន',
            'degreeLevel' => 'បរិញ្ញាបត្រ',
            'faculty' => 'មហាវិទ្យាល័យ វិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា',
            'totalCredits' => 126,
            'completedCredits' => 126,
            'phone' => '093 794 815 / 018 325 04 73',
            'dob' => '2000-07-11',
        ]);

        Sanctum::actingAs($student);

        $response = $this->getJson('/api/student/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.student.studentId', 'BSR130154')
            ->assertJsonPath('data.student.khmerName', 'ថង វ៉ាន់ថី')
            ->assertJsonPath('data.student.latinName', 'THORNG VANTHEY')
            ->assertJsonPath('data.student.generation', '13')
            ->assertJsonPath('data.student.shift', 'evening')
            ->assertJsonPath('data.student.room', 'ប្រាសាទព្រះខ័ន')
            ->assertJsonPath('data.student.totalCredits', 126)
            ->assertJsonPath('data.student.completedCredits', 126)
            ->assertJsonPath('data.student.creditPercentage', 100)
            ->assertJsonPath('data.stats.totalCredits', 126)
            ->assertJsonPath('data.stats.completedCredits', 126);
    }

    public function test_student_cannot_tamper_with_student_id_or_institutional_fields(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
            'status' => 'active',
            'studentId' => 'STU-ORIGINAL',
            'totalCredits' => 120,
            'generation' => '13',
            'phone' => '012111222',
        ]);

        Sanctum::actingAs($student);

        $response = $this->putJson('/api/student/profile', [
            'fullName' => 'New Display Name',
            'phone' => '099333444',
            'studentId' => 'STU-HACKED-ID',
            'totalCredits' => 0,
            'generation' => '99',
        ]);

        $response->assertOk();

        $fresh = $student->fresh();
        $this->assertSame('STU-ORIGINAL', $fresh->studentId);
        $this->assertSame(120, $fresh->totalCredits);
        $this->assertSame('13', $fresh->generation);
        $this->assertSame('New Display Name', $fresh->fullName);
        $this->assertSame('099333444', $fresh->phone);
    }

    public function test_cannot_enroll_already_enrolled_admission(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $admission = Admission::create([
            'khmerName' => 'សុខ ចិន្តា',
            'latinName' => 'SOK CHINDA',
            'gender' => 'female',
            'dob' => '2001-05-20',
            'phone' => '012999888',
            'email' => 'sok.chinda@example.test',
            'degreeLevel' => 'bachelor',
            'major' => 'ព័ត៌មានវិទ្យា',
            'trackingCode' => 'APP-2026-CHINDA01',
            'status' => 'enrolled',
            'enrolledStudentId' => 'STU-2026-088',
            'enrolledUserId' => 999,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/admissions/{$admission->id}/enroll", [
            'generation' => '13',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('enrolledStudentId', 'STU-2026-088');
    }
}
