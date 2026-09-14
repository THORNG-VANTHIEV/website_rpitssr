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
        Schema::create('promotional_videos', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('video_url', 500);
            $table->string('youtube_id', 50)->nullable();
            $table->text('description')->nullable();
            $table->string('category', 100)->nullable()->default('សកម្មភាពទូទៅ');
            $table->string('thumbnail', 500)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('order_index')->default(0);
            $table->string('published_date', 100)->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotional_videos');
    }
};
