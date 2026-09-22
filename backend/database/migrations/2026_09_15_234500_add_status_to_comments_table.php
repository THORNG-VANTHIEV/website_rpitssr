<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('comments') && ! Schema::hasColumn('comments', 'status')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->string('status', 30)->default('approved')->after('content');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('comments') && Schema::hasColumn('comments', 'status')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
