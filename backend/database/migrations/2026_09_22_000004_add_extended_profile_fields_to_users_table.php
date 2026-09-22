<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (! Schema::hasColumn('users', 'khmerName')) {
                    $table->string('khmerName', 255)->nullable()->after('fullName');
                }
                if (! Schema::hasColumn('users', 'latinName')) {
                    $table->string('latinName', 255)->nullable()->after('khmerName');
                }
                if (! Schema::hasColumn('users', 'gender')) {
                    $table->string('gender', 20)->default('male')->after('latinName');
                }
                if (! Schema::hasColumn('users', 'dob')) {
                    $table->date('dob')->nullable()->after('gender');
                }
                if (! Schema::hasColumn('users', 'phone')) {
                    $table->string('phone', 50)->nullable()->after('dob');
                }
                if (! Schema::hasColumn('users', 'avatarUrl')) {
                    $table->string('avatarUrl', 500)->nullable()->after('phone');
                }
                if (! Schema::hasColumn('users', 'generation')) {
                    $table->string('generation', 50)->nullable()->default('13')->after('academicYear');
                }
                if (! Schema::hasColumn('users', 'shift')) {
                    $table->string('shift', 50)->nullable()->default('morning')->after('generation');
                }
                if (! Schema::hasColumn('users', 'room')) {
                    $table->string('room', 100)->nullable()->after('shift');
                }
                if (! Schema::hasColumn('users', 'degreeLevel')) {
                    $table->string('degreeLevel', 100)->nullable()->after('room');
                }
                if (! Schema::hasColumn('users', 'faculty')) {
                    $table->string('faculty', 255)->nullable()->after('degreeLevel');
                }
                if (! Schema::hasColumn('users', 'totalCredits')) {
                    $table->integer('totalCredits')->default(120)->after('faculty');
                }
                if (! Schema::hasColumn('users', 'completedCredits')) {
                    $table->integer('completedCredits')->default(0)->after('totalCredits');
                }
                if (! Schema::hasColumn('users', 'scholarshipType')) {
                    $table->string('scholarshipType', 150)->nullable()->after('completedCredits');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $columns = [
                    'khmerName',
                    'latinName',
                    'gender',
                    'dob',
                    'phone',
                    'avatarUrl',
                    'generation',
                    'shift',
                    'room',
                    'degreeLevel',
                    'faculty',
                    'totalCredits',
                    'completedCredits',
                    'scholarshipType',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('users', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
