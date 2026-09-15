import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  FileText,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  HardDrive,
  ShieldCheck,
  Award,
  ChevronRight,
  X,
  Printer,
  Phone,
  Mail,
  Building,
  ClipboardCheck,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  FolderOpen,
  Calendar,
  BookOpen,
  UserPlus
} from 'lucide-react';

// Khmer numeral conversion helper
const toKhmerNumber = (num) => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/[0-9]/g, (digit) => khmerDigits[parseInt(digit, 10)]);
};

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
      'ច្បាប់ចម្លងប័ណ្ណក្រីក្រ (បើមានអាទិភាព)'
    ],
    requiredDocsEn: [
      'Application signed by parent or legal guardian',
      'Residency verification certificate from Commune/Sangkat administration',
      'Copy of IDPoor card (for priority accommodation queue)'
    ]
  },

  // 2. ACADEMIC CALENDARS & TIMETABLES
  {
    id: 'doc-cal-2026-2027',
    code: 'CAL-AY-2026',
    category: 'calendars',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    updatedAt: '2026-08-01',
    downloadsCount: 6890,
    isPopular: true,
    titleKm: 'ប្រតិទិនសិក្សាផ្លូវការប្រចាំឆ្នាំ ២០២៦-២០២៧ (Official Academic Calendar)',
    titleEn: 'RPITSSR Official Academic Calendar 2026-2027',
    descriptionKm: 'ប្រតិទិនសិក្សាផ្លូវការបង្ហាញកាលបរិច្ឆេទបើកបវេសនកាល ឆមាសទី១ ឆមាសទី២ ការប្រឡងពាក់កណ្តាលឆមាស និងថ្ងៃឈប់សម្រាកបុណ្យជាតិ។',
    descriptionEn: 'Comprehensive institutional calendar covering Semester I & II start dates, exam weeks, TVET practicums, and official holidays.',
    submissionOffice: 'ផ្សព្វផ្សាយដោយការិយាល័យកិច្ចការសិក្សា និងស្រាវជ្រាវ',
    requiredDocsKm: null,
    requiredDocsEn: null
  },
  {
    id: 'doc-exam-rules',
    code: 'REG-EXAM-01',
    category: 'calendars',
    fileType: 'pdf',
    fileSize: '780 KB',
    updatedAt: '2026-07-20',
    downloadsCount: 2150,
    isPopular: false,
    titleKm: 'បទបញ្ជាផ្ទៃក្នុងស្តីពីការប្រឡង និងការវាយតម្លៃលទ្ធផលសិក្សា',
    titleEn: 'Examination Regulations & Academic Assessment Guidelines',
    descriptionKm: 'គោលការណ៍ណែនាំស្តីពីវិន័យក្នុងការប្រឡង បទបញ្ជាបន្ទប់ប្រឡង លក្ខខណ្ឌសុំប្រឡងសង និងប្រព័ន្ធគណនា GPA និងនិទ្ទេស។',
    descriptionEn: 'Institutional rules governing examination attendance, integrity violations, re-examination procedures, and the national grading scale.',
    submissionOffice: 'ការិយាល័យកិច្ចការសិក្សា និងស្រាវជ្រាវ',
    requiredDocsKm: null,
    requiredDocsEn: null
  },

  // 3. STUDENT HANDBOOKS & CURRICULUM
  {
    id: 'doc-student-handbook',
    code: 'HB-STU-2026',
    category: 'handbooks',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    updatedAt: '2026-08-12',
    downloadsCount: 4320,
    isPopular: true,
    titleKm: 'សៀវភៅណែនាំនិស្សិត RPITSSR (Student Handbook 2026-2027)',
    titleEn: 'RPITSSR Comprehensive Student Handbook 2026-2027',
    descriptionKm: 'សៀវភៅណែនាំពេញលេញស្តីពីសិទ្ធិ កាតព្វកិច្ច សេវាកម្មគាំទ្រនិស្សិត បណ្ណាល័យ រោងជាង និងសកម្មភាពសង្គមក្នុងបរិវេណវិទ្យាស្ថាន។',
    descriptionEn: 'Essential institutional guide detailing campus facilities, laboratory protocols, digital library access, and student code of conduct.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត',
    requiredDocsKm: null,
    requiredDocsEn: null
  },
  {
    id: 'doc-it-curriculum',
    code: 'CURR-IT-2026',
    category: 'handbooks',
    fileType: 'pdf',
    fileSize: '3.1 MB',
    updatedAt: '2026-07-15',
    downloadsCount: 3870,
    isPopular: false,
    titleKm: 'កម្មវិធីសិក្សា និងសៀវភៅគោលជំនាញបច្ចេកវិទ្យាព័ត៌មាន (IT Curriculum Guide)',
    titleEn: 'Information Technology Curriculum & Course Syllabus',
    descriptionKm: 'ព័ត៌មានលម្អិតមុខវិជ្ជា រយៈពេលសិក្សា និងក្រេឌីតសម្រាប់កម្រិត C1, C2, C3, បរិញ្ញាបត្ររង និងបរិញ្ញាបត្របច្ចេកវិទ្យា។',
    descriptionEn: 'Complete syllabus and course modular mapping for software development, network engineering, and cybersecurity programs.',
    submissionOffice: 'ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាព័ត៌មាន (អគារ C, បន្ទប់ ២០១)',
    requiredDocsKm: null,
    requiredDocsEn: null
  },
  {
    id: 'doc-internship-guide',
    code: 'HB-INTERN-01',
    category: 'handbooks',
    fileType: 'pdf',
    fileSize: '1.6 MB',
    updatedAt: '2026-06-25',
    downloadsCount: 2980,
    isPopular: false,
    titleKm: 'សៀវភៅណែនាំការចុះកម្មសិក្សាការងារ (Internship Logbook & Guidelines)',
    titleEn: 'Industrial Internship Guidelines & Practical Logbook Template',
    descriptionKm: 'សៀវភៅតាមដានការចុះអនុវត្តការងារផ្ទាល់នៅតាមសហគ្រាស និងរោងចក្រដៃគូ របៀបសរសេររបាយការណ៍កម្មសិក្សា និងការវាយតម្លៃពីអ្នកគ្រប់គ្រង។',
    descriptionEn: 'Step-by-step guidance, weekly log sheets, and enterprise evaluation rubric for mandatory 3-month industrial workplace internships.',
    submissionOffice: 'ការិយាល័យទំនាក់ទំនងសហគ្រាស និងការងារ',
    requiredDocsKm: null,
    requiredDocsEn: null
  },

  // 4. ADMINISTRATIVE & STUDENT REQUEST FORMS
  {
    id: 'doc-student-cert',
    code: 'FORM-ADM-04',
    category: 'adminForms',
    fileType: 'docx',
    fileSize: '420 KB',
    updatedAt: '2026-08-18',
    downloadsCount: 4610,
    isPopular: true,
    titleKm: 'ពាក្យស្នើសុំលិខិតបញ្ជាក់ការសិក្សា (Certificate of Study Request)',
    titleEn: 'Certificate of Enrollment / Study Verification Request Form',
    descriptionKm: 'ទម្រង់ស្នើសុំលិខិតបញ្ជាក់ការសិក្សាផ្លូវការ ដើម្បីប្រើប្រាស់ក្នុងការពន្យារប័ណ្ណបើកបរ សុំទិដ្ឋាការ សុំការងារ ឬដាក់ពាក្យអាហារូបករណ៍ក្រៅប្រទេស។',
    descriptionEn: 'Formal application to obtain an official verification certificate of enrollment and student status for visa or employment purposes.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    requiredDocsKm: [
      'កាតសម្គាល់ខ្លួនសិស្ស-និស្សិត RPITSSR (ច្បាប់ដើម ឬច្បាប់ថតចម្លង)',
      'បង្កាន់ដៃបង់សេវារដ្ឋបាល (បើមានកំណត់)'
    ],
    requiredDocsEn: [
      'Valid RPITSSR Student ID card',
      'Administrative receipt from Finance Office (if applicable)'
    ]
  },
  {
    id: 'doc-transcript-req',
    code: 'FORM-ADM-05',
    category: 'adminForms',
    fileType: 'docx',
    fileSize: '480 KB',
    updatedAt: '2026-08-08',
    downloadsCount: 3420,
    isPopular: false,
    titleKm: 'ពាក្យស្នើសុំព្រឹត្តិបត្រពិន្ទុផ្លូវការ (Official Academic Transcript Request)',
    titleEn: 'Official Academic Transcript & Grade Sheet Request Form',
    descriptionKm: 'ទម្រង់ស្នើសុំព្រឹត្តិបត្រពិន្ទុគ្រប់ឆមាស ឬព្រឹត្តិបត្រពិន្ទុបញ្ចប់ការសិក្សាជាភាសាខ្មែរ ឬអង់គ្លេស។',
    descriptionEn: 'Request form for certified semester-by-semester grade transcripts issued by the Registrar Office.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    requiredDocsKm: [
      'កាតនិស្សិត ឬអត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ',
      'ពាក្យស្នើសុំបំពេញរួចរាល់'
    ],
    requiredDocsEn: [
      'Student ID card or National Cambodian ID',
      'Fully filled request form'
    ]
  },
  {
    id: 'doc-leave-request',
    code: 'FORM-ADM-06',
    category: 'adminForms',
    fileType: 'docx',
    fileSize: '390 KB',
    updatedAt: '2026-07-28',
    downloadsCount: 1650,
    isPopular: false,
    titleKm: 'ពាក្យសុំច្បាប់ឈប់សម្រាកសិក្សាបណ្តោះអាសន្ន (Leave of Absence Request)',
    titleEn: 'Temporary Leave of Absence / Postponement Application',
    descriptionKm: 'ទម្រង់សុំព្យួរការសិក្សា ឬសុំច្បាប់ឈប់សម្រាករយៈពេលខ្លី ដោយសារបញ្ហាសុខភាព ឬធុរៈចាំបាច់ក្នុងគ្រួសារ។',
    descriptionEn: 'Application for official semester deferral, health-related leave, or approved absence from technical coursework.',
    submissionOffice: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត',
    requiredDocsKm: [
      'វេជ្ជបញ្ជា ឬលិខិតបញ្ជាក់សុខភាពពីមន្ទីរពេទ្យ (ករណីឈឺ)',
      'ការយល់ព្រមពីអាណាព្យាបាល'
    ],
    requiredDocsEn: [
      'Official medical certificate (for health-related leaves)',
      'Parent or guardian written concurrence'
    ]
  },
  {
    id: 'doc-internship-eval',
    code: 'FORM-EVAL-01',
    category: 'adminForms',
    fileType: 'xlsx',
    fileSize: '540 KB',
    updatedAt: '2026-08-02',
    downloadsCount: 2780,
    isPopular: false,
    titleKm: 'តារាងវាយតម្លៃការអនុវត្តកម្មសិក្សាដោយសហគ្រាស (Internship Assessment Template)',
    titleEn: 'Enterprise Supervisor Internship Assessment Spreadsheet Template',
    descriptionKm: 'តារាង Excel សម្រាប់អ្នកគ្រប់គ្រងនៅក្រុមហ៊ុន ឬរោងចក្រវាយតម្លៃលើវិន័យ សីលធម៌ និងសមត្ថភាពបច្ចេកទេសរបស់និស្សិតចុះកម្មសិក្សា។',
    descriptionEn: 'Interactive Excel grading sheet for enterprise mentors to score student competency, punctuality, and technical execution.',
    submissionOffice: 'ការិយាល័យទំនាក់ទំនងសហគ្រាស និងការងារ',
    requiredDocsKm: null,
    requiredDocsEn: null
  }
];

export const DownloadPage = () => {
  const { t, isKhmer } = useLanguage();
  const [documents, setDocuments] = useState(OFFICIAL_DOCUMENTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter categories with labels and icons
  const categories = [
    { id: 'all', labelKh: 'ទាំងអស់', labelEn: 'All Forms', icon: FolderOpen },
    { id: 'admissions', labelKh: 'ការចុះឈ្មោះ & អាហារូបករណ៍', labelEn: 'Admissions & TVET', icon: UserPlus },
    { id: 'calendars', labelKh: 'កាលវិភាគ & ប្រតិទិន', labelEn: 'Calendars & Schedules', icon: Calendar },
    { id: 'handbooks', labelKh: 'សៀវភៅណែនាំ & បទបញ្ជា', labelEn: 'Handbooks & Syllabus', icon: BookOpen },
    { id: 'adminForms', labelKh: 'ទម្រង់រដ្ឋបាល & លិខិតបញ្ជាក់', labelEn: 'Administrative Forms', icon: FileText }
  ];

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts = { all: documents.length };
    categories.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = documents.filter(d => d.category === cat.id).length;
      }
    });
    return counts;
  }, [documents]);

  // Total downloads aggregate
  const totalDownloads = useMemo(() => {
    return documents.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);
  }, [documents]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Category match
      const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;

      // Format match
      const matchesFormat = selectedFormat === 'all' || doc.fileType === selectedFormat;

      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        doc.titleKm.toLowerCase().includes(query) ||
        doc.titleEn.toLowerCase().includes(query) ||
        doc.code.toLowerCase().includes(query) ||
        doc.descriptionKm.toLowerCase().includes(query) ||
        doc.descriptionEn.toLowerCase().includes(query);

      return matchesCategory && matchesFormat && matchesSearch;
    });
  }, [documents, activeCategory, selectedFormat, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocs.slice(start, start + itemsPerPage);
  }, [filteredDocs, currentPage, itemsPerPage]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSelectedFormat('all');
    setCurrentPage(1);
  };

  // Simulate Instant Download with counter update
  const handleDownload = (doc) => {
    setDocuments((prevDocs) =>
      prevDocs.map((d) => (d.id === doc.id ? { ...d, downloadsCount: (d.downloadsCount || 0) + 1 } : d))
    );

    const docName = isKhmer ? doc.titleKm : doc.titleEn;
    setDownloadSuccessToast(
      isKhmer
        ? `ឯកសារ «${doc.code}» កំពុងទាញយកដោយជោគជ័យ!`
        : `Form "${doc.code}" download started successfully!`
    );

    // Create virtual download file for demo
    const element = document.createElement('a');
    const fileContent = `RPITSSR OFFICIAL DOCUMENT\nCode: ${doc.code}\nTitle: ${doc.titleKm}\n${doc.titleEn}\nCategory: ${doc.category}\nOffice: ${doc.submissionOffice}\nGenerated: ${new Date().toISOString()}`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.code}_RPITSSR.${doc.fileType === 'pdf' ? 'txt' : doc.fileType}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 4500);
  };

  // File type badge styling
  const getFileTypeBadge = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'PDF', icon: FileText };
      case 'docx':
        return { bg: '#eff6ff', color: '#1e73be', border: '#bfdbfe', label: 'WORD', icon: FileText };
      case 'xlsx':
        return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'EXCEL', icon: FileSpreadsheet };
      default:
        return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', label: 'FILE', icon: FileText };
    }
  };

  return (
    <div className="download-page-root" style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* =========================================================================
          1. DAYLIGHT INSTITUTIONAL HERO (Strictly AGENTS.md Standard)
          ========================================================================= */}
      <section className="download-page-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb */}
              <div className="download-breadcrumb">
                <Link to="/">{isKhmer ? 'ទំព័រដើម' : 'Home'}</Link>
                <ChevronRight size={14} />
                <span>{isKhmer ? 'មជ្ឈមណ្ឌលទាញយកឯកសារផ្លូវការ' : 'Downloads & Forms'}</span>
              </div>

              {/* Institutional Hero Badge */}
              <div>
                <span className="download-hero-badge">
                  <ShieldCheck size={16} />
                  {isKhmer
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប • RPITSSR'
                    : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                </span>
              </div>

              {/* Title */}
              <h1 className="download-hero-title">
                {isKhmer ? 'មជ្ឈមណ្ឌលទាញយកឯកសារ & ទម្រង់បែបបទផ្លូវការ' : 'Official Document & Forms Download Center'}
              </h1>

              {/* Subtitle */}
              <p className="download-hero-subtitle">
                {isKhmer
                  ? 'បណ្ណាល័យឯកសារផ្លូវការ ២៤/៧ ផ្តល់ជូនទម្រង់ពាក្យសុំចុះឈ្មោះចូលរៀន អាហារូបករណ៍ TVET 1.5M កាលវិភាគសិក្សា សៀវភៅណែនាំនិស្សិត និងទម្រង់បែបបទរដ្ឋបាលផ្សេងៗ។'
                  : 'Authenticated 24/7 institutional forms repository offering admissions paperwork, TVET 1.5M scholarship applications, academic syllabi, handbooks, and administrative requests.'}
              </p>

              {/* Trust Badges */}
              <div className="download-trust-badges">
                <span className="download-trust-pill">
                  <CheckCircle2 size={14} color="#059669" />
                  {isKhmer ? 'ទម្រង់ស្តង់ដារជាតិ ១០០%' : '100% National Standard Forms'}
                </span>
                <span className="download-trust-pill">
                  <Award size={14} color="#d97706" />
                  {isKhmer ? 'អាហារូបករណ៍ TVET 1.5M' : 'TVET 1.5M Scholarship Forms'}
                </span>
                <span className="download-trust-pill">
                  <Download size={14} color="#1e73be" />
                  {isKhmer ? 'ទាញយកឥតគិតថ្លៃ ២៤/៧' : 'Free Public Access 24/7'}
                </span>
                <span className="download-trust-pill">
                  <Building size={14} color="#7c3aed" />
                  {isKhmer ? 'ការិយាល័យសិក្សា អគារ A បន្ទប់ ១០៤' : 'Building A, Room 104'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Metrics, Search, Filter Toolbar, Cards, Steps)
          ========================================================================= */}
      <section className="download-main-area pt-10 pb-80" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          {/* 4-Card Metrics Strip */}
          <div className="download-metrics-grid">
            <div className="download-metric-card">
              <div className="download-metric-icon" style={{ background: '#eff6ff', color: '#1e73be' }}>
                <FileText size={24} />
              </div>
              <div>
                <div className="download-metric-num">
                  {isKhmer ? `${toKhmerNumber(documents.length)}+` : `${documents.length}+`}
                </div>
                <div className="download-metric-label">
                  {isKhmer ? 'ឯកសារ & ទម្រង់ផ្លូវការ' : 'Official Forms & Docs'}
                </div>
              </div>
            </div>

            <div className="download-metric-card">
              <div className="download-metric-icon" style={{ background: '#f0fdf4', color: '#059669' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="download-metric-num">
                  {isKhmer ? '១០០%' : '100%'}
                </div>
                <div className="download-metric-label">
                  {isKhmer ? 'សេវាឥតគិតថ្លៃសាធារណៈ' : 'Free Public Access'}
                </div>
              </div>
            </div>

            <div className="download-metric-card">
              <div className="download-metric-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <Download size={24} />
              </div>
              <div>
                <div className="download-metric-num">
                  {isKhmer ? `${toKhmerNumber(Math.round(totalDownloads / 1000))}K+` : `${Math.round(totalDownloads / 1000)}K+`}
                </div>
                <div className="download-metric-label">
                  {isKhmer ? 'ចំនួនទាញយកសរុប' : 'Total Downloads'}
                </div>
              </div>
            </div>

            <div className="download-metric-card">
              <div className="download-metric-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <Award size={24} />
              </div>
              <div>
                <div className="download-metric-num" style={{ fontSize: '1.45rem' }}>
                  TVET 1.5M
                </div>
                <div className="download-metric-label">
                  {isKhmer ? 'អាហារូបករណ៍រដ្ឋាភិបាល' : 'National TVET Forms'}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="download-toolbar d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            {/* Category Pills */}
            <div className="download-filter-group">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const count = categoryCounts[cat.id] || 0;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`download-filter-chip ${isActive ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <IconComponent size={14} />
                    <span>{isKhmer ? cat.labelKh : cat.labelEn}</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        color: isActive ? '#ffffff' : '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}
                    >
                      {isKhmer ? toKhmerNumber(count) : count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* File Format Selector */}
            <div className="download-format-pill-wrap">
              <span className="download-format-label">
                <span>{isKhmer ? 'ទម្រង់ឯកសារ' : 'Format'}:</span>
              </span>
              <select
                className="form-select download-format-select"
                value={selectedFormat}
                onChange={(e) => {
                  setSelectedFormat(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">{isKhmer ? 'គ្រប់ Format ទាំងអស់' : 'All Formats'}</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="docx">Word (.docx)</option>
                <option value="xlsx">Excel (.xlsx)</option>
              </select>
            </div>
          </div>

          {/* Live Search Bar inside Main section */}
          <div className="mb-4">
            <div className="download-search-wrapper mx-auto position-relative" style={{ maxWidth: '100%' }}>
              <Search
                size={18}
                className="position-absolute"
                style={{ left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                className="form-control download-search-input"
                placeholder={
                  isKhmer
                    ? 'ស្វែងរកឈ្មោះឯកសារ ពាក្យគន្លឹះ ឬលេខកូដ (ឧ. TVET, FORM-ADM, អាហារូបករណ៍)...'
                    : 'Search forms by title, keyword or code (e.g. TVET, FORM-ADM, Scholarship)...'
                }
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-link position-absolute p-0"
                  style={{ right: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', textDecoration: 'none' }}
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2 px-2" style={{ fontSize: '0.86rem', color: '#64748b' }}>
              <span>
                {isKhmer ? 'បង្ហាញលទ្ធផល ៖ ' : 'Showing: '}
                <strong style={{ color: '#07294D' }}>
                  {isKhmer ? toKhmerNumber(filteredDocs.length) : filteredDocs.length}
                </strong>{' '}
                {isKhmer ? 'ឯកសារ' : 'documents'}
              </span>

              {(searchQuery || activeCategory !== 'all' || selectedFormat !== 'all') && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-primary p-0"
                  onClick={handleClearFilters}
                  style={{ textDecoration: 'none', fontSize: '0.84rem', fontWeight: 600 }}
                >
                  {isKhmer ? 'សម្អាតការស្វែងរកទាំងអស់' : 'Reset All Filters'}
                </button>
              )}
            </div>
          </div>

          {/* Documents Grid */}
          {paginatedDocs.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border shadow-sm p-4">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#94a3b8'
                }}
              >
                <AlertCircle size={32} />
              </div>
              <h5 style={{ color: '#07294D', fontWeight: 700 }}>
                {isKhmer ? 'រកមិនឃើញឯកសារដែលត្រូវគ្នានឹងការស្វែងរកឡើយ' : 'No documents match your search criteria'}
              </h5>
              <p className="text-muted small mb-3">
                {isKhmer
                  ? 'សូមសាកល្បងពាក្យគន្លឹះថ្មី ឬកំណត់ជម្រើសនៃការច្រោះឡើងវិញ។'
                  : 'Try different keywords or clear current category and format filters.'}
              </p>
              <button
                className="btn btn-primary btn-sm rounded-pill px-4"
                onClick={handleClearFilters}
                style={{ background: '#07294D', borderColor: '#07294D' }}
              >
                {isKhmer ? 'កំណត់ការច្រោះឡើងវិញ' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {paginatedDocs.map((doc) => {
                const badge = getFileTypeBadge(doc.fileType);
                const BadgeIcon = badge.icon;

                return (
                  <div className="col-12 col-md-6 col-lg-4" key={doc.id}>
                    <div className="download-doc-card bg-white p-4 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between position-relative">
                      {/* Top Badges */}
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span
                            className="badge d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill"
                            style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontWeight: '700', fontSize: '0.78rem' }}
                          >
                            <BadgeIcon size={12} />
                            <span>{badge.label}</span>
                          </span>

                          <div className="d-flex align-items-center gap-1">
                            {doc.isPopular && (
                              <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1" style={{ fontSize: '0.72rem', fontWeight: '700' }}>
                                🔥 {isKhmer ? 'ពេញនិយម' : 'POPULAR'}
                              </span>
                            )}
                            <span className="badge bg-light text-secondary rounded-pill px-2 py-1" style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>
                              {doc.code}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h4
                          className="doc-title-text fw-bold mb-2"
                          style={{ color: '#07294D', fontSize: '1.05rem', lineHeight: '1.45', cursor: 'pointer' }}
                          onClick={() => setSelectedDoc(doc)}
                        >
                          {isKhmer ? doc.titleKm : doc.titleEn}
                        </h4>

                        {/* Subtitle in other language */}
                        <div className="text-muted small mb-3" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                          {isKhmer ? doc.titleEn : doc.titleKm}
                        </div>

                        {/* Excerpt */}
                        <p className="text-muted small mb-3" style={{ lineHeight: '1.65', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {isKhmer ? doc.descriptionKm : doc.descriptionEn}
                        </p>

                        {/* Checklist Preview if applicable */}
                        {doc.requiredDocsKm && (
                          <div className="p-2 px-3 rounded-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.76rem' }}>
                            <div className="fw-bold text-dark mb-1 d-flex align-items-center gap-1">
                              <ClipboardCheck size={12} color="#059669" />
                              <span>{isKhmer ? 'ឯកសារភ្ជាប់តម្រូវ ៖' : 'Required:'}</span>
                            </div>
                            <div className="text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {isKhmer ? doc.requiredDocsKm[0] : doc.requiredDocsEn[0]}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Meta & Actions */}
                      <div className="pt-3 border-top mt-auto">
                        <div className="d-flex align-items-center justify-content-between text-muted small mb-3" style={{ fontSize: '0.76rem' }}>
                          <span className="d-inline-flex align-items-center gap-1">
                            <HardDrive size={12} />
                            {doc.fileSize}
                          </span>
                          <span className="d-inline-flex align-items-center gap-1">
                            <Clock size={12} />
                            {doc.updatedAt}
                          </span>
                          <span className="d-inline-flex align-items-center gap-1 text-primary fw-semibold">
                            <Download size={12} />
                            {isKhmer ? toKhmerNumber(doc.downloadsCount || 0) : doc.downloadsCount}
                          </span>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="download-btn-primary flex-fill"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download size={14} />
                            <span>{isKhmer ? 'ទាញយក' : 'Download'}</span>
                          </button>

                          <button
                            type="button"
                            className="download-btn-outline"
                            onClick={() => setSelectedDoc(doc)}
                            title={isKhmer ? 'មើលគំរូទម្រង់' : 'Preview Document'}
                          >
                            <Eye size={14} />
                            <span>{isKhmer ? 'គំរូ' : 'Preview'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Institutional Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-40">
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                style={{ height: '38px', minWidth: '40px' }}
              >
                {isKhmer ? '« មុន' : '« Prev'}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`btn btn-sm rounded-circle ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{
                    width: '38px',
                    height: '38px',
                    padding: 0,
                    fontWeight: 700,
                    backgroundColor: currentPage === pageNum ? '#07294D' : 'transparent',
                    borderColor: currentPage === pageNum ? '#07294D' : '#cbd5e1',
                    color: currentPage === pageNum ? '#ffffff' : '#334155'
                  }}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                >
                  {isKhmer ? toKhmerNumber(pageNum) : pageNum}
                </button>
              ))}

              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                style={{ height: '38px', minWidth: '40px' }}
              >
                {isKhmer ? 'បន្ទាប់ »' : 'Next »'}
              </button>
            </div>
          )}

          {/* =======================================================================
              3. 3-STEP HOW-TO-SUBMIT APPLICATION GUIDE
              ======================================================================= */}
          <div className="download-steps-card">
            <div className="text-center mb-4">
              <h3 className="fw-bold mb-2" style={{ color: '#07294D', fontSize: '1.65rem' }}>
                {isKhmer ? 'របៀបស្នើសុំ និងបំពេញបែបបទឯកសារ' : 'How to Fill Out & Submit Official Forms'}
              </h3>
              <p className="text-muted small mx-auto mb-0" style={{ maxWidth: '640px' }}>
                {isKhmer
                  ? 'សូមអនុវត្តតាមដំណាក់កាលងាយៗខាងក្រោម ដើម្បីទទួលបានឯកសារ និងដាក់ពាក្យបានត្រឹមត្រូវទាន់ពេលវេលា'
                  : 'Follow these straightforward steps to prepare and lodge your institutional applications on time.'}
              </p>
            </div>

            <div className="row g-4">
              {/* Step 1 */}
              <div className="col-12 col-md-4">
                <div className="download-step-box">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                    style={{ width: '56px', height: '56px', fontSize: '20px', fontWeight: '800', background: '#eff6ff', color: '#1e73be', border: '1px solid #bfdbfe' }}
                  >
                    {isKhmer ? '១' : '1'}
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
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                    style={{ width: '56px', height: '56px', fontSize: '20px', fontWeight: '800', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}
                  >
                    {isKhmer ? '២' : '2'}
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
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                    style={{ width: '56px', height: '56px', fontSize: '20px', fontWeight: '800', background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}
                  >
                    {isKhmer ? '៣' : '3'}
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

            {/* Need Help Support Banner */}
            <div className="download-help-banner">
              <div className="d-flex align-items-center gap-3">
                <div className="download-help-icon-wrap">
                  <Phone size={22} />
                </div>
                <div>
                  <div className="download-help-title">
                    {isKhmer ? 'ត្រូវការជំនួយ ឬព័ត៌មានបន្ថែម?' : 'Need Assistance or Form Guidelines?'}
                  </div>
                  <div className="download-help-desc">
                    {isKhmer
                      ? 'ក្រុមការងារការិយាល័យសិក្សារង់ចាំជួយសម្របសម្រួល និងឆ្លើយតបរាល់ចម្ងល់របស់លោកអ្នកក្នុងម៉ោងរដ្ឋបាល។'
                      : 'Our Academic Affairs team is on standby to assist with verification and form filing inquiries.'}
                  </div>
                </div>
              </div>
              <div className="download-help-btn-group">
                <a href="tel:+85563963888" className="download-help-phone-btn">
                  <Phone size={14} />
                  <span>(+855) 63 963 888</span>
                </a>
                <Link to="/contact" className="download-help-contact-btn">
                  <Mail size={14} />
                  <span>{isKhmer ? 'ទាក់ទងមកយើង' : 'Contact Us'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. OFFICIAL DOCUMENT PREVIEW LIGHTBOX MODAL
          ========================================================================= */}
      {selectedDoc && (
        <div
          className="download-modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(7, 41, 77, 0.65)', backdropFilter: 'blur(6px)', zIndex: 9999 }}
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="download-preview-modal bg-white rounded-4 shadow-lg overflow-hidden"
            style={{ maxWidth: '740px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-4 text-white d-flex justify-content-between align-items-start" style={{ background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 bg-white d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', color: '#07294D' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1 mb-1" style={{ fontSize: '0.72rem', fontWeight: '700' }}>
                    {selectedDoc.code}
                  </span>
                  <h5 className="fw-bold mb-0 text-white" style={{ fontSize: '1.15rem' }}>
                    {isKhmer ? 'គំរូទម្រង់ឯកសារផ្លូវការ' : 'Official Document Template Preview'}
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
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Document Preview Sheet */}
            <div className="p-4 overflow-auto" style={{ flex: 1 }}>
              <div className="p-4 rounded-3 border bg-light position-relative overflow-hidden mb-4" style={{ borderStyle: 'dashed' }}>
                {/* Watermark */}
                <div
                  className="position-absolute top-50 start-50 translate-middle text-uppercase fw-bold text-center"
                  style={{ color: 'rgba(7, 41, 77, 0.04)', fontSize: '5rem', pointerEvents: 'none', transform: 'translate(-50%, -50%) rotate(-25deg)', whiteSpace: 'nowrap' }}
                >
                  RPITSSR
                </div>

                {/* Institutional Header */}
                <div className="text-center mb-3 pb-3 border-bottom">
                  <div className="small fw-bold text-muted text-uppercase mb-1">
                    ព្រះរាជាណាចក្រកម្ពុជា | ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </div>
                  <div className="text-primary fw-bold small">
                    ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ
                  </div>
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
                  <div className="text-muted fw-semibold mb-1">
                    {isKhmer ? 'សេចក្តីពិពណ៌នា និងគោលបំណង ៖' : 'Description & Scope:'}
                  </div>
                  <div style={{ lineHeight: '1.8', color: '#334155' }}>
                    {isKhmer ? selectedDoc.descriptionKm : selectedDoc.descriptionEn}
                  </div>
                </div>

                {/* Submission Target Office */}
                <div className="d-flex align-items-center gap-2 p-2 px-3 bg-white rounded-3 border mb-3 small">
                  <Building size={16} color="#1e73be" />
                  <span className="text-muted">{isKhmer ? 'ការិយាល័យទទួលពាក្យ ៖' : 'Submission Location:'}</span>
                  <span className="fw-bold text-dark">{selectedDoc.submissionOffice}</span>
                </div>

                {/* Required Documents / Checklist */}
                {selectedDoc.requiredDocsKm && (
                  <div className="p-3 bg-white rounded-3 border small">
                    <div className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                      <ClipboardCheck size={16} color="#059669" />
                      <span>{isKhmer ? 'ឯកសារភ្ជាប់ចាំបាច់សម្រាប់បំពេញបែបបទ ៖' : 'Required Supporting Documents:'}</span>
                    </div>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                      {(isKhmer ? selectedDoc.requiredDocsKm : selectedDoc.requiredDocsEn).map((item, idx) => (
                        <li key={idx} className="d-flex align-items-start gap-2 text-muted">
                          <CheckCircle2 size={14} color="#1e73be" className="mt-1 flex-shrink-0" />
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
                  className="btn btn-outline-secondary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1"
                  onClick={() => window.print()}
                >
                  <Printer size={14} />
                  <span>{isKhmer ? 'បោះពុម្ព' : 'Print'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 btn-sm d-inline-flex align-items-center gap-1"
                  style={{ background: '#07294D', borderColor: '#07294D' }}
                  onClick={() => {
                    handleDownload(selectedDoc);
                    setSelectedDoc(null);
                  }}
                >
                  <Download size={14} />
                  <span>{isKhmer ? 'ទាញយកទម្រង់' : 'Download'}</span>
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
            <CheckCircle2 size={20} color="#10b981" />
            <span className="small fw-semibold">{downloadSuccessToast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadPage;
