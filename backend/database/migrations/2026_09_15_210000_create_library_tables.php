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
        // 1. Book Categories Table
        if (!Schema::hasTable('book_categories')) {
            Schema::create('book_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name_km');
                $table->string('name_en')->nullable();
                $table->string('code')->nullable();
                $table->string('shelf_location')->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Books Table
        if (!Schema::hasTable('books')) {
            Schema::create('books', function (Blueprint $table) {
                $table->id();
                $table->string('title_km');
                $table->string('title_en')->nullable();
                $table->string('author');
                $table->string('isbn')->nullable()->index();
                $table->string('call_number')->nullable();
                $table->foreignId('category_id')->nullable()->constrained('book_categories')->nullOnDelete();
                $table->string('publisher')->nullable();
                $table->integer('publish_year')->nullable();
                $table->string('edition')->nullable();
                $table->string('language')->default('km');
                $table->integer('total_copies')->default(1);
                $table->integer('available_copies')->default(1);
                $table->string('shelf_location')->nullable();
                $table->string('cover_image')->nullable();
                $table->string('file_url')->nullable();
                $table->boolean('is_ebook')->default(false);
                $table->boolean('is_featured')->default(false);
                $table->string('status')->default('available');
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 3. Book Borrowings Table
        if (!Schema::hasTable('borrowings')) {
            Schema::create('borrowings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
                $table->integer('user_id')->nullable();
                $table->string('student_name');
                $table->string('student_id');
                $table->date('borrow_date');
                $table->date('due_date');
                $table->date('return_date')->nullable();
                $table->string('status')->default('borrowed'); // borrowed, returned, overdue
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrowings');
        Schema::dropIfExists('books');
        Schema::dropIfExists('book_categories');
    }
};
