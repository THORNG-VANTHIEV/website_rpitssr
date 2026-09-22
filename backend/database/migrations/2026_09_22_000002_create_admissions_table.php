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
        if (! Schema::hasTable('admissions')) {
            Schema::create('admissions', function (Blueprint $table) {
                $table->id();
                $table->string('trackingCode', 50)->unique()->index();
                $table->string('khmerName', 255);
                $table->string('latinName', 255);
                $table->string('gender', 20)->default('male');
                $table->date('dob')->nullable();
                $table->string('phone', 50)->index();
                $table->string('telegram', 100)->nullable();
                $table->string('email', 255)->nullable();
                $table->text('currentAddress')->nullable();
                $table->string('degreeLevel', 100)->index();
                $table->string('major', 255)->index();
                $table->string('shift', 50)->default('morning');
                $table->string('photoUrl', 500)->nullable();
                $table->string('certificateUrl', 500)->nullable();
                $table->string('idCardUrl', 500)->nullable();
                $table->string('equityCardUrl', 500)->nullable();
                $table->string('status', 30)->default('pending')->index();
                $table->text('adminNotes')->nullable();
                $table->string('enrolledStudentId', 50)->nullable();
                $table->integer('enrolledUserId')->nullable()->index();
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admissions');
    }
};
