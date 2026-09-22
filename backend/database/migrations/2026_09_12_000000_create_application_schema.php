<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Establish application tables without importing production data.
     * Existing tables are adopted without changing their contents.
     */
    public function up(): void
    {
        foreach (['course_categories', 'blog_categories', 'event_categories'] as $name) {
            $this->createIfMissing($name, function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('slug')->nullable()->index();
                $table->text('imageUrl')->nullable();
                $table->string('status', 30)->default('active')->index();
                $table->integer('order')->default(0);
                $this->timestamps($table);
            });
        }

        $this->createIfMissing('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('imageUrl')->nullable();
            $table->text('description')->nullable();
            $table->longText('overview')->nullable();
            $table->unsignedBigInteger('categoryId')->nullable()->index();
            $table->text('benefits')->nullable();
            $table->string('fee')->nullable();
            $table->string('duration')->nullable();
            $table->string('credit')->nullable();
            $table->string('semester')->nullable();
            $this->timestamps($table);
        });

        $this->createIfMissing('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->nullable()->unique();
            $table->longText('content');
            $table->text('excerpt')->nullable();
            $table->text('imageUrl')->nullable();
            $table->unsignedBigInteger('categoryId')->nullable()->index();
            $table->string('author')->nullable();
            $table->unsignedBigInteger('authorId')->nullable()->index();
            $table->text('tags')->nullable();
            $table->string('status', 30)->default('draft')->index();
            $table->string('type', 30)->default('normal');
            $table->unsignedInteger('viewCount')->default(0);
            $table->boolean('featured')->default(false);
            $table->timestamp('publishedAt')->nullable();
            $this->timestamps($table);
        });

        $this->createIfMissing('comments', function (Blueprint $table) {
            $table->id();
            $table->string('author');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('title')->nullable();
            $table->string('time')->nullable();
            $table->text('content');
            $table->string('status', 30)->default('pending')->index();
            $table->unsignedBigInteger('blogPostId')->index();
            $table->unsignedBigInteger('parentCommentId')->nullable()->index();
            $this->timestamps($table);
        });

        $this->createIfMissing('facebook_embeds', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('postId')->index();
            $table->text('facebookUrl');
            $table->string('facebookPostId')->nullable();
            $table->longText('embedCode')->nullable();
            $table->string('status', 30)->default('active');
            $this->timestamps($table);
        });

        $this->createIfMissing('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('courseId')->index();
            $table->unsignedBigInteger('userId')->nullable()->index();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->boolean('isApproved')->default(false);
            $this->timestamps($table);
        });

        $this->createIfMissing('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('time')->nullable();
            $table->date('date');
            $table->string('place')->nullable();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->text('imageUrl')->nullable();
            $table->text('description')->nullable();
            $table->longText('overview')->nullable();
            $table->text('speakers')->nullable();
            $table->text('schedule')->nullable();
            $table->string('fee')->nullable();
            $this->timestamps($table);
        });

        $this->createIfMissing('exam_results', function (Blueprint $table) {
            $table->id();
            $table->string('courseName');
            $table->string('semester', 50);
            $table->string('generation', 50)->nullable();
            $table->string('year')->nullable();
            $table->string('examName')->nullable();
            $table->string('studentId')->nullable()->index();
            $table->string('studentName')->nullable();
            $table->string('className')->nullable();
            $table->string('subject')->nullable();
            $table->integer('totalMarks')->nullable();
            $table->integer('obtainedMarks')->nullable();
            $table->decimal('percentage', 8, 2)->nullable();
            $table->string('grade')->nullable();
            $table->date('examDate')->nullable();
            $table->boolean('isPublished')->default(false)->index();
            $table->text('remarks')->nullable();
            $table->text('resultImageUrl')->nullable();
            $table->text('resultPdfUrl')->nullable();
            $table->string('documentType')->nullable();
            $table->unsignedBigInteger('createdById')->nullable()->index();
            $table->unsignedBigInteger('lastUpdatedById')->nullable();
            $table->timestamp('lastUpdatedAt')->nullable();
            $this->timestamps($table);
        });

        $this->createIfMissing('faqs', function (Blueprint $table) {
            $table->id();
            $table->text('question');
            $table->text('answer');
            $table->string('category')->nullable();
            $table->integer('order')->default(0);
            $this->timestamps($table);
        });

        $this->createIfMissing('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->text('imageUrl');
            $table->string('category')->nullable()->index();
            $table->boolean('isActive')->default(true);
            $table->integer('order')->default(0);
            $this->timestamps($table);
        });

        $this->createIfMissing('notices', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('content');
            $table->string('category')->nullable();
            $table->text('fileUrl')->nullable();
            $table->boolean('isPinned')->default(false);
            $table->date('date')->nullable();
            $this->timestamps($table);
        });

        $this->createIfMissing('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('imageUrl')->nullable();
            $table->string('designation')->nullable();
            $table->string('department')->nullable();
            $table->text('description')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('skype')->nullable();
            $table->text('facebook')->nullable();
            $table->text('twitter')->nullable();
            $table->text('instagram')->nullable();
            $table->text('linkedin')->nullable();
            $table->text('experience')->nullable();
            $table->text('educationalQualifications')->nullable();
            $table->text('achievements')->nullable();
            $this->timestamps($table);
        });

        $this->createIfMissing('scrolling_banners', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_active')->default(true);
            $table->integer('order_index')->default(0);
            $table->text('message');
            $this->timestamps($table);
        });

        $this->createIfMissing('settings', function (Blueprint $table) {
            $table->id();
            $table->string('siteName')->default('RPITSSR');
            $table->text('siteDescription')->nullable();
            $table->text('siteUrl')->nullable();
            $table->string('contactEmail')->nullable();
            $table->string('contactPhone', 50)->nullable();
            $table->text('address')->nullable();
            $table->text('logoUrl')->nullable();
            $table->string('metaTitle')->nullable();
            $table->text('metaDescription')->nullable();
            $table->text('metaKeywords')->nullable();
            $table->text('facebookUrl')->nullable();
            $table->text('twitterUrl')->nullable();
            $table->text('linkedinUrl')->nullable();
            $table->text('instagramUrl')->nullable();
            $table->text('youtubeUrl')->nullable();
            $table->boolean('enableRegistration')->default(false);
            $table->boolean('enableComments')->default(true);
            $table->string('primaryColor', 50)->nullable();
            $table->string('secondaryColor', 50)->nullable();
            $table->string('academicYear', 50)->nullable();
            $table->string('defaultLanguage', 10)->default('km');
            $table->unsignedBigInteger('updatedById')->nullable();
            $table->timestamp('lastUpdated')->nullable();
            $this->timestamps($table);
        });

        $this->createIfMissing('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('message')->nullable();
            $table->text('image_url')->nullable();
            $table->text('background_image')->nullable();
            $table->string('background_color')->nullable();
            $table->string('button_text')->nullable();
            $table->text('button_link')->nullable();
            $table->string('position')->nullable();
            $table->integer('delay')->default(0);
            $table->boolean('show_once')->default(true);
            $table->boolean('is_active')->default(false)->index();
            $table->integer('priority')->default(0);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamps();
        });

        $this->createIfMissing('plugins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('version')->nullable();
            $table->text('description')->nullable();
            $table->string('author')->nullable();
            $table->boolean('isActive')->default(false);
            $table->boolean('isInstalled')->default(false);
            $table->timestamp('installedAt')->nullable();
            $table->longText('configData')->nullable();
            $this->timestamps($table);
        });

        $this->createIfMissing('reports', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('status', 30)->default('pending');
            $table->string('fileName')->nullable();
            $table->text('filePath')->nullable();
            $table->unsignedBigInteger('fileSize')->nullable();
            $table->unsignedBigInteger('generatedById')->nullable()->index();
            $table->string('dateRange')->nullable();
            $table->date('startDate')->nullable();
            $table->date('endDate')->nullable();
            $table->longText('data')->nullable();
            $this->timestamps($table);
        });

        $this->createIfMissing('backups', function (Blueprint $table) {
            $table->id();
            $table->string('fileName');
            $table->text('filePath');
            $table->unsignedBigInteger('fileSize')->default(0);
            $table->string('type', 30)->default('manual');
            $table->string('status', 30)->default('pending');
            $table->unsignedBigInteger('createdById')->nullable()->index();
            $table->text('description')->nullable();
            $table->json('tables')->nullable();
            $table->timestamp('createdAt')->nullable();
        });

        $this->createIfMissing('systemLogs', function (Blueprint $table) {
            $table->id();
            $table->string('level', 30)->default('info')->index();
            $table->string('action');
            $table->text('message');
            $table->unsignedBigInteger('userId')->nullable()->index();
            $table->string('ipAddress', 45)->nullable();
            $table->text('userAgent')->nullable();
            $table->longText('metadata')->nullable();
            $table->timestamp('createdAt')->nullable()->index();
        });
    }

    /**
     * A baseline can adopt existing tables; never drop those on rollback.
     */
    public function down(): void
    {
        throw new RuntimeException('Application schema baseline is forward-only. Restore an approved backup or use a forward migration.');
    }

    private function createIfMissing(string $name, Closure $definition): void
    {
        if (! Schema::hasTable($name)) {
            Schema::create($name, $definition);
        }
    }

    private function timestamps(Blueprint $table): void
    {
        $table->timestamp('createdAt')->nullable();
        $table->timestamp('updatedAt')->nullable();
    }
};
