<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\ExamResult;
use App\Models\Faq;
use App\Models\GalleryImage;
use App\Models\Notice;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class InitialContentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. FAQs
        if (Faq::count() === 0) {
            $faqs = [
                [
                    'question' => 'តើវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប មានបណ្តុះបណ្តាលកម្រិតណាខ្លះ?',
                    'answer' => 'វិទ្យាស្ថានផ្តល់ការបណ្តុះបណ្តាលចាប់ពីកម្រិតវិញ្ញាបនបត្របច្ចេកទេស និងវិជ្ជាជីវៈ (C1, C2, C3), សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង / Associate Degree), និងបរិញ្ញាបត្របច្ចេកវិទ្យា (Bachelor of Technology) លើជំនាញវិស្វកម្ម និងបច្ចេកវិទ្យាជាច្រើន។',
                    'order' => 1,
                ],
                [
                    'question' => 'តើនិស្សិតអាចចុះឈ្មោះចូលរៀនតាមរបៀបណា?',
                    'answer' => 'បេក្ខជនអាចមកដាក់ពាក្យដោយផ្ទាល់នៅការិយាល័យសិក្សានៃវិទ្យាស្ថាន ឬចុះឈ្មោះតាមប្រព័ន្ធអនឡាញលើគេហទំព័រផ្លូវការ rpitssr.edu.kh ក្នុងរដូវកាលចុះឈ្មោះចូលរៀន។',
                    'order' => 2,
                ],
                [
                    'question' => 'តើមានអាហារូបករណ៍ ១.៥ លាននាក់របស់រាជរដ្ឋាភិបាលដែរឬទេ?',
                    'answer' => 'បាទ/ចាស! វិទ្យាស្ថានជាគ្រឹះស្ថាន TVET សាធារណៈដែលអនុវត្តកម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស ១.៥ លាននាក់ ដោយឥតគិតថ្លៃសិក្សា និងមានប្រាក់ឧបត្ថម្ភប្រចាំខែ ២៨០,០០០ រៀល សម្រាប់យុវជនមកពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះ (ប័ណ្ណក្រីក្រ/សមធម៌)។',
                    'order' => 3,
                ],
                [
                    'question' => 'តើវិទ្យាស្ថានមានកន្លែងស្នាក់នៅ (អន្តេវាសិកដ្ឋាន) សម្រាប់សិស្ស-និស្សិតមកពីខេត្តឆ្ងាយដែរឬទេ?',
                    'answer' => 'វិទ្យាស្ថានមានអគារអន្តេវាសិកដ្ឋានប្រកបដោយផាសុកភាព និងសុវត្ថិភាពខ្ពស់ ផ្តល់អាទិភាពដល់សិស្ស-និស្សិតនារី និងសិស្សមកពីតំបន់ដាច់ស្រយាល។',
                    'order' => 4,
                ],
                [
                    'question' => 'តើនិស្សិតបញ្ចប់ការសិក្សាទទួលបានឱកាសការងារយ៉ាងដូចម្តេច?',
                    'answer' => 'អត្រាការងាររបស់និស្សិតបញ្ចប់ការសិក្សាពី RPITSSR មានលើសពី ៩៥% ដោយសារវិទ្យាស្ថានមានកិច្ចសហការយ៉ាងជិតស្និទ្ធជាមួយក្រុមហ៊ុន រោងចក្រ សហគ្រាស និងឧស្សាហកម្មជាង ១០០ នៅក្នុងប្រទេសកម្ពុជា និងក្រៅប្រទេស។',
                    'order' => 5,
                ],
            ];
            foreach ($faqs as $faq) {
                Faq::create($faq);
            }
        }

        // 2. Notices
        if (Notice::count() === 0) {
            $notices = [
                [
                    'title' => 'សេចក្តីជូនដំណឹងស្តីពីការជ្រើសរើសសិស្ស-និស្សិតចូលរៀនវគ្គថ្មី ឆ្នាំសិក្សា ២០២៦-២០២៧',
                    'content' => 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប សូមជូនដំណឹងដល់ប្អូនៗសិស្សានុសិស្សទាំងអស់ឱ្យបានជ្រាបថា វិទ្យាស្ថានចាប់ផ្តើមទទួលពាក្យសុំចូលរៀនចាប់ពីថ្ងៃផ្សាយដំណឹងនេះតទៅលើមុខជំនាញបច្ចេកវិទ្យាព័ត៌មាន អគ្គិសនី យានយន្ត សំណង់ស៊ីវិល និងបរិក្ខារត្រជាក់។',
                    'date' => '2026-08-20',
                ],
                [
                    'title' => 'កាលវិភាគប្រឡងឆមាសទី២ សម្រាប់សិស្ស-និស្សិតគ្រប់កម្រិតបណ្តុះបណ្តាល',
                    'content' => 'ការិយាល័យសិក្សាសូមប្រកាសផ្សាយកាលវិភាគប្រឡងឆមាសទី២។ សិស្ស-និស្សិតទាំងអស់ត្រូវពិនិត្យមើលកាលវិភាគតាមបន្ទប់ និងគោរពបទបញ្ជាផ្ទៃក្នុងនៃការប្រឡងឱ្យបានខ្ជាប់ខ្ជួន។',
                    'date' => '2026-08-05',
                ],
                [
                    'title' => 'សេចក្តីប្រកាសស្តីពីការផ្តល់អាហារូបករណ៍ ១.៥ លាននាក់របស់រាជរដ្ឋាភិបាលកម្ពុជា',
                    'content' => 'ឱកាសសិក្សាជំនាញបច្ចេកទេសឥតគិតថ្លៃ និងទទួលបានប្រាក់ឧបត្ថម្ភ ២៨០,០០០ រៀលក្នុងមួយខែ សម្រាប់យុវជនមកពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះ។',
                    'date' => '2026-07-15',
                ],
                [
                    'title' => 'ការចុះឈ្មោះហាត់ការងារ និងកម្មសិក្សាការងារនៅតាមបណ្តាក្រុមហ៊ុនដៃគូ',
                    'content' => 'ការិយាល័យទំនាក់ទំនងសហគ្រាសសូមអញ្ជើញនិស្សិតឆ្នាំបញ្ចប់មកចុះឈ្មោះជ្រើសរើសទីតាំងចុះកម្មសិក្សាការងារតាមជំនាញនីមួយៗ។',
                    'date' => '2026-06-30',
                ],
            ];
            foreach ($notices as $notice) {
                Notice::create($notice);
            }
        }

        // 3. Teachers
        if (Teacher::count() === 0) {
            $teachers = [
                [
                    'name' => 'Dr. Seng Bunthoeun',
                    'designation' => 'Director of RPITSSR',
                    'department' => 'Executive Management',
                    'imageUrl' => '/images/teachers/teacher-1.jpg',
                    'email' => 'director@rpitssr.edu.kh',
                    'phone' => '+855 63 963 888',
                    'description' => 'Dr. Seng Bunthoeun has led RPITSSR with dedication to TVET standards, international partnerships, and youth employment enhancement.',
                    'experience' => '15+ Years in Technical Education',
                    'educationalQualifications' => 'Ph.D. in Educational Management & Engineering',
                    'facebook' => 'https://facebook.com',
                    'linkedin' => 'https://linkedin.com',
                ],
                [
                    'name' => 'Eng. Chhay Kimhong',
                    'designation' => 'Head of Information Technology',
                    'department' => 'Information Technology',
                    'imageUrl' => '/images/teachers/teacher-2.jpg',
                    'email' => 'it.head@rpitssr.edu.kh',
                    'phone' => '+855 63 963 889',
                    'description' => 'Specializing in Web Development, Cloud Computing, Database Architectures, and Cybersecurity curriculum integration.',
                    'experience' => '10+ Years in Software Engineering & TVET Training',
                    'educationalQualifications' => 'Master of Science in Information Technology',
                    'facebook' => 'https://facebook.com',
                    'linkedin' => 'https://linkedin.com',
                ],
                [
                    'name' => 'Ms. Keo Sreymom',
                    'designation' => 'Senior Lecturer, Civil Engineering',
                    'department' => 'Civil Engineering',
                    'imageUrl' => '/images/teachers/teacher-3.jpg',
                    'email' => 'civil.lecturer@rpitssr.edu.kh',
                    'phone' => '+855 63 963 890',
                    'description' => 'Leading courses in Structural Engineering, AutoCAD, BIM Modeling, and Topographic Surveying.',
                    'experience' => '8+ Years in Construction Engineering & Education',
                    'educationalQualifications' => 'Master of Engineering in Civil Construction',
                    'facebook' => 'https://facebook.com',
                    'linkedin' => 'https://linkedin.com',
                ],
                [
                    'name' => 'Mr. Heng Sokheng',
                    'designation' => 'Electrical Automation Specialist',
                    'department' => 'Electrical Engineering',
                    'imageUrl' => '/images/teachers/teacher-4.jpg',
                    'email' => 'electrical@rpitssr.edu.kh',
                    'phone' => '+855 63 963 891',
                    'description' => 'Expert instructor in PLC programming, industrial wiring, solar renewable systems, and sensor network diagnostics.',
                    'experience' => '9+ Years in Industrial Automation',
                    'educationalQualifications' => 'Bachelor of Electrical & Electronics Engineering',
                    'facebook' => 'https://facebook.com',
                    'linkedin' => 'https://linkedin.com',
                ],
            ];
            foreach ($teachers as $teacher) {
                Teacher::create($teacher);
            }
        }

        // 4. Events
        if (Event::count() === 0) {
            $events = [
                [
                    'title' => 'National TVET Day Exhibition 2026',
                    'date' => '2026-06-15',
                    'time' => '08:00 AM - 05:00 PM',
                    'place' => 'RPITSSR Grand Conference Hall',
                    'imageUrl' => '/images/gallery/gallery 1.jpg',
                    'description' => 'Showcasing cutting-edge student projects, robotics, renewable solar implementations, and industrial partnership booths.',
                ],
                [
                    'title' => 'Siem Reap Technical Career Fair & Skills Matching',
                    'date' => '2026-07-20',
                    'time' => '08:30 AM - 04:30 PM',
                    'place' => 'Main Campus Courtyard',
                    'imageUrl' => '/images/gallery/gallery 2.jpg',
                    'description' => 'Over 40 leading employers and manufacturing companies conducting on-the-spot interviews for graduating students.',
                ],
                [
                    'title' => 'ASEAN Renewable Energy & IoT Workshop',
                    'date' => '2026-08-10',
                    'time' => '09:00 AM - 12:00 PM',
                    'place' => 'STEM Innovation Center, RPITSSR',
                    'imageUrl' => '/images/gallery/gallery 3.jpg',
                    'description' => 'Technical workshop exploring photovoltaic solar design, sensor analytics, and automated smart grid maintenance.',
                ],
                [
                    'title' => 'Annual Student Graduation & Certification Ceremony',
                    'date' => '2026-09-05',
                    'time' => '07:30 AM - 11:30 AM',
                    'place' => 'Grand Auditorium',
                    'imageUrl' => '/images/gallery/gallery 7.jpg',
                    'description' => 'Conferral of Associate and Bachelor degrees for the graduating cohort with government delegates in attendance.',
                ],
            ];
            foreach ($events as $event) {
                Event::create($event);
            }
        }

        // 5. Gallery Images
        if (GalleryImage::count() === 0) {
            $gallery = [
                ['title' => 'RPITSSR Main Academic Campus & Administration', 'category' => 'campus', 'imageUrl' => '/images/gallery/school.jpg', 'isActive' => true, 'order' => 1],
                ['title' => 'Faculty and Students Cohort Assembly', 'category' => 'campus', 'imageUrl' => '/images/teacher-all.jpg', 'isActive' => true, 'order' => 2],
                ['title' => 'Computer Science & Software Development Lab', 'category' => 'academic', 'imageUrl' => '/images/gallery/gallery 1.jpg', 'isActive' => true, 'order' => 3],
                ['title' => 'Electrical Automation & PLC Control Workshop', 'category' => 'academic', 'imageUrl' => '/images/gallery/gallery 2.jpg', 'isActive' => true, 'order' => 4],
                ['title' => 'Civil Construction & Architectural Design Studio', 'category' => 'academic', 'imageUrl' => '/images/gallery/gallery 3.jpg', 'isActive' => true, 'order' => 5],
                ['title' => 'Air Conditioning & Refrigeration Technology', 'category' => 'academic', 'imageUrl' => '/images/courses/Course 1.jpg', 'isActive' => true, 'order' => 6],
                ['title' => 'Automotive Engine Diagnostics & Electronic Systems', 'category' => 'academic', 'imageUrl' => '/images/courses/Course 2.jpg', 'isActive' => true, 'order' => 7],
                ['title' => 'Student Graduation and Skills Exhibition Day', 'category' => 'events', 'imageUrl' => '/images/gallery/gallery 7.jpg', 'isActive' => true, 'order' => 8],
                ['title' => 'Campus Sports & Cultural Festival', 'category' => 'events', 'imageUrl' => '/images/gallery/school.jpg', 'isActive' => true, 'order' => 9],
            ];
            foreach ($gallery as $item) {
                GalleryImage::create($item);
            }
        }

        // 6. Exam Results
        if (ExamResult::count() === 0) {
            $results = [
                [
                    'courseName' => 'Information Technology',
                    'semester' => 'Semester 2',
                    'generation' => 'Generation 12',
                    'year' => 'Year 2',
                    'examName' => 'Final Examination Semester II',
                    'studentId' => 'IT-2026-001',
                    'studentName' => 'Sok Visal',
                    'className' => 'IT-Year2-A',
                    'subject' => 'Web Application Development & Database Systems',
                    'totalMarks' => 100,
                    'obtainedMarks' => 92,
                    'percentage' => 92.0,
                    'grade' => 'A',
                    'examDate' => '2026-08-10',
                    'isPublished' => true,
                    'documentType' => 'image',
                    'resultImageUrl' => '/images/courses/Course 1.jpg',
                ],
                [
                    'courseName' => 'Information Technology',
                    'semester' => 'Semester 2',
                    'generation' => 'Generation 12',
                    'year' => 'Year 2',
                    'examName' => 'Final Examination Semester II',
                    'studentId' => 'IT-2026-002',
                    'studentName' => 'Chan Kanha',
                    'className' => 'IT-Year2-A',
                    'subject' => 'Web Application Development & Database Systems',
                    'totalMarks' => 100,
                    'obtainedMarks' => 88,
                    'percentage' => 88.0,
                    'grade' => 'B+',
                    'examDate' => '2026-08-10',
                    'isPublished' => true,
                    'documentType' => 'image',
                    'resultImageUrl' => '/images/courses/Course 1.jpg',
                ],
                [
                    'courseName' => 'Electrical Engineering',
                    'semester' => 'Semester 2',
                    'generation' => 'Generation 12',
                    'year' => 'Year 2',
                    'examName' => 'Final Examination Semester II',
                    'studentId' => 'EE-2026-015',
                    'studentName' => 'Mao Piseth',
                    'className' => 'EE-Year2-B',
                    'subject' => 'Industrial Automation & PLC Control',
                    'totalMarks' => 100,
                    'obtainedMarks' => 85,
                    'percentage' => 85.0,
                    'grade' => 'B',
                    'examDate' => '2026-08-12',
                    'isPublished' => true,
                    'documentType' => 'image',
                    'resultImageUrl' => '/images/courses/Course 2.jpg',
                ],
                [
                    'courseName' => 'Civil Engineering',
                    'semester' => 'Semester 1',
                    'generation' => 'Generation 13',
                    'year' => 'Year 1',
                    'examName' => 'Midterm Examination Semester I',
                    'studentId' => 'CE-2026-030',
                    'studentName' => 'Neth Socheata',
                    'className' => 'CE-Year1-A',
                    'subject' => 'AutoCAD & Construction Materials',
                    'totalMarks' => 100,
                    'obtainedMarks' => 95,
                    'percentage' => 95.0,
                    'grade' => 'A',
                    'examDate' => '2026-03-25',
                    'isPublished' => true,
                    'documentType' => 'image',
                    'resultImageUrl' => '/images/courses/Course 3.jpg',
                ],
            ];
            foreach ($results as $res) {
                ExamResult::create($res);
            }
        }
    }
}
