<?php

namespace Tests\Feature;

use App\Models\Backup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BackupSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_backup_creation_is_disabled_without_a_protected_backup_provider(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->postJson('/api/admin/backups')
            ->assertServiceUnavailable()
            ->assertJsonPath('error', 'On-demand backups are disabled until a protected backup provider is configured.');

        $this->assertDatabaseCount('backups', 0);
    }

    public function test_backup_downloads_are_disabled_by_default(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $backup = Backup::create([
            'fileName' => 'approved-backup.sql',
            'filePath' => 'backups/approved-backup.sql',
            'fileSize' => 1,
        ]);

        $this->getJson('/api/admin/backups/'.$backup->id.'/download')
            ->assertServiceUnavailable()
            ->assertJsonPath('error', 'Backup downloads are disabled until protected backup storage is configured.');
    }

    public function test_backup_paths_cannot_escape_the_managed_backup_directory(): void
    {
        config(['backups.downloads_enabled' => true]);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $backup = Backup::create([
            'fileName' => '../.env',
            'filePath' => 'backups/../.env',
            'fileSize' => 1,
        ]);

        $this->getJson('/api/admin/backups/'.$backup->id.'/download')->assertNotFound();
        $this->deleteJson('/api/admin/backups/'.$backup->id)->assertOk();
        $this->assertDatabaseMissing('backups', ['id' => $backup->id]);
    }
}
