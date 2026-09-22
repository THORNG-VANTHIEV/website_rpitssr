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
        if (Schema::hasTable('admissions') && ! Schema::hasColumn('admissions', 'courseType')) {
            Schema::table('admissions', function (Blueprint $table) {
                $table->string('courseType', 50)->default('long_term')->index()->after('currentAddress');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('admissions') && Schema::hasColumn('admissions', 'courseType')) {
            Schema::table('admissions', function (Blueprint $table) {
                $table->dropColumn('courseType');
            });
        }
    }
};
