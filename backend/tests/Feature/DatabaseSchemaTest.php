<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_clean_database_has_the_complete_application_schema_without_seeded_accounts(): void
    {
        foreach ([
            'users', 'personal_access_tokens', 'courses', 'blog_posts', 'comments',
            'events', 'exam_results', 'documents', 'book_categories', 'books',
            'borrowings', 'promotional_videos', 'settings', 'backups', 'systemLogs',
        ] as $table) {
            $this->assertTrue(Schema::hasTable($table), "Missing table: {$table}");
        }

        $this->assertTrue(Schema::hasColumns('users', [
            'username', 'email', 'password', 'role', 'studentId', 'fullName',
        ]));
        $this->assertTrue(Schema::hasColumns('borrowings', [
            'book_id', 'user_id', 'student_id', 'borrow_date', 'due_date', 'status',
        ]));
        $this->assertDatabaseCount('users', 0);
    }
}
