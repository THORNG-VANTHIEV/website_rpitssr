<?php

namespace Database\Seeders;

use App\Models\Document;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documents = [
            // 1. ADMISSIONS & SCHOLARSHIPS
            [
                'code' => 'FORM-TVET-01',
                'category' => 'admissions',
                'file_type' => 'pdf',
                'file_size' => '1.2 MB',
                'file_path' => '/storage/uploads/documents/form_tvet_1_5m.pdf',
                'downloads_count' => 5240,
                'is_popular' => true,
                'is_active' => true,
                'order' => 1,
                'title_km' => 'ពាក្យសុំចុះឈ្មោះវគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ ១.៥ លាននាក់ (TVET 1.5M)',
                'title_en' => 'TVET 1.5M Vocational Training Scholarship Application Form',
                'description_km' => 'ទម្រង់ពាក្យសុំចុះឈ្មោះរៀនវគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈកម្រិត ១ (C1) ឥតគិតថ្លៃ ១០០% និងទទួលបានប្រាក់ឧបត្ថម្ភប្រចាំខែ ២៨០,០០០ រៀល សម្រាប់គ្រួសារក្រីក្រ និងងាយរងហានិភ័យ។',
                'description_en' => 'Official application form for 100% tuition-free TVET Level 1 certificate programs with monthly 280,000 KHR stipend for eligible youth and vulnerable households.',
                'submission_office' => 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
                'required_docs_km' => [
                    'រូបថត ៤x៦ ចំនួន ៣ សន្លឹក (ផ្ទៃខាងក្រោយពណ៌ស ឬខៀវ)',
                    'ច្បាប់ចម្លងអត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ ឬសំបុត្រកំណើត (មានបញ្ជាក់)',
                    'ច្បាប់ចម្លងប័ណ្ណសមធម៌ (ប័ណ្ណក្រីក្រ) ឬប័ណ្ណងាយរងហានិភ័យ (បើមាន)'
                ],
                'required_docs_en' => [
                    '3 passport-size photos (4x6 cm, white or blue background)',
                    'Certified copy of Cambodian National ID card or Birth Certificate',
                    'Copy of IDPoor Card or Vulnerable Household Card (if applicable)'
                ],
            ],
            [
                'code' => 'FORM-ADM-02',
                'category' => 'admissions',
                'file_type' => 'pdf',
                'file_size' => '980 KB',
                'file_path' => '/storage/uploads/documents/form_higher_diploma.pdf',
                'downloads_count' => 3120,
                'is_popular' => true,
                'is_active' => true,
                'order' => 2,
                'title_km' => 'ពាក្យសុំចុះឈ្មោះកម្រិតសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (Higher Diploma / Associate Degree)',
                'title_en' => 'Higher Diploma / Associate Degree Admission Application Form',
                'description_km' => 'ទម្រង់ពាក្យសុំចូលរៀនកម្រិតសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង ២ ឆ្នាំ) លើមុខជំនាញព័ត៌មានវិទ្យា, អគ្គិសនី, មេកានិច, សំណង់ និងទេសចរណ៍។',
                'description_en' => 'Standard admission application for 2-year Higher Technical Diploma programs across IT, Electrical, Automotive, Civil Engineering, and Hospitality.',
                'submission_office' => 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
                'required_docs_km' => [
                    'សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប) ឬសញ្ញាបត្របច្ចេកទេសកម្រិត ៣ (C3)',
                    'ព្រឹត្តិបត្រពិន្ទុប្រឡងបាក់ឌុប ឬវិញ្ញាបនបត្របណ្តោះអាសន្ន',
                    'រូបថត ៤x៦ ចំនួន ៤ សន្លឹក និងសៀវភៅស្នាក់នៅ ឬសៀវភៅគ្រួសារ'
                ],
                'required_docs_en' => [
                    'High School Diploma (BacII) certificate or TVET Level 3 (C3) Diploma',
                    'National BacII Exam Grade Slip or Provisional Graduation Letter',
                    '4 passport photos (4x6 cm) and copy of Family Book / Residency Book'
                ],
            ],
            [
                'code' => 'FORM-ADM-03',
                'category' => 'admissions',
                'file_type' => 'pdf',
                'file_size' => '1.1 MB',
                'file_path' => '/storage/uploads/documents/form_bachelor_tech.pdf',
                'downloads_count' => 2450,
                'is_popular' => false,
                'is_active' => true,
                'order' => 3,
                'title_km' => 'ពាក្យសុំចុះឈ្មោះកម្រិតបរិញ្ញាបត្របច្ចេកវិទ្យា (Bachelor of Technology - B.Tech)',
                'title_en' => 'Bachelor of Technology (B.Tech 4-Year) Admission Application',
                'description_km' => 'ទម្រង់ពាក្យសុំចុះឈ្មោះចូលរៀនថ្នាក់បរិញ្ញាបត្របច្ចេកវិទ្យា ៤ ឆ្នាំ និងថ្នាក់បន្តវេនពីសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (Bridging Course)។',
                'description_en' => 'Application form for 4-year Bachelor of Technology degree and technical university bridging transfer programs.',
                'submission_office' => 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
                'required_docs_km' => [
                    'សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ ឬសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (សម្រាប់ថ្នាក់បន្ត)',
                    'ព្រឹត្តិបត្រពិន្ទុសិក្សា និងលិខិតបញ្ជាក់ការសិក្សាពីគ្រឹះស្ថានដើម',
                    'រូបថត ៤x៦ ចំនួន ៤ សន្លឹក'
                ],
                'required_docs_en' => [
                    'High School Diploma (BacII) or Higher Diploma (for transfer entrants)',
                    'Official academic transcripts and letter of completion from previous institution',
                    '4 passport photos (4x6 cm)'
                ],
            ],
            [
                'code' => 'FORM-DORM-01',
                'category' => 'admissions',
                'file_type' => 'docx',
                'file_size' => '650 KB',
                'file_path' => '/storage/uploads/documents/form_dorm_apply.docx',
                'downloads_count' => 1890,
                'is_popular' => false,
                'is_active' => true,
                'order' => 4,
                'title_km' => 'ពាក្យស្នើសុំស្នាក់នៅអន្តេវាសិកដ្ឋាននិស្សិត RPITSSR (Campus Dormitory Request)',
                'title_en' => 'Campus Dormitory Accommodation Application Form',
                'description_km' => 'ទម្រង់ស្នើសុំកន្លែងស្នាក់នៅអន្តេវាសិកដ្ឋានក្នុងបរិវេណវិទ្យាស្ថាន សម្រាប់សិស្ស-និស្សិតមកពីខេត្ត ឬស្រុកឆ្ងាយៗ និងសិស្សអាហារូបករណ៍ក្រីក្រ។',
                'description_en' => 'Application for subsidized on-campus dormitory accommodation for students from distant provinces and scholarship recipients.',
                'submission_office' => 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
                'required_docs_km' => [
                    'ពាក្យស្នើសុំស្នាក់នៅដែលមានហត្ថលេខាអាណាព្យាបាល',
                    'លិខិតបញ្ជាក់ទីលំនៅពីអាជ្ញាធរឃុំ/សង្កាត់',
                    'កិច្ចសន្យាគោរពបទបញ្ជាផ្ទៃក្នុងអន្តេវាសិកដ្ឋាន'
                ],
                'required_docs_en' => [
                    'Dormitory request form endorsed by parent or legal guardian',
                    'Commune residency verification certificate',
                    'Signed agreement adhering to campus dormitory code of conduct'
                ],
            ],

            // 2. ACADEMIC CALENDARS & SCHEDULES
            [
                'code' => 'CAL-ACAD-26',
                'category' => 'calendars',
                'file_type' => 'pdf',
                'file_size' => '2.4 MB',
                'file_path' => '/storage/uploads/documents/cal_acad_2026.pdf',
                'downloads_count' => 4890,
                'is_popular' => true,
                'is_active' => true,
                'order' => 5,
                'title_km' => 'ប្រតិទិនសិក្សា និងថ្ងៃឈប់សម្រាកផ្លូវការប្រចាំឆ្នាំ ២០២៦-២០២៧',
                'title_en' => 'Official Academic Calendar & Holiday Schedule 2026-2027',
                'description_km' => 'ប្រតិទិនលម្អិតអំពីកាលបរិច្ឆេទបើកបវេសនកាល ការចុះឈ្មោះមុខវិជ្ជា ការប្រឡងពាក់កណ្តាលឆមាស ការប្រឡងបញ្ចប់ឆមាស និងថ្ងៃឈប់សម្រាកបុណ្យជាតិ។',
                'description_en' => 'Comprehensive schedule of semester terms, course add/drop deadlines, midterm & final exam periods, and official public holidays.',
                'submission_office' => 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A)',
                'required_docs_km' => ['ឯកសារយោង និងព័ត៌មានទូទៅសម្រាប់និស្សិតគ្រប់ដេប៉ាតឺម៉ង់'],
                'required_docs_en' => ['Official reference schedule for all registered students and faculty'],
            ],
            [
                'code' => 'SCHED-EXAM-S1',
                'category' => 'calendars',
                'file_type' => 'pdf',
                'file_size' => '820 KB',
                'file_path' => '/storage/uploads/documents/sched_exam_s1.pdf',
                'downloads_count' => 3670,
                'is_popular' => true,
                'is_active' => true,
                'order' => 6,
                'title_km' => 'តារាងកាលវិភាគប្រឡងឆមាសទី ១ ឆ្នាំសិក្សា ២០២៦-២០២៧ (Semester 1 Exam Schedule)',
                'title_en' => 'Semester 1 Examination Timetable & Room Allocations 2026-2027',
                'description_km' => 'តារាងកាលបរិច្ឆេទ ម៉ោងប្រឡង បន្ទប់ប្រឡង និងសមាសភាពអនុរក្ស សម្រាប់និស្សិតគ្រប់កម្រិត (TVET C1-C3, សញ្ញាបត្រជាន់ខ្ពស់ និងបរិញ្ញាបត្រ)។',
                'description_en' => 'Exam dates, session times, room allocations, and exam invigilator assignments for all degree and vocational cohorts.',
                'submission_office' => 'គណៈកម្មការរៀបចំការប្រឡងវិទ្យាស្ថាន',
                'required_docs_km' => ['និស្សិតត្រូវកាន់កាតសិស្ស (Student ID Card) ចូលបន្ទប់ប្រឡងជាចាំបាច់'],
                'required_docs_en' => ['Mandatory presentation of valid Student ID Card upon entering exam hall'],
            ],
            [
                'code' => 'SCHED-INTERN-26',
                'category' => 'calendars',
                'file_type' => 'xlsx',
                'file_size' => '450 KB',
                'file_path' => '/storage/uploads/documents/sched_intern_26.xlsx',
                'downloads_count' => 1640,
                'is_popular' => false,
                'is_active' => true,
                'order' => 7,
                'title_km' => 'កាលវិភាគ និងបញ្ជីសហគ្រាសទទួលសិស្សចុះកម្មសិក្សាការងារ (Internship Placement List)',
                'title_en' => 'Enterprise Internship Timeline & Partner Placement Directory',
                'description_km' => 'កាលវិភាគលម្អិតនៃការចុះហាត់ការនៅសហគ្រាសដៃគូ សណ្ឋាគារ រោងចក្រ និងក្រុមហ៊ុនបច្ចេកវិទ្យាក្នុងខេត្តសៀមរាប និងរាជធានីភ្នំពេញ។',
                'description_en' => 'Industry practicum timeline and directory of enterprise partners offering student placements across hospitality, auto, and IT.',
                'submission_office' => 'ការិយាល័យទំនាក់ទំនងសហគ្រាស និងការងារ (អគារ B, បន្ទប់ ១០១)',
                'required_docs_km' => ['ទម្រង់វាយតម្លៃការងារ និងសៀវភៅតាមដានកម្មសិក្សា'],
                'required_docs_en' => ['Supervisor performance assessment form and weekly logbook'],
            ],

            // 3. STUDENT HANDBOOKS & REGULATIONS
            [
                'code' => 'HB-STU-2026',
                'category' => 'handbooks',
                'file_type' => 'pdf',
                'file_size' => '3.8 MB',
                'file_path' => '/storage/uploads/documents/hb_stu_2026.pdf',
                'downloads_count' => 2980,
                'is_popular' => true,
                'is_active' => true,
                'order' => 8,
                'title_km' => 'សៀវភៅណែនាំនិស្សិត និងបទបញ្ជាផ្ទៃក្នុងវិទ្យាស្ថាន RPITSSR (Student Handbook)',
                'title_en' => 'Student Handbook & Institutional Code of Conduct',
                'description_km' => 'សៀវភៅណែនាំពេញលេញស្តីពីបទបញ្ជាផ្ទៃក្នុង ការស្លៀកពាក់ វិន័យ សិទ្ធិ និងកាតព្វកិច្ចរបស់និស្សិត ព្រមទាំងប្រព័ន្ធពិន្ទុ និងការផ្តល់រង្វាន់លើកទឹកចិត្ត។',
                'description_en' => 'Comprehensive guide detailing campus regulations, uniform policy, code of student discipline, academic integrity, and graduation criteria.',
                'submission_office' => 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A)',
                'required_docs_km' => ['និស្សិតគ្រប់រូបត្រូវអាន និងយល់ដឹងឱ្យបានច្បាស់លាស់ពីបទបញ្ជាផ្ទៃក្នុង'],
                'required_docs_en' => ['All enrolled students are required to read and comply with the student handbook'],
            ],
            [
                'code' => 'HB-SAFE-01',
                'category' => 'handbooks',
                'file_type' => 'pdf',
                'file_size' => '2.1 MB',
                'file_path' => '/storage/uploads/documents/hb_safe_01.pdf',
                'downloads_count' => 2150,
                'is_popular' => false,
                'is_active' => true,
                'order' => 9,
                'title_km' => 'ស្តង់ដារសុវត្ថិភាព និងការប្រើប្រាស់រោងជាងបច្ចេកទេស (Workshop Safety Manual - OSH)',
                'title_en' => 'Occupational Safety and Health (OSH) Workshop Safety Manual',
                'description_km' => 'សៀវភៅណែនាំស្តង់ដារសុវត្ថិភាពការងារក្នុងរោងជាងយានយន្ត អគ្គិសនី មេកានិច និងការដ្ឋានសំណង់ ស្របតាមបទដ្ឋានសុវត្ថិភាពការងារជាតិ។',
                'description_en' => 'Workshop safety rules, personal protective equipment (PPE) compliance, and emergency protocols for engineering laboratories.',
                'submission_office' => 'ដេប៉ាតឺម៉ង់បច្ចេកទេស និងការិយាល័យរដ្ឋបាល',
                'required_docs_km' => ['តម្រូវឱ្យពាក់ឧបករណ៍ការពារខ្លួន (PPE) គ្រប់ពេលអនុវត្តការងារ'],
                'required_docs_en' => ['Mandatory PPE wear during all workshop practical sessions'],
            ],
            [
                'code' => 'HB-INTERN-01',
                'category' => 'handbooks',
                'file_type' => 'pdf',
                'file_size' => '1.6 MB',
                'file_path' => '/storage/uploads/documents/hb_intern_01.pdf',
                'downloads_count' => 1720,
                'is_popular' => false,
                'is_active' => true,
                'order' => 10,
                'title_km' => 'សៀវភៅណែនាំការចុះកម្មសិក្សា និងការសរសេររបាយការណ៍បញ្ចប់ការសិក្សា (Internship Guide)',
                'title_en' => 'Internship Practicum & Capstone Project Report Writing Guidelines',
                'description_km' => 'ការណែនាំអំពីរបៀបរៀបចំខ្លួនចុះហាត់ការនៅក្រុមហ៊ុន និងទម្រង់ស្តង់ដារនៃការសរសេររបាយការណ៍គម្រោងបញ្ចប់ការសិក្សា (Project Report)។',
                'description_en' => 'Standard guidelines on internship conduct, company evaluation criteria, and capstone technical project report formatting.',
                'submission_office' => 'ការិយាល័យទំនាក់ទំនងសហគ្រាស និងការងារ',
                'required_docs_km' => ['លិខិតឧទ្ទេសនាមពីវិទ្យាស្ថាន និងកិច្ចសន្យាហាត់ការ'],
                'required_docs_en' => ['Institutional introduction letter and tripartite internship agreement'],
            ],

            // 4. ADMINISTRATIVE & STUDENT SERVICE FORMS
            [
                'code' => 'FORM-ADM-CERT',
                'category' => 'adminForms',
                'file_type' => 'docx',
                'file_size' => '480 KB',
                'file_path' => '/storage/uploads/documents/form_transcript_req.docx',
                'downloads_count' => 3890,
                'is_popular' => true,
                'is_active' => true,
                'order' => 11,
                'title_km' => 'ពាក្យស្នើសុំលិខិតបញ្ជាក់ការសិក្សា ឬព្រឹត្តិបត្រពិន្ទុផ្លូវការ (Transcript Request Form)',
                'title_en' => 'Official Academic Transcript & Student Status Request Form',
                'description_km' => 'ទម្រង់បែបបទស្នើសុំព្រឹត្តិបត្រពិន្ទុជាភាសាខ្មែរ/អង់គ្លេស ឬលិខិតបញ្ជាក់កំពុងសិក្សា សម្រាប់យកទៅប្រើប្រាស់ដាក់ពាក្យការងារ ឬសុំអាហារូបករណ៍។',
                'description_en' => 'Official request form for bilingual academic transcripts or proof-of-enrollment certificates for employment or scholarship applications.',
                'submission_office' => 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
                'required_docs_km' => [
                    'ច្បាប់ចម្លងកាតសិស្ស ឬបង្កាន់ដៃបង់ថ្លៃសិក្សា (បើមាន)',
                    'រយៈពេលរង់ចាំដំណើរការឯកសារ៖ ៣ ទៅ ៥ ថ្ងៃនៃថ្ងៃធ្វើការ'
                ],
                'required_docs_en' => [
                    'Copy of Student ID card or registration receipt',
                    'Standard processing turnaround time: 3-5 working days'
                ],
            ],
            [
                'code' => 'FORM-STU-LEAVE',
                'category' => 'adminForms',
                'file_type' => 'docx',
                'file_size' => '420 KB',
                'file_path' => '/storage/uploads/documents/form_leave_request.docx',
                'downloads_count' => 2210,
                'is_popular' => false,
                'is_active' => true,
                'order' => 12,
                'title_km' => 'ពាក្យសុំច្បាប់ឈប់សម្រាកបណ្តោះអាសន្ន ឬផ្អាកការសិក្សា (Leave of Absence Form)',
                'title_en' => 'Temporary Leave of Absence & Study Deferral Request Form',
                'description_km' => 'ទម្រង់សុំច្បាប់សម្រាកព្យាបាលជំងឺ ឬផ្អាកការសិក្សាមួយឆមាសដោយមានហេតុផលចាំបាច់ ដោយរក្សាទុកកំណត់ត្រាសិក្សា។',
                'description_en' => 'Form for medical leave of absence or temporary semester deferral with academic standing preservation.',
                'submission_office' => 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
                'required_docs_km' => [
                    'វេជ្ជបញ្ជា ឬលិខិតបញ្ជាក់ពីមន្ទីរពេទ្យ (ករណីឈឺ)',
                    'ហត្ថលេខាឯកភាពពីប្រធានដេប៉ាតឺម៉ង់ និងអាណាព្យាបាល'
                ],
                'required_docs_en' => [
                    'Medical certificate or hospital letter (for health leaves)',
                    'Department head endorsement and parental consent'
                ],
            ],
            [
                'code' => 'FORM-STU-TRANS',
                'category' => 'adminForms',
                'file_type' => 'docx',
                'file_size' => '460 KB',
                'file_path' => '/storage/uploads/documents/form_transfer_major.docx',
                'downloads_count' => 1430,
                'is_popular' => false,
                'is_active' => true,
                'order' => 13,
                'title_km' => 'ពាក្យស្នើសុំប្តូរវេនសិក្សា ឬប្តូរជំនាញ (Major / Shift Change Request Form)',
                'title_en' => 'Course Major / Study Shift Transfer Application Form',
                'description_km' => 'ទម្រង់ស្នើសុំប្តូរវេនសិក្សា (វេនព្រឹក វេនរសៀល ឬវេនយប់/ចុងសប្តាហ៍) ឬប្តូរជំនាញក្នុងអំឡុងពេល ២ សប្តាហ៍ដំបូងនៃដើមឆមាស។',
                'description_en' => 'Application form to switch study shifts (Morning, Afternoon, Weekend) or transfer technical majors during the first 2 weeks of the semester.',
                'submission_office' => 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
                'required_docs_km' => [
                    'លិខិតបញ្ជាក់ការងារ (ករណីសុំប្តូរវេនយប់/ចុងសប្តាហ៍)',
                    'ការយល់ព្រមពីប្រធានដេប៉ាតឺម៉ង់ទាំងសងខាង'
                ],
                'required_docs_en' => [
                    'Employer work letter (if requesting transfer to weekend/evening shift)',
                    'Mutual approval from both releasing and receiving department heads'
                ],
            ],
        ];

        foreach ($documents as $doc) {
            Document::updateOrCreate(
                ['code' => $doc['code']],
                $doc
            );
        }
    }
}
