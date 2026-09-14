import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageBanner } from '../components/common/PageBanner';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';

// Official Documents Database for RPITSSR Download Center
const OFFICIAL_DOCUMENTS = [
  // 1. ADMISSIONS & SCHOLARSHIPS
  {
    id: 'doc-tvet-1-5m',
    code: 'FORM-TVET-01',
    category: 'admissions',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    updatedAt: '2026-08-20',
    downloadsCount: 5240,
    isPopular: true,
    titleKm: 'ពាក្យសុំចុះឈ្មោះវគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ ១.៥ លាននាក់ (TVET 1.5M)',
    titleEn: 'TVET 1.5M Vocational Training Scholarship Application Form',
    descriptionKm: 'ទម្រង់ពាក្យសុំចុះឈ្មោះរៀនវគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈកម្រិត ១ (C1) ឥតគិតថ្លៃ ១០០% និងទទួលបានប្រាក់ឧបត្ថម្ភប្រចាំខែ ២៨០,០០០ រៀល សម្រាប់គ្រួសារក្រីក្រ និងងាយរងហានិភ័យ។',
    descriptionEn: 'Official application form for 100% tuition-free TVET Level 1 certificate programs with monthly 280,000 KHR stipend for eligible youth and vulnerable households.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    requiredDocsKm: [
      'រូបថត ៤x៦ ចំនួន ៣ សន្លឹក (ផ្ទៃខាងក្រោយពណ៌ស ឬខៀវ)',
      'ច្បាប់ចម្លងអត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ ឬសំបុត្រកំណើត (មានបញ្ជាក់)',
      'ច្បាប់ចម្លងប័ណ្ណសមធម៌ (ប័ណ្ណក្រីក្រ) ឬប័ណ្ណងាយរងហានិភ័យ (បើមាន)'
    ],
    requiredDocsEn: [
      '3 passport-size photos (4x6 cm, white or blue background)',
      'Certified copy of Cambodian National ID card or Birth Certificate',
      'Copy of IDPoor Card or Vulnerable Household Card (if applicable)'
    ]
  },
  {
    id: 'doc-higher-diploma',
    code: 'FORM-ADM-02',
    category: 'admissions',
    fileType: 'pdf',
    fileSize: '980 KB',
    updatedAt: '2026-08-10',
    downloadsCount: 3120,
    isPopular: true,
    titleKm: 'ពាក្យសុំចុះឈ្មោះកម្រិតសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (Higher Diploma / Associate Degree)',
    titleEn: 'Higher Diploma / Associate Degree Admission Application Form',
    descriptionKm: 'ទម្រង់ពាក្យសុំចូលរៀនកម្រិតសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង ២ ឆ្នាំ) លើមុខជំនាញព័ត៌មានវិទ្យា, អគ្គិសនី, មេកានិច, សំណង់ និងទេសចរណ៍។',
    descriptionEn: 'Standard admission application for 2-year Higher Technical Diploma programs across IT, Electrical, Automotive, Civil Engineering, and Hospitality.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    requiredDocsKm: [
      'សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប) ឬសញ្ញាបត្របច្ចេកទេសកម្រិត ៣ (C3)',
      'ព្រឹត្តិបត្រពិន្ទុប្រឡងបាក់ឌុប ឬវិញ្ញាបនបត្របណ្តោះអាសន្ន',
      'រូបថត ៤x៦ ចំនួន ៤ សន្លឹក និងសៀវភៅស្នាក់នៅ ឬសៀវភៅគ្រួសារ'
    ],
    requiredDocsEn: [
      'High School Diploma (BacII) certificate or TVET Level 3 (C3) Diploma',
      'National BacII Exam Grade Slip or Provisional Graduation Letter',
      '4 passport photos (4x6 cm) and copy of Family Book / Residency Book'
    ]
  },
  {
    id: 'doc-bachelor-tech',
    code: 'FORM-ADM-03',
    category: 'admissions',
    fileType: 'pdf',
    fileSize: '1.1 MB',
    updatedAt: '2026-08-05',
    downloadsCount: 2450,
    isPopular: false,
    titleKm: 'ពាក្យសុំចុះឈ្មោះកម្រិតបរិញ្ញាបត្របច្ចេកវិទ្យា (Bachelor of Technology - B.Tech)',
    titleEn: 'Bachelor of Technology (B.Tech 4-Year) Admission Application',
    descriptionKm: 'ទម្រង់ពាក្យសុំចុះឈ្មោះចូលរៀនថ្នាក់បរិញ្ញាបត្របច្ចេកវិទ្យា ៤ ឆ្នាំ និងថ្នាក់បន្តវេនពីសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (Bridging Course)។',
    descriptionEn: 'Application form for 4-year Bachelor of Technology degree and technical university bridging transfer programs.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    requiredDocsKm: [
      'សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ ឬសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (សម្រាប់ថ្នាក់បន្ត)',
      'ព្រឹត្តិបត្រពិន្ទុសិក្សា និងលិខិតបញ្ជាក់ការសិក្សាពីគ្រឹះស្ថានដើម',
      'រូបថត ៤x៦ ចំនួន ៤ សន្លឹក'
    ],
    requiredDocsEn: [
      'High School Diploma (BacII) or Higher Diploma (for transfer entrants)',
      'Official academic transcripts and letter of completion from previous institution',
      '4 passport photos (4x6 cm)'
    ]
  },
  {
    id: 'doc-dorm-apply',
    code: 'FORM-DORM-01',
    category: 'admissions',
    fileType: 'docx',
    fileSize: '650 KB',
    updatedAt: '2026-08-15',
    downloadsCount: 1890,
    isPopular: false,
    titleKm: 'ពាក្យស្នើសុំស្នាក់នៅអន្តេវាសិកដ្ឋាននិស្សិត RPITSSR (Campus Dormitory Request)',
    titleEn: 'Campus Dormitory Accommodation Application Form',
    descriptionKm: 'ទម្រង់ស្នើសុំកន្លែងស្នាក់នៅអន្តេវាសិកដ្ឋានក្នុងបរិវេណវិទ្យាស្ថាន សម្រាប់សិស្ស-និស្សិតមកពីខេត្ត ឬស្រុកឆ្ងាយៗ និងសិស្សអាហារូបករណ៍ក្រីក្រ។',
    descriptionEn: 'Application for subsidized on-campus dormitory accommodation for students from distant provinces and scholarship recipients.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    requiredDocsKm: [
      'ពាក្យស្នើសុំស្នាក់នៅដែលមានហត្ថលេខាអាណាព្យាបាល',
      'លិខិតបញ្ជាក់ទីលំនៅពីអាជ្ញាធរឃុំ/សង្កាត់',
      'កិច្ចសន្យាគោរពបទបញ្ជាផ្ទៃក្នុងអន្តេវាសិកដ្ឋាន'
    ],
    requiredDocsEn: [
      'Dormitory request form endorsed by parent or legal guardian',
      'Commune residency verification certificate',
      'Signed agreement adhering to campus dormitory code of conduct'
    ]
  },

  // 2. ACADEMIC CALENDARS & SCHEDULES
  {
    id: 'doc-cal-2026-2027',
    code: 'CAL-ACAD-26',
    category: 'calendars',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    updatedAt: '2026-09-01',
    downloadsCount: 4890,
    isPopular: true,
    titleKm: 'ប្រតិទិនសិក្សា និងថ្ងៃឈប់សម្រាកផ្លូវការប្រចាំឆ្នាំ ២០២៦-២០២៧',
    titleEn: 'Official Academic Calendar & Holiday Schedule 2026-2027',
    descriptionKm: 'ប្រតិទិនលម្អិតអំពីកាលបរិច្ឆេទបើកបវេសនកាល ការចុះឈ្មោះមុខវិជ្ជា ការប្រឡងពាក់កណ្តាលឆមាស ការប្រឡងបញ្ចប់ឆមាស និងថ្ងៃឈប់សម្រាកបុណ្យជាតិ។',
    descriptionEn: 'Comprehensive schedule of semester terms, course add/drop deadlines, midterm & final exam periods, and official public holidays.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A)',
    requiredDocsKm: ['ឯកសារយោង និងព័ត៌មានទូទៅសម្រាប់និស្សិតគ្រប់ដេប៉ាតឺម៉ង់'],
    requiredDocsEn: ['Official reference schedule for all registered students and faculty']
  },
  {
    id: 'doc-exam-schedule-s1',
    code: 'SCHED-EXAM-S1',
    category: 'calendars',
    fileType: 'pdf',
    fileSize: '820 KB',
    updatedAt: '2026-08-28',
    downloadsCount: 3670,
    isPopular: true,
    titleKm: 'តារាងកាលវិភាគប្រឡងឆមាសទី ១ ឆ្នាំសិក្សា ២០២៦-២០២៧ (Semester 1 Exam Schedule)',
    titleEn: 'Semester 1 Examination Timetable & Room Allocations 2026-2027',
    descriptionKm: 'តារាងកាលបរិច្ឆេទ ម៉ោងប្រឡង បន្ទប់ប្រឡង និងសមាសភាពអនុរក្ស សម្រាប់និស្សិតគ្រប់កម្រិត (TVET C1-C3, សញ្ញាបត្រជាន់ខ្ពស់ និងបរិញ្ញាបត្រ)។',
    descriptionEn: 'Exam dates, session times, room allocations, and exam invigilator assignments for all degree and vocational cohorts.',
    submissionOffice: 'គណៈកម្មការរៀបចំការប្រឡងវិទ្យាស្ថាន',
    requiredDocsKm: ['និស្សិតត្រូវកាន់កាតសិស្ស (Student ID Card) ចូលបន្ទប់ប្រឡងជាចាំបាច់'],
    requiredDocsEn: ['Mandatory presentation of valid Student ID Card upon entering exam hall']
  },
  {
    id: 'doc-internship-schedule',
    code: 'SCHED-INTERN-26',
    category: 'calendars',
    fileType: 'xlsx',
    fileSize: '450 KB',
    updatedAt: '2026-08-18',
    downloadsCount: 1640,
    isPopular: false,
    titleKm: 'កាលវិភាគ និងបញ្ជីសហគ្រាសទទួលសិស្សចុះកម្មសិក្សាការងារ (Internship Placement List)',
    titleEn: 'Enterprise Internship Timeline & Partner Placement Directory',
    descriptionKm: 'កាលវិភាគលម្អិតនៃការចុះហាត់ការនៅសហគ្រាសដៃគូ សណ្ឋាគារ រោងចក្រ និងក្រុមហ៊ុនបច្ចេកវិទ្យាក្នុងខេត្តសៀមរាប និងរាជធានីភ្នំពេញ។',
    descriptionEn: 'Industry practicum timeline and directory of enterprise partners offering student placements across hospitality, auto, and IT.',
    submissionOffice: 'ការិយាល័យទំនាក់ទំនងសហគ្រាស និងការងារ (អគារ B, បន្ទប់ ១០១)',
    requiredDocsKm: ['ទម្រង់វាយតម្លៃការងារ និងសៀវភៅតាមដានកម្មសិក្សា'],
    requiredDocsEn: ['Supervisor performance assessment form and weekly logbook']
  },

  // 3. STUDENT HANDBOOKS & REGULATIONS
  {
    id: 'doc-handbook-student',
    code: 'HB-STU-2026',
    category: 'handbooks',
    fileType: 'pdf',
    fileSize: '3.8 MB',
    updatedAt: '2026-07-25',
    downloadsCount: 2980,
    isPopular: true,
    titleKm: 'សៀវភៅណែនាំនិស្សិត និងបទបញ្ជាផ្ទៃក្នុងវិទ្យាស្ថាន RPITSSR (Student Handbook)',
    titleEn: 'Student Handbook & Institutional Code of Conduct',
    descriptionKm: 'សៀវភៅណែនាំពេញលេញស្តីពីបទបញ្ជាផ្ទៃក្នុង ការស្លៀកពាក់ វិន័យ សិទ្ធិ និងកាតព្វកិច្ចរបស់និស្សិត ព្រមទាំងប្រព័ន្ធពិន្ទុ និងការផ្តល់រង្វាន់លើកទឹកចិត្ត។',
    descriptionEn: 'Comprehensive guide detailing campus regulations, uniform policy, code of student discipline, academic integrity, and graduation criteria.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A)',
    requiredDocsKm: ['និស្សិតគ្រប់រូបត្រូវអាន និងយល់ដឹងឱ្យបានច្បាស់លាស់ពីបទបញ្ជាផ្ទៃក្នុង'],
    requiredDocsEn: ['All enrolled students are required to read and comply with the student handbook']
  },
  {
    id: 'doc-safety-manual',
    code: 'HB-SAFE-01',
    category: 'handbooks',
    fileType: 'pdf',
    fileSize: '2.1 MB',
    updatedAt: '2026-08-02',
    downloadsCount: 2150,
    isPopular: false,
    titleKm: 'ស្តង់ដារសុវត្ថិភាព និងការប្រើប្រាស់រោងជាងបច្ចេកទេស (Workshop Safety Manual - OSH)',
    titleEn: 'Occupational Safety and Health (OSH) Workshop Safety Manual',
    descriptionKm: 'សៀវភៅណែនាំស្តង់ដារសុវត្ថិភាពការងារក្នុងរោងជាងយានយន្ត អគ្គិសនី មេកានិច និងការដ្ឋានសំណង់ ស្របតាមបទដ្ឋានសុវត្ថិភាពការងារជាតិ។',
    descriptionEn: 'Workshop safety rules, personal protective equipment (PPE) compliance, and emergency protocols for engineering laboratories.',
    submissionOffice: 'ដេប៉ាតឺម៉ង់បច្ចេកទេស និងការិយាល័យរដ្ឋបាល',
    requiredDocsKm: ['តម្រូវឱ្យពាក់ឧបករណ៍ការពារខ្លួន (PPE) គ្រប់ពេលអនុវត្តការងារ'],
    requiredDocsEn: ['Mandatory PPE wear during all workshop practical sessions']
  },
  {
    id: 'doc-internship-guide',
    code: 'HB-INTERN-01',
    category: 'handbooks',
    fileType: 'pdf',
    fileSize: '1.6 MB',
    updatedAt: '2026-07-30',
    downloadsCount: 1720,
    isPopular: false,
    titleKm: 'សៀវភៅណែនាំការចុះកម្មសិក្សា និងការសរសេររបាយការណ៍បញ្ចប់ការសិក្សា (Internship Guide)',
    titleEn: 'Internship Practicum & Capstone Project Report Writing Guidelines',
    descriptionKm: 'ការណែនាំអំពីរបៀបរៀបចំខ្លួនចុះហាត់ការនៅក្រុមហ៊ុន និងទម្រង់ស្តង់ដារនៃការសរសេររបាយការណ៍គម្រោងបញ្ចប់ការសិក្សា (Project Report)។',
    descriptionEn: 'Standard guidelines on internship conduct, company evaluation criteria, and capstone technical project report formatting.',
    submissionOffice: 'ការិយាល័យទំនាក់ទំនងសហគ្រាស និងការងារ',
    requiredDocsKm: ['លិខិតឧទ្ទេសនាមពីវិទ្យាស្ថាន និងកិច្ចសន្យាហាត់ការ'],
    requiredDocsEn: ['Institutional introduction letter and tripartite internship agreement']
  },

  // 4. ADMINISTRATIVE & STUDENT SERVICE FORMS
  {
    id: 'doc-transcript-req',
    code: 'FORM-ADM-CERT',
    category: 'adminForms',
    fileType: 'docx',
    fileSize: '480 KB',
    updatedAt: '2026-08-25',
    downloadsCount: 3890,
    isPopular: true,
    titleKm: 'ពាក្យស្នើសុំលិខិតបញ្ជាក់ការសិក្សា ឬព្រឹត្តិបត្រពិន្ទុផ្លូវការ (Transcript Request Form)',
    titleEn: 'Official Academic Transcript & Student Status Request Form',
    descriptionKm: 'ទម្រង់បែបបទស្នើសុំព្រឹត្តិបត្រពិន្ទុជាភាសាខ្មែរ/អង់គ្លេស ឬលិខិតបញ្ជាក់កំពុងសិក្សា សម្រាប់យកទៅប្រើប្រាស់ដាក់ពាក្យការងារ ឬសុំអាហារូបករណ៍។',
    descriptionEn: 'Official request form for bilingual academic transcripts or proof-of-enrollment certificates for employment or scholarship applications.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    requiredDocsKm: [
      'ច្បាប់ចម្លងកាតសិស្ស ឬបង្កាន់ដៃបង់ថ្លៃសិក្សា (បើមាន)',
      'រយៈពេលរង់ចាំដំណើរការឯកសារ៖ ៣ ទៅ ៥ ថ្ងៃនៃថ្ងៃធ្វើការ'
    ],
    requiredDocsEn: [
      'Copy of Student ID card or registration receipt',
      'Standard processing turnaround time: 3-5 working days'
    ]
  },
  {
    id: 'doc-leave-request',
    code: 'FORM-STU-LEAVE',
    category: 'adminForms',
    fileType: 'docx',
    fileSize: '420 KB',
    updatedAt: '2026-08-12',
    downloadsCount: 2210,
    isPopular: false,
    titleKm: 'ពាក្យសុំច្បាប់ឈប់សម្រាកបណ្តោះអាសន្ន ឬផ្អាកការសិក្សា (Leave of Absence Form)',
    titleEn: 'Temporary Leave of Absence & Study Deferral Request Form',
    descriptionKm: 'ទម្រង់សុំច្បាប់សម្រាកព្យាបាលជំងឺ ឬផ្អាកការសិក្សាមួយឆមាសដោយមានហេតុផលចាំបាច់ ដោយរក្សាទុកកំណត់ត្រាសិក្សា។',
    descriptionEn: 'Form for medical leave of absence or temporary semester deferral with academic standing preservation.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    requiredDocsKm: [
      'វេជ្ជបញ្ជា ឬលិខិតបញ្ជាក់ពីមន្ទីរពេទ្យ (ករណីឈឺ)',
      'ហត្ថលេខាឯកភាពពីប្រធានដេប៉ាតឺម៉ង់ និងអាណាព្យាបាល'
    ],
    requiredDocsEn: [
      'Medical certificate or hospital letter (for health leaves)',
      'Department head endorsement and parental consent'
    ]
  },
  {
    id: 'doc-transfer-major',
    code: 'FORM-STU-TRANS',
    category: 'adminForms',
    fileType: 'docx',
    fileSize: '460 KB',
    updatedAt: '2026-08-08',
    downloadsCount: 1430,
    isPopular: false,
    titleKm: 'ពាក្យស្នើសុំប្តូរវេនសិក្សា ឬប្តូរជំនាញ (Major / Shift Change Request Form)',
    titleEn: 'Course Major / Study Shift Transfer Application Form',
    descriptionKm: 'ទម្រង់ស្នើសុំប្តូរវេនសិក្សា (វេនព្រឹក វេនរសៀល ឬវេនយប់/ចុងសប្តាហ៍) ឬប្តូរជំនាញក្នុងអំឡុងពេល ២ សប្តាហ៍ដំបូងនៃដើមឆមាស។',
    descriptionEn: 'Application form to switch study shifts (Morning, Afternoon, Weekend) or transfer technical majors during the first 2 weeks of the semester.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    requiredDocsKm: [
      'លិខិតបញ្ជាក់ការងារ (ករណីសុំប្តូរវេនយប់/ចុងសប្តាហ៍)',
      'ការយល់ព្រមពីប្រធានដេប៉ាតឺម៉ង់ទាំងសងខាង'
    ],
    requiredDocsEn: [
      'Employer work letter (if requesting transfer to weekend/evening shift)',
      'Mutual approval from both releasing and receiving department heads'
    ]
  }
];

export const DownloadPage = () => {
  const { t, language } = useLanguage();
  const isKhmer = language === 'km';

  const [documents, setDocuments] = useState(OFFICIAL_DOCUMENTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(null);

  // Fetch dynamic documents from Laravel backend API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get('/documents');
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const mapped = res.data.data.map((d) => ({
            id: d.id,
            code: d.code || 'FORM-DOC',
            category: d.category || 'admissions',
            fileType: (d.file_type || 'pdf').toLowerCase(),
            fileSize: d.file_size || '1.0 MB',
            filePath: d.file_path || '',
            updatedAt: d.updated_at ? d.updated_at.split('T')[0] : '2026-08-20',
            downloadsCount: Number(d.downloads_count) || 0,
            isPopular: !!d.is_popular,
            titleKm: d.title_km,
            titleEn: d.title_en || d.title_km,
            descriptionKm: d.description_km || '',
            descriptionEn: d.description_en || '',
            submissionOffice: d.submission_office || 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
            requiredDocsKm: Array.isArray(d.required_docs_km) ? d.required_docs_km : [],
            requiredDocsEn: Array.isArray(d.required_docs_en) ? d.required_docs_en : [],
          }));
          setDocuments(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch documents from API, using fallback:', err);
      }
    };
    fetchDocuments();
  }, []);

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedDoc(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedDoc]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchCat = activeCategory === 'all' || doc.category === activeCategory;
      const matchFormat = selectedFormat === 'all' || doc.fileType === selectedFormat;
      if (!matchCat || !matchFormat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = `${doc.titleKm} ${doc.titleEn} ${doc.code}`.toLowerCase();
      const desc = `${doc.descriptionKm} ${doc.descriptionEn}`.toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [documents, activeCategory, selectedFormat, searchQuery]);

  // Dynamic total downloads count
  const totalDownloadsText = useMemo(() => {
    const total = documents.reduce((sum, d) => sum + (d.downloadsCount || 0), 0);
    if (total >= 1000) {
      return `${(total / 1000).toFixed(1)}K+`;
    }
    return `${total}+`;
  }, [documents]);

  // Trigger actual file download simulation (generates downloadable file blob with real institutional header)
  const handleDownload = (doc) => {
    const fileExtension = doc.fileType;
    const fileName = `${doc.code}_${doc.titleEn.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
    
    // Create text representation of official document
    const fileContent = `================================================================================
ព្រះរាជាណាចក្រកម្ពុជា
ជាតិ សាសនា ព្រះមហាក្សត្រ
ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ (MLVT)
វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)
================================================================================
ឯកសារផ្លូវការ៖ ${doc.titleKm}
Official Document: ${doc.titleEn}
លេខកូដសម្គាល់ (Document Code): ${doc.code}
កាលបរិច្ឆេទធ្វើបច្ចុប្បន្នភាព (Updated Date): ${doc.updatedAt}
ទំហំឯកសារ (Size): ${doc.fileSize}
ការិយាល័យទទួលឯកសារ (Submission Office): ${doc.submissionOffice}

សេចក្តីពិពណ៌នា / DESCRIPTION:
${doc.descriptionKm}
${doc.descriptionEn}

ឯកសារភ្ជាប់ចាំបាច់ / REQUIRED ATTACHMENTS:
${(doc.requiredDocsKm || []).map((d, i) => `[${i + 1}] ${d}`).join('\n')}

================================================================================
ទំនាក់ទំនងការិយាល័យសិក្សា និងកិច្ចការនិស្សិត RPITSSR:
អ៊ីមែល៖ info@rpitssr.edu.kh | student.affairs@rpitssr.edu.kh
ទូរស័ព្ទ៖ (+855) 63 963 888 | (+855) 63 963 801
អាសយដ្ឋាន៖ ភូមិបន្ទាយចាស់ សង្កាត់ស្លក្រាម ក្រុងសៀមរាប ខេត្តសៀមរាប
គេហទំព័រផ្លូវការ៖ https://rpitssr.edu.kh
================================================================================`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Increment download count in backend and locally
    if (doc.id && typeof doc.id === 'number') {
      api.post(`/documents/${doc.id}/download`).catch(() => {});
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, downloadsCount: (d.downloadsCount || 0) + 1 } : d));
    }

    // Show toast feedback
    setDownloadSuccessToast(isKhmer ? `បានទាញយកឯកសារ ${doc.code} ដោយជោគជ័យ!` : `Downloaded ${doc.code} successfully!`);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 4000);
  };

  // Helper for file type styles
  const getFileTypeBadge = (type) => {
    switch (type) {
      case 'pdf':
        return { bg: '#fee2e2', color: '#dc2626', icon: 'fa-file-pdf', label: 'PDF' };
      case 'docx':
        return { bg: '#dbeafe', color: '#1d4ed8', icon: 'fa-file-word', label: 'WORD' };
      case 'xlsx':
        return { bg: '#dcfce7', color: '#15803d', icon: 'fa-file-excel', label: 'EXCEL' };
      default:
        return { bg: '#f1f5f9', color: '#475569', icon: 'fa-file-alt', label: 'FILE' };
    }
  };

  return (
    <div className="download-page-wrapper">
      {/* 1. Official Page Banner */}
      <PageBanner
        title={t('downloads.pageTitle') || 'មជ្ឈមណ្ឌលទាញយកឯកសារផ្លូវការ'}
        image="/images/notice.webp"
      />

      <div className="download-main-section" style={{ backgroundColor: '#f8fafc', paddingTop: '60px', paddingBottom: '100px', paddingLeft: '16px', paddingRight: '16px' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>

          {/* Institutional Introduction & Search Hero Card */}
          <div className="download-hero-card mb-4 text-center">
            <div className="download-forms-badge">
              <i className="fas fa-file-download text-success"></i>
              <span>{isKhmer ? 'បណ្ណាល័យឯកសារសាធារណៈ ២៤/៧ (Official Forms Hub)' : 'Public Self-Service Forms Hub 24/7'}</span>
            </div>

            <h2 className="fw-bold mb-3" style={{ color: '#07294D', fontSize: '2.1rem', letterSpacing: '-0.3px', lineHeight: 1.4 }}>
              {t('downloads.pageTitle')}
            </h2>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '820px', fontSize: '1.05rem', lineHeight: '1.85' }}>
              {t('downloads.subtitle')}
            </p>

            {/* Quick Metrics Strip - 4 Interactive Institutional Cards */}
            <div className="row g-3 justify-content-center mb-4 pt-4 border-top">
              <div className="col-6 col-md-3">
                <div className="download-stat-card">
                  <div
                    className="download-stat-icon-wrap"
                    style={{ backgroundColor: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}
                  >
                    <i className="fas fa-file-contract"></i>
                  </div>
                  <div className="fw-bold" style={{ fontSize: '2rem', color: '#07294D', lineHeight: 1.1 }}>{documents.length}+</div>
                  <div className="fw-semibold text-dark small mt-1">{isKhmer ? 'ឯកសារផ្លូវការ' : 'Official Forms'}</div>
                  <span
                    className="badge rounded-pill mt-2 px-2.5 py-1"
                    style={{ backgroundColor: '#eff6ff', color: '#1e73be', fontSize: '0.72rem', fontWeight: '600', border: '1px solid #dbeafe' }}
                  >
                    {isKhmer ? 'ទម្រង់ស្តង់ដារ' : 'Standard Forms'}
                  </span>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="download-stat-card">
                  <div
                    className="download-stat-icon-wrap"
                    style={{ backgroundColor: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}
                  >
                    <i className="fas fa-check-double"></i>
                  </div>
                  <div className="fw-bold" style={{ fontSize: '2rem', color: '#07294D', lineHeight: 1.1 }}>100%</div>
                  <div className="fw-semibold text-dark small mt-1">{isKhmer ? 'ទាញយកឥតគិតថ្លៃ' : 'Free Download'}</div>
                  <span
                    className="badge rounded-pill mt-2 px-2.5 py-1"
                    style={{ backgroundColor: '#f0fdf4', color: '#059669', fontSize: '0.72rem', fontWeight: '600', border: '1px solid #bbf7d0' }}
                  >
                    {isKhmer ? 'សេវាឥតគិតថ្លៃ' : '100% Free'}
                  </span>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="download-stat-card">
                  <div
                    className="download-stat-icon-wrap"
                    style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}
                  >
                    <i className="fas fa-cloud-download-alt"></i>
                  </div>
                  <div className="fw-bold" style={{ fontSize: '2rem', color: '#07294D', lineHeight: 1.1 }}>{totalDownloadsText}</div>
                  <div className="fw-semibold text-dark small mt-1">{isKhmer ? 'ចំនួនទាញយកសរុប' : 'Total Downloads'}</div>
                  <span
                    className="badge rounded-pill mt-2 px-2.5 py-1"
                    style={{ backgroundColor: '#fffbeb', color: '#d97706', fontSize: '0.72rem', fontWeight: '600', border: '1px solid #fde68a' }}
                  >
                    {isKhmer ? 'ការទាញយក' : 'Downloads'}
                  </span>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="download-stat-card">
                  <div
                    className="download-stat-icon-wrap"
                    style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}
                  >
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <div className="fw-bold" style={{ fontSize: '1.75rem', color: '#07294D', lineHeight: 1.1 }}>TVET 1.5M</div>
                  <div className="fw-semibold text-dark small mt-1">{isKhmer ? 'អាហារូបករណ៍រដ្ឋ' : 'National Scholarship'}</div>
                  <span
                    className="badge rounded-pill mt-2 px-2.5 py-1"
                    style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: '600', border: '1px solid #ddd6fe' }}
                  >
                    {isKhmer ? 'កម្មវិធីរដ្ឋាភិបាល' : 'National TVET'}
                  </span>
                </div>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="download-search-wrapper mx-auto position-relative">
              <i className="fas fa-search position-absolute" style={{ left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}></i>
              <input
                type="text"
                className="form-control download-search-input"
                placeholder={t('downloads.searchPlaceholder') || 'ស្វែងរកឈ្មោះឯកសារ ពាក្យគន្លឹះ ឬលេខកូដ...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-link position-absolute p-0"
                  style={{ right: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', textDecoration: 'none' }}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <i className="fas fa-times-circle fs-5"></i>
                </button>
              )}
            </div>
          </div>

          {/* Filter Toolbar: Categories & Formats */}
          <div className="download-toolbar d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            {/* Category Pills with explicit gaps */}
            <div className="download-filter-group">
              <button
                type="button"
                className={`download-filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                <span>{t('downloads.all')} ({documents.length})</span>
              </button>
              <button
                type="button"
                className={`download-filter-chip ${activeCategory === 'admissions' ? 'active' : ''}`}
                onClick={() => setActiveCategory('admissions')}
              >
                <i className="fas fa-user-plus"></i>
                <span>{t('downloads.admissions')}</span>
              </button>
              <button
                type="button"
                className={`download-filter-chip ${activeCategory === 'calendars' ? 'active' : ''}`}
                onClick={() => setActiveCategory('calendars')}
              >
                <i className="fas fa-calendar-alt"></i>
                <span>{t('downloads.calendars')}</span>
              </button>
              <button
                type="button"
                className={`download-filter-chip ${activeCategory === 'handbooks' ? 'active' : ''}`}
                onClick={() => setActiveCategory('handbooks')}
              >
                <i className="fas fa-book-reader"></i>
                <span>{t('downloads.handbooks')}</span>
              </button>
              <button
                type="button"
                className={`download-filter-chip ${activeCategory === 'adminForms' ? 'active' : ''}`}
                onClick={() => setActiveCategory('adminForms')}
              >
                <i className="fas fa-file-signature"></i>
                <span>{t('downloads.adminForms')}</span>
              </button>
            </div>

            {/* File Format Filter - Unified Horizontal Pill */}
            <div className="download-format-pill-wrap">
              <span className="download-format-label">
                <i className="fas fa-filter text-primary"></i>
                <span>{isKhmer ? 'ទម្រង់' : 'Format'}:</span>
              </span>
              <select
                className="form-select download-format-select"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                aria-label={isKhmer ? 'ជ្រើសរើសទម្រង់ឯកសារ' : 'Select document format'}
              >
                <option value="all">{isKhmer ? 'គ្រប់ Format' : 'All Formats'}</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="docx">Word (.docx)</option>
                <option value="xlsx">Excel (.xlsx)</option>
              </select>
            </div>
          </div>

          {/* Documents Grid */}
          {filteredDocs.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
              <i className="fas fa-file-search fs-1 text-muted mb-3"></i>
              <h5>{isKhmer ? 'រកមិនឃើញឯកសារដែលត្រូវគ្នានឹងការស្វែងរកទេ' : 'No documents match your search criteria'}</h5>
              <p className="text-muted small mb-3">{isKhmer ? 'សូមសាកល្បងពាក្យគន្លឹះថ្មី ឬកំណត់ការច្រោះឡើងវិញ' : 'Try different keywords or clear current filters'}</p>
              <button
                className="btn btn-primary btn-sm rounded-pill px-4"
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); setSelectedFormat('all'); }}
              >
                {isKhmer ? 'កំណត់ឡើងវិញ' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filteredDocs.map((doc) => {
                const badge = getFileTypeBadge(doc.fileType);
                return (
                  <div className="col-12 col-md-6 col-lg-4" key={doc.id}>
                    <div
                      className="download-doc-card bg-white p-4 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between position-relative"
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span
                            className="badge d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill"
                            style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: '700', fontSize: '0.78rem' }}
                          >
                            <i className={`fas ${badge.icon}`}></i>
                            <span>{badge.label}</span>
                          </span>

                          <div className="d-flex align-items-center gap-1">
                            {doc.isPopular && (
                              <span className="badge bg-warning text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.72rem', fontWeight: '700' }}>
                                🔥 {isKhmer ? 'ពេញនិយម' : 'POPULAR'}
                              </span>
                            )}
                            <span className="badge bg-light text-secondary rounded-pill" style={{ fontSize: '0.72rem' }}>
                              {doc.code}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h5 className="fw-bold mb-2 doc-title-text" style={{ color: '#07294D', fontSize: '1.08rem', lineHeight: '1.6' }}>
                          {isKhmer ? doc.titleKm : doc.titleEn}
                        </h5>

                        {/* Description */}
                        <p className="text-muted small mb-3" style={{ lineHeight: '1.7', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {isKhmer ? doc.descriptionKm : doc.descriptionEn}
                        </p>
                      </div>

                      {/* Card Bottom Meta & Actions */}
                      <div>
                        {/* Meta info row */}
                        <div className="d-flex align-items-center justify-content-between text-muted small py-2 mb-3 border-top border-bottom" style={{ fontSize: '0.8rem' }}>
                          <div>
                            <i className="fas fa-hdd me-1 text-secondary"></i>
                            <span>{doc.fileSize}</span>
                          </div>
                          <div>
                            <i className="fas fa-cloud-download-alt me-1 text-primary"></i>
                            <span>{doc.downloadsCount.toLocaleString()} {t('downloads.downloadsCount')}</span>
                          </div>
                          <div>
                            <i className="far fa-calendar-alt me-1 text-secondary"></i>
                            <span>{doc.updatedAt}</span>
                          </div>
                        </div>

                        {/* Action Buttons: Preview & Download */}
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn download-btn-outline flex-grow-1"
                            onClick={() => setSelectedDoc(doc)}
                          >
                            <i className="fas fa-eye text-primary"></i>
                            <span>{t('downloads.previewBtn')}</span>
                          </button>
                          <button
                            type="button"
                            className="btn download-btn-primary flex-grow-1"
                            onClick={() => handleDownload(doc)}
                          >
                            <i className="fas fa-download"></i>
                            <span>{t('downloads.downloadBtn')}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3-Step Submission Instructions Banner */}
          <div className="download-steps-card">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill" style={{ backgroundColor: '#eff6ff', color: '#1e73be', fontSize: '0.84rem', fontWeight: '700' }}>
                <i className="fas fa-stream text-primary"></i>
                <span>{isKhmer ? 'ដំណើរការស្នើសុំ ៣ ជំហានងាយៗ' : 'Simple 3-Step Process'}</span>
              </div>
              <h3 className="fw-bold mb-2" style={{ color: '#07294D', fontSize: '1.65rem' }}>
                {isKhmer ? 'របៀបស្នើសុំ និងបំពេញបែបបទឯកសារ' : 'How to Fill Out & Submit Official Forms'}
              </h3>
              <p className="text-muted small mx-auto mb-0" style={{ maxWidth: '640px' }}>
                {isKhmer ? 'សូមអនុវត្តតាមដំណាក់កាលងាយៗខាងក្រោម ដើម្បីទទួលបានឯកសារ និងដាក់ពាក្យបានត្រឹមត្រូវទាន់ពេលវេលា' : 'Follow these straightforward steps to prepare and lodge your institutional applications on time.'}
              </p>
            </div>

            <div className="row g-4">
              {/* Step 1 */}
              <div className="col-12 col-md-4">
                <div className="download-step-box">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '56px', height: '56px', fontSize: '20px', fontWeight: '700' }}>
                    1
                  </div>
                  <h6 className="fw-bold mb-2" style={{ color: '#07294D' }}>
                    {isKhmer ? 'ទាញយកទម្រង់ឯកសារ' : 'Download Document'}
                  </h6>
                  <p className="text-muted small mb-0" style={{ lineHeight: '1.7' }}>
                    {isKhmer
                      ? 'ជ្រើសរើសឯកសារដែលត្រូវនឹងតម្រូវការ ហើយចុចប៊ូតុង «ទាញយក» ដើម្បីរក្សាទុកក្នុងកុំព្យូទ័រ ឬទូរស័ព្ទ។'
                      : 'Select your needed application and click Download to save the official template directly to your device.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="col-12 col-md-4">
                <div className="download-step-box">
                  <div className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '56px', height: '56px', fontSize: '20px', fontWeight: '700' }}>
                    2
                  </div>
                  <h6 className="fw-bold mb-2" style={{ color: '#07294D' }}>
                    {isKhmer ? 'បំពេញព័ត៌មាន & ភ្ជាប់ឯកសារ' : 'Fill In & Attach Documents'}
                  </h6>
                  <p className="text-muted small mb-0" style={{ lineHeight: '1.7' }}>
                    {isKhmer
                      ? 'បំពេញព័ត៌មានផ្ទាល់ខ្លួនឱ្យបានច្បាស់លាស់ ភ្ជាប់រូបថត ៤x៦ និងច្បាប់ចម្លងឯកសារបញ្ជាក់ដែលតម្រូវ។'
                      : 'Complete required fields, attach passport photos, and include certified copies of ID or prior diplomas.'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="col-12 col-md-4">
                <div className="download-step-box">
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '56px', height: '56px', fontSize: '20px', fontWeight: '700' }}>
                    3
                  </div>
                  <h6 className="fw-bold mb-2" style={{ color: '#07294D' }}>
                    {isKhmer ? 'ដាក់ពាក្យនៅការិយាល័យ' : 'Submit to Campus Office'}
                  </h6>
                  <p className="text-muted small mb-0" style={{ lineHeight: '1.7' }}>
                    {isKhmer
                      ? 'យកពាក្យដែលបានបំពេញរួចរាល់ មកដាក់ផ្ទាល់នៅការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)។'
                      : 'Hand in completed forms directly to the Academic & Student Affairs Office (Building A, Room 104).'}
                  </p>
                </div>
              </div>
            </div>

            {/* Need Help Box */}
            <div className="download-help-banner">
              <div className="d-flex align-items-center gap-3">
                <div className="download-help-icon-wrap">
                  <i className="fas fa-question"></i>
                </div>
                <div>
                  <div className="download-help-title">{t('downloads.needHelp')}</div>
                  <div className="download-help-desc">{t('downloads.helpDesc')}</div>
                </div>
              </div>
              <div className="download-help-btn-group">
                <a href="tel:+85563963888" className="download-help-phone-btn">
                  <i className="fas fa-phone"></i>
                  <span>(+855) 63 963 888</span>
                </a>
                <Link to="/contact" className="download-help-contact-btn">
                  <i className="fas fa-envelope"></i>
                  <span>{isKhmer ? 'ទាក់ទងមកយើង' : 'Contact Us'}</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDoc && (
        <div
          className="download-modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(7, 41, 77, 0.65)', backdropFilter: 'blur(6px)', zIndex: 9999 }}
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="download-preview-modal bg-white rounded-4 shadow-lg overflow-hidden"
            style={{ maxWidth: '720px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', animation: 'fadeInUp 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 text-white d-flex justify-content-between align-items-start" style={{ background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 bg-white d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <i className={`fas ${getFileTypeBadge(selectedDoc.fileType).icon} fs-4`} style={{ color: getFileTypeBadge(selectedDoc.fileType).color }}></i>
                </div>
                <div>
                  <span className="badge bg-warning text-dark rounded-pill px-2 py-1 mb-1" style={{ fontSize: '0.72rem', fontWeight: '700' }}>
                    {selectedDoc.code}
                  </span>
                  <h5 className="fw-bold mb-0 text-white" style={{ fontSize: '1.15rem' }}>
                    {t('downloads.previewTitle')}
                  </h5>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-white p-0"
                onClick={() => setSelectedDoc(null)}
                style={{ fontSize: '1.4rem', opacity: 0.85 }}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body: Document Preview Sheet */}
            <div className="p-4 overflow-auto" style={{ flex: 1 }}>
              <div className="p-4 rounded-3 border bg-light position-relative overflow-hidden mb-4" style={{ borderStyle: 'dashed' }}>
                {/* Simulated Watermark */}
                <div
                  className="position-absolute top-50 start-50 translate-middle text-uppercase fw-bold text-center"
                  style={{ color: 'rgba(7, 41, 77, 0.04)', fontSize: '5rem', pointerEvents: 'none', transform: 'translate(-50%, -50%) rotate(-25deg)', whiteSpace: 'nowrap' }}
                >
                  RPITSSR
                </div>

                {/* Institutional Header */}
                <div className="text-center mb-3 pb-3 border-bottom">
                  <div className="small fw-bold text-muted text-uppercase mb-1">ព្រះរាជាណាចក្រកម្ពុជា | ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                  <div className="text-primary fw-bold small">ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ</div>
                  <h6 className="fw-bold mt-2" style={{ color: '#07294D' }}>
                    វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
                  </h6>
                  <div className="badge bg-secondary text-white rounded-pill px-3 py-1 mt-1">
                    {selectedDoc.code}
                  </div>
                </div>

                {/* Document Main Title */}
                <h5 className="fw-bold text-center mb-2" style={{ color: '#07294D' }}>
                  {isKhmer ? selectedDoc.titleKm : selectedDoc.titleEn}
                </h5>
                <div className="text-center text-muted small mb-3">
                  {isKhmer ? selectedDoc.titleEn : selectedDoc.titleKm}
                </div>

                {/* Details Paragraph */}
                <div className="p-3 bg-white rounded-3 border mb-3 small">
                  <div className="text-muted fw-semibold mb-1">{isKhmer ? 'សេចក្តីពិពណ៌នា និងគោលបំណង៖' : 'Description & Scope:'}</div>
                  <div style={{ lineHeight: '1.8' }}>
                    {isKhmer ? selectedDoc.descriptionKm : selectedDoc.descriptionEn}
                  </div>
                </div>

                {/* Submission Target Office */}
                <div className="d-flex align-items-center gap-2 p-2 px-3 bg-white rounded-3 border mb-3 small">
                  <i className="fas fa-building text-primary"></i>
                  <span className="text-muted">{isKhmer ? 'ការិយាល័យទទួលពាក្យ៖' : 'Submission Location:'}</span>
                  <span className="fw-bold text-dark">{selectedDoc.submissionOffice}</span>
                </div>

                {/* Required Documents / Checklist */}
                {selectedDoc.requiredDocsKm && (
                  <div className="p-3 bg-white rounded-3 border small">
                    <div className="fw-bold text-dark mb-2">
                      <i className="fas fa-clipboard-check me-2 text-success"></i>
                      {isKhmer ? 'ឯកសារភ្ជាប់ចាំបាច់សម្រាប់បំពេញបែបបទ៖' : 'Required Supporting Documents:'}
                    </div>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                      {(isKhmer ? selectedDoc.requiredDocsKm : selectedDoc.requiredDocsEn).map((item, idx) => (
                        <li key={idx} className="d-flex align-items-start gap-2 text-muted">
                          <i className="fas fa-check-circle text-primary mt-1 flex-shrink-0"></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                <span>{selectedDoc.fileSize}</span> • <span>{selectedDoc.updatedAt}</span>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4 btn-sm"
                  onClick={() => setSelectedDoc(null)}
                >
                  {t('downloads.close')}
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 btn-sm"
                  onClick={() => {
                    handleDownload(selectedDoc);
                    setSelectedDoc(null);
                  }}
                >
                  <i className="fas fa-download me-1"></i>
                  {t('downloads.downloadBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Download Success Toast */}
      {downloadSuccessToast && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 10000, animation: 'fadeInUp 0.3s ease-out' }}
        >
          <div className="d-flex align-items-center gap-3 p-3 px-4 bg-dark text-white rounded-pill shadow-lg">
            <i className="fas fa-check-circle text-success fs-5"></i>
            <span className="small fw-semibold">{downloadSuccessToast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadPage;
