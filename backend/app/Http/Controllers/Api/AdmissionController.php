<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\Course;
use App\Models\CourseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdmissionController extends Controller
{
    /**
     * Submit an online admission application
     */
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'khmerName' => 'required|string|max:255',
            'latinName' => 'required|string|max:255',
            'gender' => 'required|in:male,female,other',
            'dob' => 'nullable|date',
            'phone' => 'required|string|max:50',
            'telegram' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'currentAddress' => 'nullable|string|max:1000',
            'courseType' => 'nullable|in:long_term,short_term',
            'degreeLevel' => 'required|string|max:100',
            'major' => 'required|string|max:255',
            'shift' => 'required|string|max:50',
            'photoUrl' => 'nullable|string|max:500',
            'certificateUrl' => 'nullable|string|max:500',
            'idCardUrl' => 'nullable|string|max:500',
            'equityCardUrl' => 'nullable|string|max:500',
        ]);

        // Auto-assign courseType if not explicitly passed
        if (empty($validated['courseType'])) {
            $validated['courseType'] = in_array($validated['degreeLevel'], ['bachelor', 'higher_diploma']) ? 'long_term' : 'short_term';
        }

        // Generate unique tracking code: APP-YYYY-XXXX
        $year = date('Y');
        do {
            $random = strtoupper(Str::random(4));
            $trackingCode = "APP-{$year}-{$random}";
        } while (Admission::where('trackingCode', $trackingCode)->exists());

        $validated['trackingCode'] = $trackingCode;
        $validated['status'] = 'pending';

        $admission = Admission::create($validated);

        return response()->json([
            'success' => true,
            'trackingCode' => $trackingCode,
            'message' => 'ការដាក់ពាក្យចូលរៀនទទួលបានជោគជ័យ! / Application submitted successfully!',
            'data' => $admission,
        ], 201);
    }

    /**
     * Public application tracking status lookup
     */
    public function track(Request $request, $trackingCode): JsonResponse
    {
        $code = trim(strtoupper($trackingCode));
        $admission = Admission::where('trackingCode', $code)->first();

        if (! $admission) {
            return response()->json([
                'success' => false,
                'message' => 'រកមិនឃើញពាក្យសុំជាមួយលេខកូដនេះឡើយ / Application not found with this tracking code.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $admission->id,
                'trackingCode' => $admission->trackingCode,
                'khmerName' => $admission->khmerName,
                'latinName' => $admission->latinName,
                'gender' => $admission->gender,
                'courseType' => $admission->courseType ?? (in_array($admission->degreeLevel, ['bachelor', 'higher_diploma']) ? 'long_term' : 'short_term'),
                'degreeLevel' => $admission->degreeLevel,
                'major' => $admission->major,
                'shift' => $admission->shift,
                'status' => $admission->status,
                'adminNotes' => $admission->adminNotes,
                'enrolledStudentId' => $admission->enrolledStudentId,
                'createdAt' => $admission->createdAt,
                'updatedAt' => $admission->updatedAt,
            ],
        ], 200);
    }

    /**
     * Get admission form options (degree levels, majors, shifts)
     */
    public function options(): JsonResponse
    {
        // 1. Program Types (វគ្គវែង vs វគ្គខ្លី)
        $programTypes = [
            [
                'id' => 'long_term',
                'nameKm' => 'វគ្គវែង (កម្រិតសញ្ញាបត្រ - បរិញ្ញាបត្រ & ជាន់ខ្ពស់)',
                'nameEn' => 'Long-Term Degree Programs (Bachelor & Higher Diploma)',
                'badge' => '២ - ៤ ឆ្នាំ',
                'descriptionKm' => 'បណ្តុះបណ្តាលកម្រិតឧត្តមសិក្សាបច្ចេកវិទ្យា ទទួលបានសញ្ញាបត្រទទួលស្គាល់ដោយក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ។',
            ],
            [
                'id' => 'short_term',
                'nameKm' => 'វគ្គខ្លី (បណ្តុះបណ្តាលវិជ្ជាជីវៈ & TVET ១,៥ លាននាក់)',
                'nameEn' => 'Short-Term Vocational Courses & TVET 1.5M',
                'badge' => '១ - ៤ ខែ',
                'descriptionKm' => 'បណ្តុះបណ្តាលជំនាញជាក់ស្តែងឆាប់ចេះ ឆាប់បានការងារ អាហារូបករណ៍ ១០០% ឥតគិតថ្លៃ ព្រមទាំងទទួលបានប្រាក់ឧបត្ថម្ភ។',
            ],
        ];

        // 2. Degree Levels categorized by courseType
        $degreeLevels = [
            // Long-term Degree Programs (វគ្គវែង)
            [
                'id' => 'bachelor',
                'courseType' => 'long_term',
                'nameKm' => 'បរិញ្ញាបត្របច្ចេកវិទ្យា (Bachelor of Technology - ៤ ឆ្នាំ)',
                'nameEn' => 'Bachelor of Technology (4 Years)',
                'shortName' => 'បរិញ្ញាបត្រ (B.Tech)',
                'duration' => '៤ ឆ្នាំ (ឬបន្ត ២ ឆ្នាំ)',
                'scholarship' => 'មានអាហារូបករណ៍រដ្ឋ',
                'requirementKm' => 'សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប) ឬសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស',
            ],
            [
                'id' => 'higher_diploma',
                'courseType' => 'long_term',
                'nameKm' => 'សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស / បរិញ្ញាបត្ររង (Higher Diploma - ២ ឆ្នាំ)',
                'nameEn' => 'Higher Technical Diploma / Associate (2 Years)',
                'shortName' => 'ជាន់ខ្ពស់បច្ចេកទេស (H.Dip)',
                'duration' => '២ ឆ្នាំ',
                'scholarship' => 'មានអាហារូបករណ៍រដ្ឋ',
                'requirementKm' => 'សញ្ញាបត្របាក់ឌុប ឬធ្លាក់បាក់ឌុប ឬវិញ្ញាបនបត្របច្ចេកទេស C3',
            ],

            // Short-term Courses (វគ្គខ្លី)
            [
                'id' => 'tvet_short',
                'courseType' => 'short_term',
                'nameKm' => 'វគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស (TVET ១,៥ លាននាក់ - C1, C2, C3)',
                'nameEn' => 'TVET 1.5M Technical & Vocational (Levels 1-3)',
                'shortName' => 'TVET ១.៥ លាននាក់ (C1-C3)',
                'duration' => '៤ ខែ / ១ កម្រិត',
                'scholarship' => 'ឥតគិតថ្លៃ ១០០% + ឧបត្ថម្ភ ២៨០,០០០៛/ខែ',
                'requirementKm' => 'សិស្ស-យុវជនទូទៅ (ប័ណ្ណសមធម៌ / គ្រួសារងាយរងហានិភ័យ)',
            ],
            [
                'id' => 'short_course',
                'courseType' => 'short_term',
                'nameKm' => 'វគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈខ្លីៗ (Short Vocational Courses - ១ ទៅ ៤ ខែ)',
                'nameEn' => 'Short-Term Vocational Course (1 to 4 Months)',
                'shortName' => 'វគ្គជំនាញខ្លីៗ',
                'duration' => '១ ទៅ ៤ ខែ',
                'scholarship' => 'តម្លៃសមរម្យ / អាហារូបករណ៍ពិសេស',
                'requirementKm' => 'សិស្ស-និស្សិត និងសាធារណជនទូទៅដែលចង់បានជំនាញជាក់ស្តែងរហ័ស',
            ],
        ];

        // 3. Dynamic Majors with bilingual Khmer & English support
        $categoryTranslations = [
            'ict' => [
                'km' => 'ព័ត៌មានវិទ្យា & វិទ្យាសាស្ត្រកុំព្យូទ័រ (ICT)',
                'en' => 'Information & Communication Technology (ICT)',
            ],
            'electricity' => [
                'km' => 'វិស្វកម្មអគ្គិសនី & ថាមពល',
                'en' => 'Electrical & Energy Engineering',
            ],
            'architechure' => [
                'km' => 'វិស្វកម្មសំណង់ស៊ីវិល & ស្ថាបត្យកម្ម',
                'en' => 'Civil Engineering & Architecture',
            ],
            'architecture' => [
                'km' => 'វិស្វកម្មសំណង់ស៊ីវិល & ស្ថាបត្យកម្ម',
                'en' => 'Civil Engineering & Architecture',
            ],
            'aircon' => [
                'km' => 'វិស្វកម្មបរិក្ខារត្រជាក់ & កម្តៅ (HVAC)',
                'en' => 'HVAC & Refrigeration Technology',
            ],
            'agriculture' => [
                'km' => 'កសិកម្ម & ក្សេត្រសាស្ត្រ',
                'en' => 'Agriculture & Agronomy',
            ],
            'animal' => [
                'km' => 'បសុសត្វ & វារីវប្បកម្ម',
                'en' => 'Animal Science & Aquaculture',
            ],
            'production' => [
                'km' => 'វិស្វកម្មមេកានិក & ផលិតកម្ម',
                'en' => 'Mechanical & Production Engineering',
            ],
            'bussiness' => [
                'km' => 'គ្រប់គ្រងពាណិជ្ជកម្ម & សហគ្រិនភាព',
                'en' => 'Business Administration & Entrepreneurship',
            ],
            'business' => [
                'km' => 'គ្រប់គ្រងពាណិជ្ជកម្ម & សហគ្រិនភាព',
                'en' => 'Business Administration & Entrepreneurship',
            ],
            'banking' => [
                'km' => 'គណនេយ្យ & ធនាគារ-ហិរញ្ញវត្ថុ',
                'en' => 'Accounting, Banking & Finance',
            ],
            'marketing' => [
                'km' => 'ទីផ្សារ & ពាណិជ្ជកម្មឌីជីថល',
                'en' => 'Marketing & Digital Commerce',
            ],
            'tourism' => [
                'km' => 'ទេសចរណ៍ & បដិសណ្ឋារកិច្ច',
                'en' => 'Tourism & Hospitality Management',
            ],
            'english' => [
                'km' => 'ភាសាអង់គ្លេសសម្រាប់ទំនាក់ទំនង & ធុរកិច្ច',
                'en' => 'English for Communication & Business',
            ],
        ];

        $categories = CourseCategory::all(['id', 'name', 'slug']);
        $majors = [];

        if ($categories->isNotEmpty()) {
            foreach ($categories as $cat) {
                $raw = trim($cat->name ?? '');
                if (empty($raw)) {
                    continue;
                }

                $normKey = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $raw));
                $slugKey = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $cat->slug ?? ''));

                $trans = $categoryTranslations[$normKey] ?? $categoryTranslations[$slugKey] ?? null;

                if ($trans) {
                    $nameKm = $trans['km'];
                    $nameEn = $trans['en'];
                } elseif (preg_match('/[\x{1780}-\x{17FF}]/u', $raw)) {
                    $nameKm = $raw;
                    $nameEn = $raw;
                } else {
                    $nameKm = $raw;
                    $nameEn = $raw;
                }

                $majors[] = [
                    'id' => $cat->id,
                    'code' => $normKey,
                    'nameKm' => $nameKm,
                    'nameEn' => $nameEn,
                    'name' => $nameKm, // default display name in Khmer
                ];
            }
        }

        if (count($majors) < 4) {
            $majors = [
                ['id' => 1, 'code' => 'ict', 'nameKm' => 'ព័ត៌មានវិទ្យា & វិទ្យាសាស្ត្រកុំព្យូទ័រ (ICT)', 'nameEn' => 'Information & Communication Technology (ICT)', 'name' => 'ព័ត៌មានវិទ្យា & វិទ្យាសាស្ត្រកុំព្យូទ័រ (ICT)'],
                ['id' => 2, 'code' => 'electricity', 'nameKm' => 'វិស្វកម្មអគ្គិសនី & ថាមពល', 'nameEn' => 'Electrical & Energy Engineering', 'name' => 'វិស្វកម្មអគ្គិសនី & ថាមពល'],
                ['id' => 3, 'code' => 'production', 'nameKm' => 'វិស្វកម្មមេកានិក & ផលិតកម្ម', 'nameEn' => 'Mechanical & Production Engineering', 'name' => 'វិស្វកម្មមេកានិក & ផលិតកម្ម'],
                ['id' => 4, 'code' => 'architecture', 'nameKm' => 'វិស្វកម្មសំណង់ស៊ីវិល & ស្ថាបត្យកម្ម', 'nameEn' => 'Civil Engineering & Architecture', 'name' => 'វិស្វកម្មសំណង់ស៊ីវិល & ស្ថាបត្យកម្ម'],
                ['id' => 5, 'code' => 'aircon', 'nameKm' => 'វិស្វកម្មបរិក្ខារត្រជាក់ & កម្តៅ (HVAC)', 'nameEn' => 'HVAC & Refrigeration Technology', 'name' => 'វិស្វកម្មបរិក្ខារត្រជាក់ & កម្តៅ (HVAC)'],
                ['id' => 6, 'code' => 'tourism', 'nameKm' => 'ទេសចរណ៍ & បដិសណ្ឋារកិច្ច', 'nameEn' => 'Tourism & Hospitality Management', 'name' => 'ទេសចរណ៍ & បដិសណ្ឋារកិច្ច'],
                ['id' => 7, 'code' => 'banking', 'nameKm' => 'គណនេយ្យ & ធនាគារ-ហិរញ្ញវត្ថុ', 'nameEn' => 'Accounting, Banking & Finance', 'name' => 'គណនេយ្យ & ធនាគារ-ហិរញ្ញវត្ថុ'],
            ];
        }

        $shifts = [
            [
                'id' => 'morning',
                'nameKm' => 'វេនព្រឹក (Morning: 08:00 AM - 11:30 AM)',
                'nameEn' => 'Morning Shift (08:00 AM - 11:30 AM)',
            ],
            [
                'id' => 'afternoon',
                'nameKm' => 'វេនរសៀល (Afternoon: 01:30 PM - 05:00 PM)',
                'nameEn' => 'Afternoon Shift (01:30 PM - 05:00 PM)',
            ],
            [
                'id' => 'evening',
                'nameKm' => 'វេនយប់ (Evening: 05:30 PM - 08:30 PM)',
                'nameEn' => 'Evening Shift (05:30 PM - 08:30 PM)',
            ],
            [
                'id' => 'weekend',
                'nameKm' => 'វេនចុងសប្តាហ៍ (Weekend: សៅរ៍ - អាទិត្យ)',
                'nameEn' => 'Weekend Shift (Saturday - Sunday)',
            ],
        ];

        return response()->json([
            'programTypes' => $programTypes,
            'degreeLevels' => $degreeLevels,
            'majors' => $majors,
            'shifts' => $shifts,
        ], 200);
    }
}
