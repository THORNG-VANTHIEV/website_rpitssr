<?php

namespace Tests\Feature;

use App\Models\Admission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AccountSecurityTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('roles')]
    public function test_sub_admin_cannot_create_any_user_role(string $role): void
    {
        $actor = User::factory()->create(['role' => 'sub_admin']);

        $this->requestWithToken($actor->createToken('test')->plainTextToken, 'POST', '/api/admin/users', [
            'username' => 'new-account',
            'email' => 'new-account@example.test',
            'password' => 'new-secure-password',
            'role' => $role,
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'new-account@example.test']);
    }

    #[DataProvider('roleTransitions')]
    public function test_sub_admin_cannot_change_roles(string $fromRole, string $toRole): void
    {
        $actor = User::factory()->create(['role' => 'sub_admin']);
        $target = User::factory()->create(['role' => $fromRole]);

        $this->requestWithToken($actor->createToken('test')->plainTextToken, 'PUT', '/api/admin/users/'.$target->id, [
            'role' => $toRole,
        ])->assertForbidden();

        $this->assertSame($fromRole, $target->fresh()->role);
    }

    public function test_sub_admin_cannot_update_itself_reset_passwords_or_delete_students(): void
    {
        $actor = User::factory()->create(['role' => 'sub_admin']);
        $target = User::factory()->create(['role' => 'student']);
        $token = $actor->createToken('test')->plainTextToken;

        $this->requestWithToken($token, 'PUT', '/api/admin/users/'.$actor->id, ['role' => 'admin'])->assertForbidden();
        $this->requestWithToken($token, 'PUT', '/api/admin/users/'.$target->id, ['password' => 'reset-password'])->assertForbidden();
        $this->requestWithToken($token, 'DELETE', '/api/admin/users/'.$target->id)->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $target->id]);
        $this->assertTrue(Hash::check('password', $target->fresh()->password));
        $this->requestWithToken($token, 'GET', '/api/admin/users')->assertOk();
    }

    #[DataProvider('roleTransitions')]
    public function test_admin_can_change_roles_and_revokes_only_target_tokens(string $fromRole, string $toRole): void
    {
        $actor = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => $fromRole]);
        $adminToken = $actor->createToken('admin')->plainTextToken;
        $firstToken = $target->createToken('first-device')->plainTextToken;
        $secondToken = $target->createToken('second-device')->plainTextToken;

        $this->requestWithToken($adminToken, 'PUT', '/api/admin/users/'.$target->id, [
            'role' => $toRole,
        ])->assertOk()->assertJsonPath('role', $toRole);

        $this->assertSame(0, $target->tokens()->count());
        $this->requestWithToken($firstToken, 'GET', '/api/auth/me')->assertUnauthorized();
        $this->requestWithToken($secondToken, 'GET', '/api/auth/me')->assertUnauthorized();
        $this->requestWithToken($adminToken, 'GET', '/api/auth/me')->assertOk();
    }

    #[DataProvider('roles')]
    public function test_admin_can_create_all_supported_user_roles(string $role): void
    {
        $actor = User::factory()->create(['role' => 'admin']);

        $this->requestWithToken($actor->createToken('test')->plainTextToken, 'POST', '/api/admin/users', [
            'username' => 'new-account',
            'email' => 'new-account@example.test',
            'password' => 'new-secure-password',
            'role' => $role,
        ])->assertCreated()->assertJsonPath('role', $role)->assertJsonMissingPath('password');
    }

    public function test_admin_password_reset_revokes_every_target_token(): void
    {
        $actor = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'student']);
        $tokens = [
            $target->createToken('first-device')->plainTextToken,
            $target->createToken('second-device')->plainTextToken,
        ];

        $this->requestWithToken($actor->createToken('admin')->plainTextToken, 'PUT', '/api/admin/users/'.$target->id, [
            'password' => 'replacement-password',
        ])->assertOk();

        foreach ($tokens as $token) {
            $this->requestWithToken($token, 'GET', '/api/auth/me')->assertUnauthorized();
        }

        $this->assertTrue(Hash::check('replacement-password', $target->fresh()->password));
    }

    public function test_student_password_change_revokes_every_token_and_allows_new_login(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $currentToken = $student->createToken('current-device')->plainTextToken;
        $otherToken = $student->createToken('other-device')->plainTextToken;

        $this->requestWithToken($currentToken, 'PUT', '/api/student/profile', [
            'currentPassword' => 'password',
            'newPassword' => 'replacement-password',
        ])->assertOk()->assertJsonPath('requiresReauthentication', true);

        $this->requestWithToken($currentToken, 'GET', '/api/auth/me')->assertUnauthorized();
        $this->requestWithToken($otherToken, 'GET', '/api/auth/me')->assertUnauthorized();

        $this->requestWithToken('', 'POST', '/api/auth/login', [
            'email' => $student->email,
            'password' => 'password',
        ])->assertUnauthorized();

        $login = $this->requestWithToken('', 'POST', '/api/auth/login', [
            'email' => $student->email,
            'password' => 'replacement-password',
        ])->assertOk();

        $this->requestWithToken($login->json('token'), 'GET', '/api/auth/me')->assertOk();
    }

    public function test_failed_password_change_preserves_password_and_tokens(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('test')->plainTextToken;

        $this->requestWithToken($token, 'PUT', '/api/student/profile', [
            'currentPassword' => 'wrong-password',
            'newPassword' => 'replacement-password',
        ])->assertUnprocessable();

        $this->assertTrue(Hash::check('password', $student->fresh()->password));
        $this->requestWithToken($token, 'GET', '/api/auth/me')->assertOk();
    }

    public function test_ordinary_profile_update_preserves_tokens_and_cannot_set_privilege_or_student_id(): void
    {
        $student = User::factory()->create(['role' => 'student', 'studentId' => 'STUDENT-001']);
        $token = $student->createToken('test')->plainTextToken;

        $this->requestWithToken($token, 'PUT', '/api/student/profile', [
            'fullName' => 'Updated Name',
            'role' => 'admin',
            'studentId' => 'OTHER-STUDENT',
        ])->assertOk()->assertJsonPath('requiresReauthentication', false);

        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'fullName' => 'Updated Name',
            'role' => 'student',
            'studentId' => 'STUDENT-001',
        ]);
        $this->requestWithToken($token, 'GET', '/api/auth/me')->assertOk();
    }

    public function test_admin_non_sensitive_update_and_unchanged_role_preserve_tokens(): void
    {
        $actor = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('test')->plainTextToken;

        $this->requestWithToken($actor->createToken('admin')->plainTextToken, 'PUT', '/api/admin/users/'.$student->id, [
            'fullName' => 'Updated Name',
            'role' => 'student',
            'password' => '',
        ])->assertOk();

        $this->requestWithToken($token, 'GET', '/api/auth/me')->assertOk();
    }

    public function test_deleting_account_removes_its_tokens(): void
    {
        $actor = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('test')->plainTextToken;

        $this->requestWithToken($actor->createToken('admin')->plainTextToken, 'DELETE', '/api/admin/users/'.$student->id)->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $student->id]);
        $this->assertSame(0, $student->tokens()->count());
        $this->requestWithToken($token, 'GET', '/api/auth/me')->assertUnauthorized();
    }

    public function test_current_device_logout_leaves_other_devices_logged_in(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $currentToken = $student->createToken('current-device')->plainTextToken;
        $otherToken = $student->createToken('other-device')->plainTextToken;

        $this->requestWithToken($currentToken, 'POST', '/api/auth/logout')->assertOk();

        $this->requestWithToken($currentToken, 'GET', '/api/auth/me')->assertUnauthorized();
        $this->requestWithToken($otherToken, 'GET', '/api/auth/me')->assertOk();
    }

    public function test_all_devices_logout_revokes_every_device(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $currentToken = $student->createToken('current-device')->plainTextToken;
        $otherToken = $student->createToken('other-device')->plainTextToken;

        $this->requestWithToken($currentToken, 'POST', '/api/auth/logout-all')->assertOk();

        $this->requestWithToken($currentToken, 'GET', '/api/auth/me')->assertUnauthorized();
        $this->requestWithToken($otherToken, 'GET', '/api/auth/me')->assertUnauthorized();
    }

    public function test_public_registration_cannot_assign_privilege_or_claim_official_student_identity(): void
    {
        $this->postJson('/api/auth/register', [
            'username' => 'new-student',
            'email' => 'student@rpitssr.edu.kh',
            'password' => 'new-secure-password',
            'role' => 'admin',
            'studentId' => 'ANOTHER-STUDENT-ID',
        ])->assertCreated()->assertJsonPath('user.role', 'student');

        $this->assertDatabaseHas('users', [
            'email' => 'student@rpitssr.edu.kh',
            'role' => 'student',
            'studentId' => null,
        ]);
    }

    public function test_pending_student_cannot_login_until_approved_by_admin(): void
    {
        // 1. Student submits registration
        $this->postJson('/api/auth/register', [
            'username' => 'unapproved-student',
            'email' => 'unapproved@rpitssr.edu.kh',
            'password' => 'secret123456',
        ])->assertCreated()->assertJsonPath('status', 'pending');

        // 2. Attempt to login without admin acceptance -> Blocked with 403 Forbidden
        $this->postJson('/api/auth/login', [
            'email' => 'unapproved@rpitssr.edu.kh',
            'password' => 'secret123456',
        ])->assertForbidden()
            ->assertJsonPath('status', 'pending');

        // 3. Administrator approves the student account
        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $admin->createToken('admin')->plainTextToken;
        $student = User::where('email', 'unapproved@rpitssr.edu.kh')->first();

        $this->requestWithToken($adminToken, 'PUT', "/api/admin/users/{$student->id}/approve")
            ->assertOk();

        // 4. Student can now log in successfully and receive authentication token
        $loginRes = $this->postJson('/api/auth/login', [
            'email' => 'unapproved@rpitssr.edu.kh',
            'password' => 'secret123456',
        ])->assertOk();

        $this->assertNotEmpty($loginRes->json('token'));
    }

    public function test_admin_cannot_demote_or_deactivate_self(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $adminToken = $admin->createToken('admin')->plainTextToken;

        // 1. Attempt to demote self to student -> Blocked with 422
        $demoteRes = $this->requestWithToken($adminToken, 'PUT', "/api/admin/users/{$admin->id}", [
            'role' => 'student',
        ]);
        $demoteRes->assertStatus(422)
            ->assertJson(['error' => 'Action prohibited. You cannot demote your own administrator account.']);
        $this->assertSame('admin', $admin->fresh()->role);

        // 2. Attempt to deactivate self -> Blocked with 422
        $deactivateRes = $this->requestWithToken($adminToken, 'PUT', "/api/admin/users/{$admin->id}", [
            'status' => 'rejected',
        ]);
        $deactivateRes->assertStatus(422)
            ->assertJson(['error' => 'Action prohibited. You cannot deactivate your own administrator account.']);
        $this->assertSame('active', $admin->fresh()->status);

        // 3. Updating normal profile fields (fullName) succeeds
        $this->requestWithToken($adminToken, 'PUT', "/api/admin/users/{$admin->id}", [
            'fullName' => 'Updated Super Admin Name',
        ])->assertOk();
        $this->assertSame('Updated Super Admin Name', $admin->fresh()->fullName);
    }

    public function test_sensitive_admission_document_storage_and_signed_url_protection(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        // 1. Upload sensitive ID Card document via public endpoint
        $file = UploadedFile::fake()->create('national_id.pdf', 500, 'application/pdf');
        $uploadRes = $this->post('/api/admissions/upload-document', [
            'file' => $file,
            'type' => 'idCard',
        ]);
        $uploadRes->assertCreated()
            ->assertJsonPath('isPrivate', true);

        $url = $uploadRes->json('url');
        $this->assertStringStartsWith('private:', $url);

        // Assert file is stored on private local disk, NOT on public disk
        $localRelativePath = substr($url, strlen('private:'));
        $this->assertTrue(Storage::disk('local')->exists($localRelativePath));
        $this->assertFalse(Storage::disk('public')->exists($localRelativePath));

        // 2. Create Admission record with this private document
        $admission = Admission::create([
            'trackingCode' => 'APP-2026-TESTDOC1',
            'khmerName' => 'សុខ សប្បាយ',
            'latinName' => 'SOK SABAY',
            'gender' => 'male',
            'phone' => '012345678',
            'degreeLevel' => 'bachelor',
            'major' => 'Information Technology',
            'shift' => 'morning',
            'idCardUrl' => $url,
            'status' => 'pending',
        ]);

        // 3. Direct unauthenticated / unsigned access to document route is rejected
        $this->getJson("/api/admissions/{$admission->id}/document/idCard")
            ->assertForbidden()
            ->assertJson(['error' => 'Unauthorized or expired document access signature.']);

        // 4. Access with forged / invalid signature is rejected
        $this->getJson("/api/admissions/{$admission->id}/document/idCard?signature=fake_invalid_sig")
            ->assertForbidden();

        // 5. Access with valid cryptographic signed URL succeeds
        $validSignedUrl = URL::temporarySignedRoute(
            'admin.admissions.document',
            now()->addMinutes(30),
            ['id' => $admission->id, 'type' => 'idCard']
        );
        $this->get($validSignedUrl)->assertOk();

        // 6. Admin API list / show generates temporary signed route
        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $admin->createToken('admin')->plainTextToken;

        $showRes = $this->requestWithToken($adminToken, 'GET', "/api/admin/admissions/{$admission->id}");
        $showRes->assertOk();

        $returnedDocUrl = $showRes->json('data.idCardUrl');
        $this->assertStringContainsString('signature=', $returnedDocUrl);
    }

    public static function roles(): array
    {
        return array_map(fn (string $role): array => [$role], ['student', 'teacher', 'sub_admin', 'admin']);
    }

    public static function roleTransitions(): array
    {
        $transitions = [];

        foreach (['student', 'teacher', 'sub_admin', 'admin'] as $fromRole) {
            foreach (['student', 'teacher', 'sub_admin', 'admin'] as $toRole) {
                if ($fromRole !== $toRole) {
                    $transitions[$fromRole.' to '.$toRole] = [$fromRole, $toRole];
                }
            }
        }

        return $transitions;
    }

    private function requestWithToken(string $token, string $method, string $uri, array $data = []): TestResponse
    {
        $this->app['auth']->forgetGuards();

        return $this->json($method, $uri, $data, ['Authorization' => 'Bearer '.$token]);
    }
}
