import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wrench,
  Clock,
  ArrowLeft,
  PhoneCall,
  MapPin,
  Building,
  Calendar,
  Send,
  FileDown,
  BookOpen,
  Award,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  Compass,
  LogIn,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/under-development.css';

const FEATURES_CONFIG = {
  downloads: {
    key: 'downloads',
    icon: FileDown,
    accentColor: '#1e73be',
    pastelBg: '#eff6ff',
    pastelBorder: '#dbeafe',
    titleKm: 'មជ្ឈមណ្ឌលទាញយកឯកសារ និងទម្រង់បែបបទ',
    titleEn: 'Official Download Center & Application Forms',
    badgeKm: 'ឯកសារផ្លូវការស្ថាប័ន • Institutional Documents',
    badgeEn: 'Institutional Documents Repository',
    descKm: 'ប្រព័ន្ធទាញយកឯកសាររដ្ឋបាល ទម្រង់ពាក្យស្នើសុំ និងឯកសារសិក្សាផ្លូវការតាមប្រព័ន្ធអេឡិចត្រូនិក កំពុងស្ថិតក្នុងដំណាក់កាលអភិវឌ្ឍ និងផ្ទៀងផ្ទាត់សុវត្ថិភាព។ វិទ្យាស្ថាននឹងដាក់ឱ្យប្រើប្រាស់ជាផ្លូវការក្នុងពេលឆាប់ៗខាងមុខ។',
    descEn: 'The official digital repository for administrative forms, student application documents, and academic procedures is currently undergoing security validation and system finalization.',
    officeKm: 'ការិយាល័យរដ្ឋបាល និងកិច្ចការនិស្សិត (អគារ A ជាន់ផ្ទាល់ដី)',
    officeEn: 'Administration & Student Affairs Office (Building A, Ground Floor)',
    inPersonDescKm: 'ប្រសិនបើលោកអ្នក ឬសិស្ស-និស្សិតត្រូវការឯកសារ ឬទម្រង់បែបបទជាបន្ទាន់ សូមអញ្ជើញមកកាន់ការិយាល័យរដ្ឋបាលដើម្បីទទួលយកឯកសារច្បាប់ដើមដោយផ្ទាល់ជារៀងរាល់ម៉ោងធ្វើការ។',
    inPersonDescEn: 'If you urgently require official forms or academic documents, please visit our Administration Office during official working hours.',
    progress: 75,
    expectedKm: 'ឆមាសទី ១ ឆ្នាំសិក្សា ២០២៦-២០២៧',
    expectedEn: 'Semester 1, Academic Year 2026-2027'
  },
  library: {
    key: 'library',
    icon: BookOpen,
    accentColor: '#1e73be',
    pastelBg: '#eff6ff',
    pastelBorder: '#dbeafe',
    titleKm: 'បណ្ណាល័យអេឡិចត្រូនិក និងកាតាឡុកសៀវភៅ',
    titleEn: 'E-Library & Digital Catalog System',
    badgeKm: 'ធនធានសិក្សា TVET • Academic TVET Resources',
    badgeEn: 'TVET Academic Digital Resources',
    descKm: 'ប្រព័ន្ធបណ្ណាល័យឌីជីថល កាតាឡុកសៀវភៅអេឡិចត្រូនិក (E-Book) និងសេវាខ្ចី-សងសៀវភៅស្វ័យប្រវត្តិតាមអនឡាញ កំពុងស្ថិតក្នុងដំណាក់កាលរៀបចំទិន្នន័យ និងអភិវឌ្ឍប្រព័ន្ធ។',
    descEn: 'The digital e-library catalog and automated online book circulation system are currently in the final stages of metadata indexing and infrastructure deployment.',
    officeKm: 'អគារបណ្ណាល័យស្ថាប័ន RPITSSR (ជាន់ទី ២)',
    officeEn: 'RPITSSR Campus Library Building (2nd Floor)',
    inPersonDescKm: 'សិស្ស-និស្សិត និងលោកគ្រូ-អ្នកគ្រូ អាចអញ្ជើញមកអាន ខ្ចី និងស្រាវជ្រាវសៀវភៅច្បាប់ដើមផ្ទាល់នៅអគារបណ្ណាល័យស្ថាប័នបានជារៀងរាល់ថ្ងៃធ្វើការ។',
    inPersonDescEn: 'Students and faculty members are warmly invited to borrow physical volumes and utilize library study rooms in-person during official library hours.',
    progress: 80,
    expectedKm: 'ឆមាសទី ១ ឆ្នាំសិក្សា ២០២៦-២០២៧',
    expectedEn: 'Semester 1, Academic Year 2026-2027'
  },
  'exam-result': {
    key: 'exam-result',
    icon: Award,
    accentColor: '#059669',
    pastelBg: '#f0fdf4',
    pastelBorder: '#bbf7d0',
    titleKm: 'ប្រព័ន្ធពិនិត្យលទ្ធផលប្រឡងសិស្ស-និស្សិត',
    titleEn: 'Online Examination Results Lookup Portal',
    badgeKm: 'ការវាយតម្លៃ និងប្រឡង • Student Examination',
    badgeEn: 'Academic Evaluation & Score Registry',
    descKm: 'ប្រព័ន្ធស្វែងរក និងផ្ទៀងផ្ទាត់លទ្ធផលប្រឡងឆមាស ប្រឡងបញ្ចប់វគ្គ និងតារាងពិន្ទុនិស្សិតតាមប្រព័ន្ធអនឡាញ កំពុងស្ថិតក្នុងដំណាក់កាលតភ្ជាប់ទិន្នន័យសិក្សា។',
    descEn: 'The online student examination result lookup and grade verification portal is currently integrating secure academic scoring registries.',
    officeKm: 'ក្តារព័ត៌មានការិយាល័យសិក្សា និងដេប៉ាតឺម៉ង់ជំនាញ',
    officeEn: 'Academic Affairs Bulletin Board & Department Offices',
    inPersonDescKm: 'សិស្ស-និស្សិតអាចពិនិត្យតារាងលទ្ធផលប្រឡងផ្លូវការដែលបានបិទផ្សាយនៅក្តារព័ត៌មានមុខការិយាល័យសិក្សា ឬទាក់ទងផ្ទាល់ជាមួយដេប៉ាតឺម៉ង់ជំនាញរបស់ខ្លួន។',
    inPersonDescEn: 'Students may inspect officially published score rosters posted on bulletin boards outside the Academic Affairs office or consult department coordinators.',
    progress: 70,
    expectedKm: 'ឆមាសទី ១ ឆ្នាំសិក្សា ២០២៦-២០២៧',
    expectedEn: 'Semester 1, Academic Year 2026-2027'
  },
  admission: {
    key: 'admission',
    icon: GraduationCap,
    accentColor: '#ea580c',
    pastelBg: '#fff7ed',
    pastelBorder: '#fed7aa',
    titleKm: 'ប្រព័ន្ធចុះឈ្មោះចូលរៀនអនឡាញ (Online Admissions)',
    titleEn: 'Online Student Admission Application System',
    badgeKm: 'ការចុះឈ្មោះចូលរៀន • Admissions 2026-2027',
    badgeEn: 'Admissions & TVET Enrollment Portal',
    descKm: 'ទម្រង់ចុះឈ្មោះ និងដាក់ពាក្យស្នើសុំចូលរៀនវគ្គបណ្តុះបណ្តាលបច្ចេកទេស និងវិជ្ជាជីវៈ (TVET) តាមប្រព័ន្ធអនឡាញ កំពុងស្ថិតក្នុងការត្រួតពិនិត្យ និងកែលម្អប្រព័ន្ធទទួលពាក្យ។',
    descEn: 'The public online admission application portal for technical vocational certificates and higher diplomas is undergoing final intake workflow optimization.',
    officeKm: 'ការិយាល័យផ្តល់ព័ត៌មាន និងទទួលពាក្យចុះឈ្មោះ (Admission Office - អគារ A)',
    officeEn: 'Admissions & Enrollment Office (Building A, Ground Floor)',
    inPersonDescKm: 'បេក្ខជនអាចអញ្ជើញមកទស្សនកិច្ច និងបំពេញពាក្យចុះឈ្មោះចូលរៀនដោយផ្ទាល់នៅការិយាល័យចុះឈ្មោះរបស់វិទ្យាស្ថាន ឬទាក់ទងមកទូរស័ព្ទប្រឹក្សាយោបល់ជំនាញ។',
    inPersonDescEn: 'Prospective students and guardians are invited to visit our Admissions Office in person to submit applications with counseling support.',
    progress: 85,
    expectedKm: 'ឆាប់ៗនេះ (សម្រាប់បវេសនកាលថ្មី)',
    expectedEn: 'Coming Soon (For Next Cohort Intake)'
  },
  register: {
    key: 'register',
    icon: UserCheck,
    accentColor: '#7c3aed',
    pastelBg: '#faf5ff',
    pastelBorder: '#e9d5ff',
    titleKm: 'ប្រព័ន្ធចុះឈ្មោះគណនីសិស្ស-និស្សិត',
    titleEn: 'Student Account Self-Registration Portal',
    badgeKm: 'គណនីនិស្សិត • Student Identity Portal',
    badgeEn: 'Student Single Sign-On Identity',
    descKm: 'ប្រព័ន្ធបង្កើត និងចុះឈ្មោះគណនីសិស្ស-និស្សិតស្វ័យប្រវត្តិតាមរយៈសាធារណៈ កំពុងស្ថិតក្នុងដំណាក់កាលរៀបចំសុវត្ថិភាព និងការផ្ទៀងផ្ទាត់អត្តសញ្ញាណនិស្សិត។',
    descEn: 'The self-service student account registration portal is being finalized to ensure single sign-on security and verified student credentials.',
    officeKm: 'ការិយាល័យសិក្សាធិការ និងកិច្ចការនិស្សិត (អគារ A)',
    officeEn: 'Academic Affairs & Student Services (Building A)',
    inPersonDescKm: 'គណនីនិស្សិតផ្លូវការ នឹងត្រូវបានបង្កើត និងប្រគល់ជូនដោយការិយាល័យសិក្សា នៅពេលនិស្សិតបានបំពេញបែបបទចូលរៀនចប់សព្វគ្រប់។ ប្រសិនបើលោកអ្នកមានគណនីរួចហើយ សូមចុចចូលប្រើប្រាស់។',
    inPersonDescEn: 'Official student accounts are provisioned directly upon enrollment completion by the Academic Affairs office. If you already have credentials, please sign in.',
    progress: 80,
    expectedKm: 'ឆាប់ៗនេះ ឆ្នាំ២០២៦',
    expectedEn: 'Coming Soon 2026'
  }
};

export const UnderDevelopmentPage = ({ feature: propFeature }) => {
  const { language, currentLanguage } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';
  const location = useLocation();

  // Resolve feature key either from prop or from current URL pathname
  const featureKey = (() => {
    if (propFeature && FEATURES_CONFIG[propFeature]) return propFeature;
    const path = location.pathname.toLowerCase();
    if (path.includes('download') || path.includes('form')) return 'downloads';
    if (path.includes('library') || path.includes('book')) return 'library';
    if (path.includes('exam')) return 'exam-result';
    if (path.includes('apply') || path.includes('admission')) return 'admission';
    if (path.includes('register')) return 'register';
    return 'downloads';
  })();

  const config = FEATURES_CONFIG[featureKey] || FEATURES_CONFIG.downloads;
  const FeatureIcon = config.icon;

  return (
    <div className="under-dev-page">
      {/* 1. INSTITUTIONAL HERO BANNER (AGENTS.md Compliant - Crisp Daylight) */}
      <section className="under-dev-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-12 col-lg-10">
              {/* Breadcrumb & Official Badge */}
              <div className="under-dev-breadcrumb-wrap">
                <nav className="under-dev-breadcrumb" aria-label="breadcrumb">
                  <Link to="/">
                    {isKhmer ? 'ទំព័រដើម' : 'Home'}
                  </Link>
                  <ChevronRight size={13} color="#94a3b8" />
                  <span>{isKhmer ? config.titleKm : config.titleEn}</span>
                  <ChevronRight size={13} color="#94a3b8" />
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                    {isKhmer ? 'កំពុងអភិវឌ្ឍ' : 'Under Development'}
                  </span>
                </nav>

                <div className="under-dev-status-badge">
                  <Wrench size={13} />
                  <span>{isKhmer ? 'មុខងារកំពុងស្ថិតក្នុងការអភិវឌ្ឍ' : 'Feature Under Development'}</span>
                </div>
              </div>

              {/* Main Institutional Title */}
              <h1 className="under-dev-title">
                {isKhmer ? config.titleKm : config.titleEn}
              </h1>

              {/* Subtitle */}
              <p className="under-dev-desc">
                {isKhmer ? config.descKm : config.descEn}
              </p>

              {/* Trust Badges */}
              <div className="under-dev-trust-badges">
                <div
                  className="under-dev-badge-pill"
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    color: '#1e73be'
                  }}
                >
                  <Clock size={14} />
                  <span>
                    {isKhmer
                      ? `កាលវិភាគដាក់ឱ្យប្រើ៖ ${config.expectedKm}`
                      : `Expected: ${config.expectedEn}`}
                  </span>
                </div>

                <div
                  className="under-dev-badge-pill"
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#059669'
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>
                    {isKhmer ? 'សេវាផ្ទាល់នៅវិទ្យាស្ថានដំណើរការធម្មតា' : 'In-Person Services Fully Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN NOTICE & IN-PERSON ALTERNATIVE CARD */}
      <section className="under-dev-content-section">
        <div className="container" style={{ maxWidth: '980px' }}>
          {/* Main Institutional Status Card */}
          <div className="under-dev-main-card">
            {/* Top Tricolor Accent Line */}
            <div className="under-dev-tricolor-line" />

            <div className="under-dev-main-card-inner">
              <div className="row align-items-center g-4">
                <div className="col-12 col-md-3 under-dev-icon-col">
                  <div
                    className="under-dev-icon-box"
                    style={{
                      background: config.pastelBg,
                      border: `1.5px solid ${config.pastelBorder}`,
                      color: config.accentColor
                    }}
                  >
                    <FeatureIcon size={42} />
                  </div>
                  <div className="under-dev-phase-tag">
                    <Wrench size={11} />
                    <span>{isKhmer ? 'ដំណាក់កាលអភិវឌ្ឍ' : 'In Progress'}</span>
                  </div>
                </div>

                <div className="col-12 col-md-9">
                  <span
                    className="under-dev-category-label"
                    style={{ color: config.accentColor }}
                  >
                    {isKhmer ? config.badgeKm : config.badgeEn}
                  </span>
                  <h2 className="under-dev-card-title">
                    {isKhmer
                      ? 'ប្រព័ន្ធកំពុងស្ថិតក្នុងដំណាក់កាលរៀបចំ និងតេស្តសាកល្បងសុវត្ថិភាព'
                      : 'System is Currently Under Final Integration & Testing'}
                  </h2>
                  <p className="under-dev-card-desc">
                    {isKhmer ? config.descKm : config.descEn}
                  </p>

                  {/* Progress Bar Strip */}
                  <div className="under-dev-progress-box">
                    <div className="under-dev-progress-label">
                      <span>
                        {isKhmer ? 'វឌ្ឍនភាពនៃការអភិវឌ្ឍប្រព័ន្ធ (Progress)' : 'Development Progress'}
                      </span>
                      <strong style={{ color: '#07294D' }}>{config.progress}%</strong>
                    </div>
                    <div className="under-dev-progress-bar-bg">
                      <div
                        className="under-dev-progress-bar-fill"
                        style={{ width: `${config.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* In-Person Alternative Guidance Card */}
          <div className="under-dev-guidance-card">
            <div className="under-dev-guidance-flex">
              <div className="under-dev-guidance-icon">
                <MapPin size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="under-dev-guidance-title">
                  {isKhmer ? 'សេវាបម្រើផ្ទាល់នៅវិទ្យាស្ថាន (In-Person Service)' : 'In-Person Campus Service Available'}
                </h3>
                <p className="under-dev-guidance-desc">
                  {isKhmer ? config.inPersonDescKm : config.inPersonDescEn}
                </p>
                <div className="under-dev-guidance-office">
                  <Building size={16} color="#1e73be" />
                  <span>{isKhmer ? config.officeKm : config.officeEn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact & Hotline Grid */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <div className="under-dev-info-box">
                <div className="under-dev-info-header">
                  <div
                    className="under-dev-info-icon-badge"
                    style={{ background: '#eff6ff', color: '#1e73be' }}
                  >
                    <PhoneCall size={18} />
                  </div>
                  <h4 className="under-dev-info-title">
                    {isKhmer ? 'ទូរស័ព្ទទាន់ហេតុការណ៍ (Hotlines)' : 'Campus Hotlines'}
                  </h4>
                </div>
                <div className="under-dev-hotlines-grid">
                  <a href="tel:0966660306" className="under-dev-hotline-link">096 666 0306</a>
                  <a href="tel:089483623" className="under-dev-hotline-link">089 483 623</a>
                  <a href="tel:086924448" className="under-dev-hotline-link">086 924 448</a>
                  <a href="tel:069728996" className="under-dev-hotline-link">069 728 996</a>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="under-dev-info-box">
                <div className="under-dev-info-header">
                  <div
                    className="under-dev-info-icon-badge"
                    style={{ background: '#f0fdf4', color: '#059669' }}
                  >
                    <Calendar size={18} />
                  </div>
                  <h4 className="under-dev-info-title">
                    {isKhmer ? 'ម៉ោងធ្វើការផ្លូវការ (Office Hours)' : 'Official Working Hours'}
                  </h4>
                </div>
                <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55 }}>
                  <div>
                    {isKhmer
                      ? 'ចន្ទ - សុក្រ ៖ ៧:៣០ ព្រឹក - ៥:០០ ល្ងាច'
                      : 'Monday - Friday: 7:30 AM - 5:00 PM'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                    {isKhmer
                      ? 'សៅរ៍ - អាទិត្យ ៖ សម្រាក (លើកលែងកម្មវិធីពិសេស)'
                      : 'Saturday - Sunday: Closed (Except Special Events)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. EXPLORE ACTIVE INSTITUTIONAL SERVICES GATEWAY */}
          <div className="under-dev-active-portal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Compass size={18} color="#1e73be" />
              <h4 style={{ color: '#07294D', fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                {isKhmer ? 'សេវា និងទំព័រផ្លូវការដែលកំពុងដំណើរការ' : 'Explore Active Institutional Services'}
              </h4>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '0 0 10px 0' }}>
              {isKhmer
                ? 'លោកអ្នកអាចចូលទស្សនាទំព័រ និងសេវាអប់រំផ្សេងៗទៀតរបស់វិទ្យាស្ថានបានយ៉ាងងាយស្រួល៖'
                : 'You can readily explore other active academic programs and official institute portals:'}
            </p>

            <div className="under-dev-active-grid">
              <Link to="/courses" className="under-dev-service-card">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h5 className="under-dev-service-title">{isKhmer ? 'ជំនាញ និងវគ្គសិក្សា' : 'Academic Programs'}</h5>
                  <p className="under-dev-service-sub">{isKhmer ? 'ថ្នាក់បរិញ្ញាបត្ររង និងវិញ្ញាបនបត្រ' : 'Degrees & TVET Training'}</p>
                </div>
              </Link>

              <Link to="/blog" className="under-dev-service-card">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#fefce8',
                    color: '#ca8a04',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h5 className="under-dev-service-title">{isKhmer ? 'ព័ត៌មាន និងសកម្មភាព' : 'News & Activities'}</h5>
                  <p className="under-dev-service-sub">{isKhmer ? 'សេចក្តីជូនដំណឹង និងព្រឹត្តិការណ៍' : 'Articles & Bulletins'}</p>
                </div>
              </Link>

              <Link to="/about" className="under-dev-service-card">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#faf5ff',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Building size={18} />
                </div>
                <div>
                  <h5 className="under-dev-service-title">{isKhmer ? 'អំពីវិទ្យាស្ថាន RPITSSR' : 'About RPITSSR'}</h5>
                  <p className="under-dev-service-sub">{isKhmer ? 'ចក្ខុវិស័យ និងរចនាសម្ព័ន្ធ' : 'Mission & Leadership'}</p>
                </div>
              </Link>

              <Link to="/login" className="under-dev-service-card">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#f0fdf4',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <LogIn size={18} />
                </div>
                <div>
                  <h5 className="under-dev-service-title">{isKhmer ? 'ចូលប្រើប្រាស់គណនី' : 'Account Login'}</h5>
                  <p className="under-dev-service-sub">{isKhmer ? 'ច្រកចូលសិស្ស និងបុគ្គលិក' : 'Student & Staff Portal'}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="under-dev-actions">
            <Link to="/" className="under-dev-btn-primary">
              <ArrowLeft size={16} />
              <span>{isKhmer ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}</span>
            </Link>

            <Link to="/contact" className="under-dev-btn-outline">
              <PhoneCall size={16} />
              <span>{isKhmer ? 'ទំនាក់ទំនងវិទ្យាស្ថាន' : 'Contact Us'}</span>
            </Link>

            <a
              href="https://t.me/rpitssr"
              target="_blank"
              rel="noopener noreferrer"
              className="under-dev-btn-accent"
            >
              <Send size={15} />
              <span>{isKhmer ? 'Telegram ផ្លូវការ' : 'Official Telegram'}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnderDevelopmentPage;
