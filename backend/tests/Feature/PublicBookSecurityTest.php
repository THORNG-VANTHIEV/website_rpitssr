<?php

namespace Tests\Feature;

use App\Http\Resources\PublicBookResource;
use App\Models\Book;
use App\Models\BookBorrowing;
use App\Models\BookCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PublicBookSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function createBook(): Book
    {
        $category = BookCategory::create([
            'name_km' => 'បច្ចេកវិទ្យា',
            'name_en' => 'Technology',
            'code' => 'TECH',
            'shelf_location' => 'A1',
            'description' => 'Technical reference books',
            'is_active' => true,
        ]);

        return Book::create([
            'title_km' => 'សៀវភៅបច្ចេកវិទ្យា',
            'title_en' => 'Technology Handbook',
            'author' => 'Institute Faculty',
            'category_id' => $category->id,
            'total_copies' => 3,
            'available_copies' => 2,
            'is_ebook' => false,
            'is_featured' => true,
            'status' => 'available',
        ]);
    }

    private function createUser(string $role, string $studentId): User
    {
        return User::create([
            'username' => strtolower($studentId),
            'email' => strtolower($studentId).'@example.test',
            'password' => 'strong-test-password',
            'role' => $role,
            'studentId' => $studentId,
        ]);
    }

    private function createBorrowing(Book $book, array $attributes = []): BookBorrowing
    {
        return BookBorrowing::create(array_merge([
            'book_id' => $book->id,
            'student_name' => 'Private Borrower',
            'student_id' => 'PRIVATE-STUDENT-001',
            'borrow_date' => '2026-09-01',
            'due_date' => '2026-09-30',
            'status' => 'borrowed',
            'notes' => 'Confidential borrowing note',
        ], $attributes));
    }

    public function test_public_catalog_and_detail_expose_only_catalog_fields(): void
    {
        $book = $this->createBook();
        $this->createBorrowing($book, ['user_id' => 42]);

        $detail = $this->getJson('/api/books/'.$book->id)
            ->assertOk()
            ->assertJsonPath('title_en', 'Technology Handbook')
            ->assertJsonPath('category.name_en', 'Technology')
            ->assertJsonPath('available_copies', 2)
            ->assertJsonMissingPath('borrowings')
            ->assertJsonMissingPath('user_id')
            ->assertJsonMissingPath('student_id')
            ->assertJsonMissingPath('student_name')
            ->assertJsonMissingPath('borrow_date')
            ->assertJsonMissingPath('notes')
            ->assertJsonMissingPath('created_at');

        $list = $this->getJson('/api/books')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonMissingPath('data')
            ->assertJsonMissingPath('0.borrowings');

        $this->assertSame($detail->json(), $list->json('0'));
        $this->assertSame([
            'id', 'title_km', 'title_en', 'author', 'isbn', 'call_number', 'category_id',
            'publisher', 'publish_year', 'edition', 'language', 'total_copies',
            'available_copies', 'shelf_location', 'cover_image', 'file_url', 'is_ebook',
            'is_featured', 'status', 'description', 'category',
        ], array_keys($detail->json()));
    }

    public function test_public_resources_ignore_accidentally_loaded_private_attributes_and_relations(): void
    {
        $book = $this->createBook();
        $this->createBorrowing($book);
        $book->load(['category', 'borrowings']);
        $book->setAttribute('internal_note', 'private');
        $book->category->setAttribute('staff_note', 'private');

        $result = json_decode((new PublicBookResource($book))->toJson(), true);

        $this->assertArrayNotHasKey('borrowings', $result);
        $this->assertArrayNotHasKey('internal_note', $result);
        $this->assertArrayNotHasKey('staff_note', $result['category']);
    }

    public function test_public_category_shape_and_catalog_filters_remain_compatible(): void
    {
        $book = $this->createBook();
        Book::create([
            'title_km' => 'Other book',
            'author' => 'Other author',
            'available_copies' => 0,
        ]);

        $this->getJson('/api/book-categories')
            ->assertOk()
            ->assertExactJson([[
                'id' => $book->category_id,
                'name_km' => 'បច្ចេកវិទ្យា',
                'name_en' => 'Technology',
                'code' => 'TECH',
                'shelf_location' => 'A1',
                'description' => 'Technical reference books',
                'is_active' => true,
                'books_count' => 1,
            ]]);

        $query = http_build_query([
            'search' => 'Handbook',
            'category_id' => $book->category_id,
            'availability' => 'available',
            'sort_by' => 'title_asc',
            'limit' => 1,
        ]);

        $this->getJson('/api/books?'.$query)
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $book->id);
        $this->getJson('/api/books/99999')->assertNotFound();
    }

    public function test_guest_and_student_cannot_access_administrative_borrower_records(): void
    {
        $book = $this->createBook();
        $this->createBorrowing($book);

        $this->getJson('/api/admin/books/'.$book->id)->assertUnauthorized();
        $this->getJson('/api/admin/borrowings')->assertUnauthorized();

        Sanctum::actingAs($this->createUser('student', 'STU-001'));

        $this->getJson('/api/admin/books/'.$book->id)->assertForbidden();
        $this->getJson('/api/admin/borrowings')->assertForbidden();
    }

    public function test_authorized_staff_can_still_view_borrower_records(): void
    {
        $book = $this->createBook();
        $borrowing = $this->createBorrowing($book);
        Sanctum::actingAs($this->createUser('sub_admin', 'STAFF-001'));

        $this->getJson('/api/admin/books/'.$book->id)
            ->assertOk()
            ->assertJsonPath('borrowings.0.id', $borrowing->id);
        $this->getJson('/api/admin/borrowings')
            ->assertOk()
            ->assertJsonPath('0.student_id', 'PRIVATE-STUDENT-001');
    }

    public function test_student_borrowing_history_cannot_be_switched_to_another_student(): void
    {
        $book = $this->createBook();
        $student = $this->createUser('student', 'STU-001');
        $other = $this->createUser('student', 'STU-002');
        $own = $this->createBorrowing($book, ['user_id' => $student->id, 'student_id' => $student->studentId]);
        $legacy = $this->createBorrowing($book, ['user_id' => null, 'student_id' => $student->studentId]);
        $this->createBorrowing($book, ['user_id' => $other->id, 'student_id' => $other->studentId]);
        $this->createBorrowing($book, ['user_id' => $other->id, 'student_id' => $student->studentId]);

        Sanctum::actingAs($student);

        $this->getJson('/api/student/borrowings?user_id='.$other->id.'&student_id='.$other->studentId)
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $legacy->id)
            ->assertJsonPath('data.1.id', $own->id);
    }
}
