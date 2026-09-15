<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookCategory;
use App\Models\BookBorrowing;
use Illuminate\Database\Seeder;

class LibrarySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $categories = [
            [
                'name_km' => 'វិទ្យាសាស្ត្រកុំព្យូទ័រ & ព័ត៌មានវិទ្យា (ICT)',
                'name_en' => 'Computer Science & ICT',
                'code' => 'CS-IT',
                'shelf_location' => 'ជាន់ទី ២ - ប្លុក A (Floor 2, Section A)',
                'description' => 'សៀវភៅបច្ចេកវិទ្យា Software, Web Development, Network, Cyber Security និង AI',
                'is_active' => true,
            ],
            [
                'name_km' => 'វិស្វកម្មអគ្គិសនី & ថាមពល (Electrical)',
                'name_en' => 'Electrical Engineering & Power',
                'code' => 'EE-ENG',
                'shelf_location' => 'ជាន់ទី ២ - ប្លុក B (Floor 2, Section B)',
                'description' => 'សៀវភៅសៀគ្វីអគ្គិសនី សូឡា បណ្តាញតម្លើងអគ្គិសនីអគារ និងស្វ័យប្រវត្តិកម្ម PLC',
                'is_active' => true,
            ],
            [
                'name_km' => 'វិស្វកម្មសំណង់ស៊ីវិល (Civil Engineering)',
                'name_en' => 'Civil Engineering & Construction',
                'code' => 'CE-ENG',
                'shelf_location' => 'ជាន់ទី ២ - ប្លុក C (Floor 2, Section C)',
                'description' => 'សៀវភៅគណនាគ្រឿងបង្គុំបេតុង ស្ថាបត្យកម្ម ស្ទង់វាស់ដី និងគ្រឿងចក្រសំណង់',
                'is_active' => true,
            ],
            [
                'name_km' => 'បច្ចេកវិទ្យារថយន្ត & មេកានិក (Automotive)',
                'name_en' => 'Automotive Technology & Mechanics',
                'code' => 'AUTO-MECH',
                'shelf_location' => 'ជាន់ទី ១ - ប្លុក D (Floor 1, Section D)',
                'description' => 'សៀវភៅប្រព័ន្ធម៉ាស៊ីន EFI ប្រអប់លេខស្វ័យប្រវត្តិ អគ្គិសនីរថយន្ត និងរថយន្ត Hybrid/EV',
                'is_active' => true,
            ],
            [
                'name_km' => 'ទេសចរណ៍ & បដិសណ្ឋារកិច្ច (Hospitality)',
                'name_en' => 'Tourism & Hospitality Management',
                'code' => 'TH-MGMT',
                'shelf_location' => 'ជាន់ទី ១ - ប្លុក E (Floor 1, Section E)',
                'description' => 'សៀវភៅសេវាកម្មម្ហូបអាហារ បដិសណ្ឋារកិច្ចសណ្ឋាគារ មគ្គុទ្ទេសក៍ទេសចរណ៍ និងរៀបចំព្រឹត្តិការណ៍',
                'is_active' => true,
            ],
            [
                'name_km' => 'ភាសា & ជំនាញទន់ (Languages & Soft Skills)',
                'name_en' => 'Languages & General Competencies',
                'code' => 'LANG-GEN',
                'shelf_location' => 'ជាន់ទី ១ - ប្លុក F (Floor 1, Section F)',
                'description' => 'សៀវភៅភាសាអង់គ្លេសបច្ចេកទេស ភាពជាអ្នកដឹកនាំ ក្រមសីលធម៌វិជ្ជាជីវៈ និងការត្រៀមការងារ',
                'is_active' => true,
            ],
        ];

        $savedCategories = [];
        foreach ($categories as $catData) {
            $cat = BookCategory::firstOrCreate(
                ['code' => $catData['code']],
                $catData
            );
            $savedCategories[$catData['code']] = $cat->id;
        }

        // 2. Books
        $books = [
            [
                'title_km' => 'មូលដ្ឋានគ្រឹះបច្ចេកវិទ្យាគេហទំព័រ & JavaScript ទំនើប',
                'title_en' => 'Introduction to Web Technologies & Modern JavaScript',
                'author' => 'បណ្ឌិត ហេង ប៊ុនធឿន (Dr. Heng Buntheun)',
                'isbn' => '978-0134685991',
                'call_number' => 'QA76.73 .H46 2024',
                'category_id' => $savedCategories['CS-IT'] ?? null,
                'publisher' => 'RPITSSR Academic Press',
                'publish_year' => 2024,
                'edition' => 'បោះពុម្ពលើកទី ២ (2nd Edition)',
                'language' => 'km',
                'total_copies' => 15,
                'available_copies' => 12,
                'shelf_location' => 'ធ្នើ A-12',
                'cover_image' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
                'file_url' => '/uploads/books/web-technologies-handbook.pdf',
                'is_ebook' => true,
                'is_featured' => true,
                'status' => 'available',
                'description' => 'សៀវភៅសិក្សាស្រាវជ្រាវពេញលេញគ្របដណ្តប់លើ HTML5, CSS3, ES6+, React, Node.js និងការអភិវឌ្ឍ Full-stack Web Application ស្របតាមកម្មវិធី TVET កម្រិតជាតិ។',
            ],
            [
                'title_km' => 'សៀវភៅណែនាំសៀគ្វីអគ្គិសនី និងស្តង់ដារតម្លើងខ្សែបណ្តាញ',
                'title_en' => 'Electrical Circuits & Wiring Standards Manual',
                'author' => 'វិស្វករ ឈឹម វឌ្ឍនៈ (Eng. Chhim Vathanak)',
                'isbn' => '978-0073373843',
                'call_number' => 'TK3201 .C45 2023',
                'category_id' => $savedCategories['EE-ENG'] ?? null,
                'publisher' => 'ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ',
                'publish_year' => 2023,
                'edition' => 'បោះពុម្ពលើកទី ៣ (3rd Edition)',
                'language' => 'km',
                'total_copies' => 12,
                'available_copies' => 8,
                'shelf_location' => 'ធ្នើ B-04',
                'cover_image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
                'file_url' => '/uploads/books/electrical-wiring-standards.pdf',
                'is_ebook' => false,
                'is_featured' => true,
                'status' => 'available',
                'description' => 'ក្បួនខ្នាតនិងបទដ្ឋានបច្ចេកទេសស្តីពីការរៀបចំសៀគ្វីអគ្គិសនី ការតម្លើងទូបញ្ជា ការគណនាបន្ទុកថាមពល និងសុវត្ថិភាពអគ្គិសនីតាមស្តង់ដារជាតិ និង IEC។',
            ],
            [
                'title_km' => 'វិស្វកម្មសំណង់ស៊ីវិលទំនើប និងការគណនាប្លង់អគារ',
                'title_en' => 'Modern Civil Engineering Structures & Building Design',
                'author' => 'សុខ គឹមលាង (Sok Kimleang)',
                'isbn' => '978-0470549735',
                'call_number' => 'TA683.2 .S65 2024',
                'category_id' => $savedCategories['CE-ENG'] ?? null,
                'publisher' => 'RPITSSR Civil Dept Press',
                'publish_year' => 2024,
                'edition' => 'បោះពុម្ពលើកទី ១',
                'language' => 'km',
                'total_copies' => 10,
                'available_copies' => 6,
                'shelf_location' => 'ធ្នើ C-08',
                'cover_image' => 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
                'file_url' => null,
                'is_ebook' => false,
                'is_featured' => false,
                'status' => 'available',
                'description' => 'ការគណនាគ្រឿងបង្គុំបេតុងអាម៉េ ការស្ទង់វាស់បាតគ្រឹះ និងការប្រើប្រាស់កម្មវិធីកុំព្យូទ័រ AutoCAD និង Etabs ក្នុងវិស័យសំណង់ស៊ីវិល។',
            ],
            [
                'title_km' => 'បច្ចេកវិទ្យាប្រព័ន្ធរថយន្តទំនើប និងការវិភាគម៉ាស៊ីន EFI',
                'title_en' => 'Automotive Technology & EFI Engine Diagnostics',
                'author' => 'អ៊ុច ចំរើន (Ouch Chamroeun)',
                'isbn' => '978-1118032787',
                'call_number' => 'TL210 .O83 2023',
                'category_id' => $savedCategories['AUTO-MECH'] ?? null,
                'publisher' => 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប',
                'publish_year' => 2023,
                'edition' => 'បោះពុម្ពលើកទី ២',
                'language' => 'km',
                'total_copies' => 8,
                'available_copies' => 2,
                'shelf_location' => 'ធ្នើ D-03',
                'cover_image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
                'file_url' => '/uploads/books/automotive-efi-diagnostics.pdf',
                'is_ebook' => true,
                'is_featured' => true,
                'status' => 'available',
                'description' => 'ទ្រឹស្តីនិងការអនុវត្តលើប្រព័ន្ធបាញ់ប្រេងអេឡិចត្រូនិច EFI, ប្រព័ន្ធហ្វ្រាំង ABS, ប្រអប់លេខស្វ័យប្រវត្តិ និងឧបករណ៍ Scan Tool វិភាគកូដ OBD-II។',
            ],
            [
                'title_km' => 'ភាសាអង់គ្លេសបច្ចេកទេសសម្រាប់វិជ្ជាជីវៈ TVET',
                'title_en' => 'Technical English for Vocational & Technical Education',
                'author' => 'Sarah Jenkins & ម៉ែន សារ៉ុម',
                'isbn' => '978-0194422795',
                'call_number' => 'PE1128 .J46 2022',
                'category_id' => $savedCategories['LANG-GEN'] ?? null,
                'publisher' => 'Oxford University Press / RPITSSR',
                'publish_year' => 2022,
                'edition' => 'បោះពុម្ពលើកទី ៤',
                'language' => 'en',
                'total_copies' => 25,
                'available_copies' => 20,
                'shelf_location' => 'ធ្នើ F-01',
                'cover_image' => 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
                'file_url' => '/uploads/books/technical-english-handbook.pdf',
                'is_ebook' => true,
                'is_featured' => false,
                'status' => 'available',
                'description' => 'វាក្យសព្ទបច្ចេកទេស ការសរសេររបាយការណ៍វិស្វកម្ម ការប្រាស្រ័យទាក់ទងក្នុងកន្លែងធ្វើការ និងការត្រៀមសម្ភាសន៍ការងារសម្រាប់និស្សិត TVET។',
            ],
            [
                'title_km' => 'ប្រព័ន្ធទូរទឹកកក និងម៉ាស៊ីនត្រជាក់ពាណិជ្ជកម្ម',
                'title_en' => 'Commercial Refrigeration & Air Conditioning Principles',
                'author' => 'ខន សុធា (Khorn Sothea)',
                'isbn' => '978-0132857801',
                'call_number' => 'TP492 .K48 2023',
                'category_id' => $savedCategories['EE-ENG'] ?? null,
                'publisher' => 'RPITSSR HVAC Lab Press',
                'publish_year' => 2023,
                'edition' => 'បោះពុម្ពលើកទី ១',
                'language' => 'km',
                'total_copies' => 10,
                'available_copies' => 5,
                'shelf_location' => 'ធ្នើ B-10',
                'cover_image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
                'file_url' => null,
                'is_ebook' => false,
                'is_featured' => false,
                'status' => 'available',
                'description' => 'គោលការណ៍កម្ដៅ និងវដ្តទូរទឹកកក ការតម្លើងម៉ាស៊ីនត្រជាក់អគារ VRV/VRF និងការថែទាំប្រព័ន្ធត្រជាក់ឧស្សាហកម្មប្រកបដោយប្រសិទ្ធភាពថាមពល។',
            ],
            [
                'title_km' => 'សេវាកម្មបដិសណ្ឋារកិច្ច និងប្រតិបត្តិការសណ្ឋាគារកម្រិតអន្តរជាតិ',
                'title_en' => 'Hospitality Operations & International Hotel Services',
                'author' => 'ជា រដ្ឋា (Chea Ratha)',
                'isbn' => '978-0470638521',
                'call_number' => 'TX911.3 .C54 2024',
                'category_id' => $savedCategories['TH-MGMT'] ?? null,
                'publisher' => 'Angkor Hospitality Institute / RPITSSR',
                'publish_year' => 2024,
                'edition' => 'បោះពុម្ពលើកទី ២',
                'language' => 'km',
                'total_copies' => 14,
                'available_copies' => 10,
                'shelf_location' => 'ធ្នើ E-02',
                'cover_image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
                'file_url' => '/uploads/books/hospitality-operations-guide.pdf',
                'is_ebook' => true,
                'is_featured' => false,
                'status' => 'available',
                'description' => 'ការគ្រប់គ្រងផ្នែកទទួលភ្ញៀវ (Front Office) ផ្នែកគេហកិច្ច (Housekeeping) និងស្តង់ដារបម្រើសេវាលំដាប់ផ្កាយប្រាំនៅខេត្តសៀមរាបអង្គរ។',
            ],
            [
                'title_km' => 'បញ្ញាសិប្បនិម្មិត និងវិទ្យាសាស្ត្រទិន្នន័យសម្រាប់បច្ចេកវិទ្យា ៤.០',
                'title_en' => 'Artificial Intelligence & Data Science for Industry 4.0',
                'author' => 'សាស្ត្រាចារ្យ គង់ វិបុល (Prof. Kong Vibol)',
                'isbn' => '978-0262035613',
                'call_number' => 'Q335 .K66 2025',
                'category_id' => $savedCategories['CS-IT'] ?? null,
                'publisher' => 'RPITSSR Innovation Lab',
                'publish_year' => 2025,
                'edition' => 'បោះពុម្ពលើកទី ១ (1st Edition)',
                'language' => 'km',
                'total_copies' => 8,
                'available_copies' => 4,
                'shelf_location' => 'ធ្នើ A-05',
                'cover_image' => 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
                'file_url' => '/uploads/books/ai-data-science-handbook.pdf',
                'is_ebook' => true,
                'is_featured' => true,
                'status' => 'available',
                'description' => 'ការយល់ដឹងអំពី Machine Learning, Deep Learning, Python Data Science និងការអនុវត្ត AI ក្នុងការផលិតកម្មឆ្លាតវៃ និងស្វ័យប្រវត្តិកម្ម។',
            ],
        ];

        $savedBooks = [];
        foreach ($books as $bData) {
            $book = Book::firstOrCreate(
                ['isbn' => $bData['isbn']],
                $bData
            );
            $savedBooks[] = $book;
        }

        // 3. Sample Borrowings
        $borrowings = [
            [
                'book_id' => $savedBooks[0]->id ?? 1,
                'student_name' => 'វឿន ចំរើន (Voeun Chamroeun)',
                'student_id' => 'STU-2025-089',
                'borrow_date' => '2026-03-01',
                'due_date' => '2026-03-25',
                'return_date' => null,
                'status' => 'borrowed',
                'notes' => 'ខ្ចីសម្រាប់ធ្វើសារណាបញ្ចប់ការសិក្សាឆ្នាំទី ៣',
            ],
            [
                'book_id' => $savedBooks[1]->id ?? 2,
                'student_name' => 'កែវ សុផាត (Keo Sophat)',
                'student_id' => 'STU-2025-112',
                'borrow_date' => '2026-02-10',
                'due_date' => '2026-02-28',
                'return_date' => '2026-02-27',
                'status' => 'returned',
                'notes' => 'បានប្រគល់សៀវភៅមកវិញក្នុងស្ថានភាពល្អប្រសើរ',
            ],
            [
                'book_id' => $savedBooks[2]->id ?? 3,
                'student_name' => 'មុំ ស្រីនិច (Mom Sreynich)',
                'student_id' => 'STU-2025-045',
                'borrow_date' => '2026-02-15',
                'due_date' => '2026-03-01',
                'return_date' => null,
                'status' => 'overdue',
                'notes' => 'ហួសកាលកំណត់សង បានផ្ញើសាររំលឹកតាមតេឡេក្រាម',
            ],
            [
                'book_id' => $savedBooks[3]->id ?? 4,
                'student_name' => 'ជា វិសាល (Chea Visal)',
                'student_id' => 'STU-2025-204',
                'borrow_date' => '2026-03-05',
                'due_date' => '2026-03-20',
                'return_date' => null,
                'status' => 'borrowed',
                'notes' => 'ខ្ចីស្រាវជ្រាវប្រព័ន្ធ EFI ក្នុងរោងជាងរថយន្ត',
            ],
        ];

        foreach ($borrowings as $borrowData) {
            BookBorrowing::firstOrCreate(
                [
                    'book_id' => $borrowData['book_id'],
                    'student_id' => $borrowData['student_id'],
                    'borrow_date' => $borrowData['borrow_date'],
                ],
                $borrowData
            );
        }
    }
}
