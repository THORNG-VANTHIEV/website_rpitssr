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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable()->index();
            $table->string('title_km');
            $table->string('title_en')->nullable();
            $table->string('category')->default('academic')->index();
            $table->string('file_type', 20)->default('pdf');
            $table->string('file_size', 50)->nullable();
            $table->string('file_path')->nullable();
            $table->text('description_km')->nullable();
            $table->text('description_en')->nullable();
            $table->string('submission_office')->nullable();
            $table->json('required_docs_km')->nullable();
            $table->json('required_docs_en')->nullable();
            $table->unsignedInteger('downloads_count')->default(0);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
