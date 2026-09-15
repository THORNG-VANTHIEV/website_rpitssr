<?php

use App\Http\Controllers\Api\Admin\AdminBlogPostController;
use App\Http\Controllers\Api\Admin\AdminBookController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminCourseController;
use App\Http\Controllers\Api\Admin\AdminDocumentController;
use App\Http\Controllers\Api\Admin\AdminEventController;
use App\Http\Controllers\Api\Admin\AdminExamResultController;
use App\Http\Controllers\Api\Admin\AdminFaqController;
use App\Http\Controllers\Api\Admin\AdminGalleryController;
use App\Http\Controllers\Api\Admin\AdminNoticeController;
use App\Http\Controllers\Api\Admin\AdminPromotionalVideoController;
use App\Http\Controllers\Api\Admin\AdminScrollingBannerController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\Admin\AdminSystemController;
use App\Http\Controllers\Api\Admin\AdminTeacherController;
use App\Http\Controllers\Api\Admin\AdminToolController;
use App\Http\Controllers\Api\Admin\AdminUploadController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogPostController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ExamResultController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\ScrollingBannerController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StudentPortalController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => now()->toIso8601String(),
        'service' => 'RPITSSR Laravel REST API',
    ], 200);
});

// Authentication
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Courses & Categories
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{id}', [CourseController::class, 'show']);
Route::get('/course-categories', [CourseController::class, 'categories']);

// Blog Posts & Categories
Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{id}', [BlogPostController::class, 'show']);
Route::get('/blog-posts/slug/{slug}', [BlogPostController::class, 'bySlug']);
Route::get('/blog-categories', [BlogPostController::class, 'categories']);

// Events & Categories
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::get('/event-categories', [EventController::class, 'categories']);
Route::get('/event-categories/active', [EventController::class, 'categories']);

// Teachers
Route::get('/teachers', [TeacherController::class, 'index']);
Route::get('/teachers/{id}', [TeacherController::class, 'show']);

// Notices
Route::get('/notices', [NoticeController::class, 'index']);
Route::get('/notices/{id}', [NoticeController::class, 'show']);

// FAQs
Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/faqs/{id}', [FaqController::class, 'show']);

// Gallery
Route::get('/gallery-images', [GalleryController::class, 'index']);
Route::get('/gallery-images/{id}', [GalleryController::class, 'show']);
Route::get('/gallery', [GalleryController::class, 'index']);

// Scrolling Banners
Route::get('/scrolling-banners', [ScrollingBannerController::class, 'index']);

// Settings
Route::get('/settings/public', [SettingsController::class, 'publicSettings']);
Route::get('/settings', [SettingsController::class, 'publicSettings']);
Route::get('/youtube-videos', [SettingsController::class, 'youtubeVideos']);

// Exam Results
Route::get('/exam-results', [ExamResultController::class, 'index']);
Route::get('/exam-results/filters', [ExamResultController::class, 'filters']);
Route::get('/exam-results/{id}', [ExamResultController::class, 'show']);

// Promotions
Route::get('/promotions/active', [PromotionController::class, 'active']);

// Documents / Downloads
Route::get('/documents', [DocumentController::class, 'index']);
Route::get('/documents/{id}', [DocumentController::class, 'show']);
Route::post('/documents/{id}/download', [DocumentController::class, 'incrementDownload']);

// Public Library Catalog
Route::get('/books', [AdminBookController::class, 'getBooks']);
Route::get('/books/{id}', [AdminBookController::class, 'getBook']);
Route::get('/book-categories', [AdminBookController::class, 'getCategories']);

// Public Contact Form
Route::post('/contact', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'Thank you for your message. We have received it and will contact you shortly.'
    ], 200);
});

/*
|--------------------------------------------------------------------------
| Protected User Routes (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/verify', [AuthController::class, 'verify']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Student Portal Routes (accessible to any authenticated student)
    Route::prefix('student')->group(function () {
        Route::get('/dashboard', [StudentPortalController::class, 'dashboard']);
        Route::get('/exam-results', [StudentPortalController::class, 'examResults']);
        Route::get('/borrowings', [StudentPortalController::class, 'borrowings']);
        Route::get('/profile', [StudentPortalController::class, 'profile']);
        Route::put('/profile', [StudentPortalController::class, 'updateProfile']);
    });
});

/*
|--------------------------------------------------------------------------
| Admin Routes (auth:sanctum + admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Admin verification
    Route::get('/verify', [AuthController::class, 'adminVerify']);

    // System status & summary
    Route::get('/system/summary', [AdminSystemController::class, 'getSummary']);

    // File Uploads
    Route::post('/upload', [AdminUploadController::class, 'upload']);
    Route::post('/blog-posts/upload-image', [AdminUploadController::class, 'upload']);
    Route::post('/courses/upload-image', [AdminUploadController::class, 'upload']);
    Route::post('/events/upload-image', [AdminUploadController::class, 'upload']);
    Route::post('/teachers/upload-image', [AdminUploadController::class, 'upload']);
    Route::post('/gallery-images/upload-image', [AdminUploadController::class, 'upload']);
    Route::post('/exam-results/upload-result', [AdminUploadController::class, 'upload']);

    // Courses CRUD
    Route::get('/courses', [AdminCourseController::class, 'index']);
    Route::get('/courses/{id}', [AdminCourseController::class, 'show']);
    Route::post('/courses', [AdminCourseController::class, 'store']);
    Route::put('/courses/{id}', [AdminCourseController::class, 'update']);
    Route::delete('/courses/{id}', [AdminCourseController::class, 'destroy']);

    // Blog Posts CRUD
    Route::get('/blog-posts', [AdminBlogPostController::class, 'index']);
    Route::get('/blog-posts/{id}', [AdminBlogPostController::class, 'show']);
    Route::post('/blog-posts', [AdminBlogPostController::class, 'store']);
    Route::put('/blog-posts/{id}', [AdminBlogPostController::class, 'update']);
    Route::delete('/blog-posts/{id}', [AdminBlogPostController::class, 'destroy']);

    // Teachers CRUD
    Route::get('/teachers', [AdminTeacherController::class, 'index']);
    Route::get('/teachers/{id}', [AdminTeacherController::class, 'show']);
    Route::post('/teachers', [AdminTeacherController::class, 'store']);
    Route::put('/teachers/{id}', [AdminTeacherController::class, 'update']);
    Route::delete('/teachers/{id}', [AdminTeacherController::class, 'destroy']);

    // Events CRUD
    Route::get('/events', [AdminEventController::class, 'index']);
    Route::get('/events/{id}', [AdminEventController::class, 'show']);
    Route::post('/events', [AdminEventController::class, 'store']);
    Route::put('/events/{id}', [AdminEventController::class, 'update']);
    Route::delete('/events/{id}', [AdminEventController::class, 'destroy']);

    // Notices CRUD
    Route::get('/notices', [AdminNoticeController::class, 'index']);
    Route::get('/notices/{id}', [AdminNoticeController::class, 'show']);
    Route::post('/notices', [AdminNoticeController::class, 'store']);
    Route::put('/notices/{id}', [AdminNoticeController::class, 'update']);
    Route::delete('/notices/{id}', [AdminNoticeController::class, 'destroy']);

    // FAQs CRUD
    Route::get('/faqs', [AdminFaqController::class, 'index']);
    Route::get('/faqs/{id}', [AdminFaqController::class, 'show']);
    Route::post('/faqs', [AdminFaqController::class, 'store']);
    Route::put('/faqs/{id}', [AdminFaqController::class, 'update']);
    Route::delete('/faqs/{id}', [AdminFaqController::class, 'destroy']);

    // Gallery CRUD
    Route::get('/gallery-images', [AdminGalleryController::class, 'index']);
    Route::get('/gallery-images/{id}', [AdminGalleryController::class, 'show']);
    Route::post('/gallery-images', [AdminGalleryController::class, 'store']);
    Route::put('/gallery-images/{id}', [AdminGalleryController::class, 'update']);
    Route::delete('/gallery-images/{id}', [AdminGalleryController::class, 'destroy']);

    // Scrolling Banners CRUD & Toggle
    Route::get('/scrolling-banners', [AdminScrollingBannerController::class, 'index']);
    Route::get('/scrolling-banners/{id}', [AdminScrollingBannerController::class, 'show']);
    Route::post('/scrolling-banners', [AdminScrollingBannerController::class, 'store']);
    Route::put('/scrolling-banners/{id}', [AdminScrollingBannerController::class, 'update']);
    Route::delete('/scrolling-banners/{id}', [AdminScrollingBannerController::class, 'destroy']);
    Route::post('/scrolling-banners/{id}/toggle', [AdminScrollingBannerController::class, 'toggle']);

    // Promotional Videos CRUD & Toggle
    Route::get('/promotional-videos', [AdminPromotionalVideoController::class, 'index']);
    Route::get('/promotional-videos/{id}', [AdminPromotionalVideoController::class, 'show']);
    Route::post('/promotional-videos', [AdminPromotionalVideoController::class, 'store']);
    Route::put('/promotional-videos/{id}', [AdminPromotionalVideoController::class, 'update']);
    Route::delete('/promotional-videos/{id}', [AdminPromotionalVideoController::class, 'destroy']);
    Route::post('/promotional-videos/{id}/toggle', [AdminPromotionalVideoController::class, 'toggle']);

    // Exam Results CRUD
    Route::get('/exam-results', [AdminExamResultController::class, 'index']);
    Route::get('/exam-results/{id}', [AdminExamResultController::class, 'show']);
    Route::post('/exam-results', [AdminExamResultController::class, 'store']);
    Route::put('/exam-results/{id}', [AdminExamResultController::class, 'update']);
    Route::delete('/exam-results/{id}', [AdminExamResultController::class, 'destroy']);

    // Users CRUD
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

    // Settings
    Route::get('/settings', [AdminSettingsController::class, 'getSettings']);
    Route::put('/settings', [AdminSettingsController::class, 'updateSettings']);

    // Documents CRUD
    Route::get('/documents', [AdminDocumentController::class, 'index']);
    Route::get('/documents/{id}', [AdminDocumentController::class, 'show']);
    Route::post('/documents', [AdminDocumentController::class, 'store']);
    Route::put('/documents/{id}', [AdminDocumentController::class, 'update']);
    Route::delete('/documents/{id}', [AdminDocumentController::class, 'destroy']);
    Route::post('/documents/{id}/toggle-popular', [AdminDocumentController::class, 'togglePopular']);
    Route::post('/documents/{id}/toggle-active', [AdminDocumentController::class, 'toggleActive']);
    Route::post('/documents/upload', [AdminDocumentController::class, 'upload']);

    // Course Categories CRUD
    Route::get('/course-categories', [AdminCategoryController::class, 'getCourseCategories']);
    Route::post('/course-categories', [AdminCategoryController::class, 'storeCourseCategory']);
    Route::put('/course-categories/{id}', [AdminCategoryController::class, 'updateCourseCategory']);
    Route::delete('/course-categories/{id}', [AdminCategoryController::class, 'destroyCourseCategory']);

    // Blog Categories CRUD
    Route::get('/blog-categories', [AdminCategoryController::class, 'getBlogCategories']);
    Route::post('/blog-categories', [AdminCategoryController::class, 'storeBlogCategory']);
    Route::put('/blog-categories/{id}', [AdminCategoryController::class, 'updateBlogCategory']);
    Route::delete('/blog-categories/{id}', [AdminCategoryController::class, 'destroyBlogCategory']);

    // Event Categories CRUD
    Route::get('/event-categories', [AdminCategoryController::class, 'getEventCategories']);
    Route::post('/event-categories', [AdminCategoryController::class, 'storeEventCategory']);
    Route::put('/event-categories/{id}', [AdminCategoryController::class, 'updateEventCategory']);
    Route::delete('/event-categories/{id}', [AdminCategoryController::class, 'destroyEventCategory']);

    // Promotions CRUD
    Route::get('/promotions', [AdminToolController::class, 'getPromotions']);
    Route::post('/promotions', [AdminToolController::class, 'storePromotion']);
    Route::put('/promotions/{id}', [AdminToolController::class, 'updatePromotion']);
    Route::delete('/promotions/{id}', [AdminToolController::class, 'deletePromotion']);
    Route::post('/promotions/{id}/toggle', [AdminToolController::class, 'togglePromotion']);

    // Comments CRUD
    Route::get('/comments', [AdminToolController::class, 'getComments']);
    Route::put('/comments/{id}', [AdminToolController::class, 'updateComment']);
    Route::delete('/comments/{id}', [AdminToolController::class, 'deleteComment']);

    // Backups
    Route::get('/backups', [AdminToolController::class, 'getBackups']);
    Route::post('/backups', [AdminToolController::class, 'createBackup']);
    Route::delete('/backups/{id}', [AdminToolController::class, 'deleteBackup']);

    // Library & Books Management CRUD
    Route::get('/books', [AdminBookController::class, 'getBooks']);
    Route::get('/books/{id}', [AdminBookController::class, 'getBook']);
    Route::post('/books', [AdminBookController::class, 'storeBook']);
    Route::put('/books/{id}', [AdminBookController::class, 'updateBook']);
    Route::delete('/books/{id}', [AdminBookController::class, 'deleteBook']);
    Route::post('/books/upload', [AdminBookController::class, 'uploadCover']);

    Route::get('/book-categories', [AdminBookController::class, 'getCategories']);
    Route::post('/book-categories', [AdminBookController::class, 'storeCategory']);
    Route::put('/book-categories/{id}', [AdminBookController::class, 'updateCategory']);
    Route::delete('/book-categories/{id}', [AdminBookController::class, 'deleteCategory']);

    Route::get('/borrowings', [AdminBookController::class, 'getBorrowings']);
    Route::post('/borrowings', [AdminBookController::class, 'storeBorrowing']);
    Route::post('/borrowings/{id}/return', [AdminBookController::class, 'returnBorrowing']);

    // System Logs
    Route::get('/logs', [AdminToolController::class, 'getLogs']);
    Route::post('/logs/clear', [AdminToolController::class, 'clearLogs']);

    // Reports & Plugins
    Route::get('/reports', [AdminToolController::class, 'getReports']);
    Route::get('/plugins', [AdminToolController::class, 'getPlugins']);
});
