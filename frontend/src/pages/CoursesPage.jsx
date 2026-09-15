import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CourseCard } from '../components/common/CourseCard';
import {
  GraduationCap,
  Users,
  BookOpen,
  Search,
  X,
  CheckCircle2,
  Sparkles,
  Home,
  ChevronRight,
  Laptop,
  Briefcase,
  Award,
  ArrowRight,
  PhoneCall,
  Edit3,
  FileDown,
} from 'lucide-react';
import api from '../api/client';

export const CoursesPage = () => {
  const { t, currentLanguage, language } = useLanguage();
  const isKhmer = currentLanguage === 'km' || language === 'km';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = isKhmer
      ? 'ជំនាញ និងវគ្គបណ្តុះបណ្តាល (Academic & TVET Programs) | RPITSSR'
      : 'Our Academic & TVET Programs | RPITSSR';

    (async () => {
      try {
        setLoading(true);
        const coursesRes = await api.get('/courses');
        const sortedCourses = [...(coursesRes.data || [])].sort(
          (a, b) => (b.id || 0) - (a.id || 0)
        );
        setCourses(sortedCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isKhmer]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to extract category name string
  const getCourseCategoryRaw = (course) => {
    if (!course) return '';
    if (course.category && typeof course.category === 'object') {
      return course.category.name || '';
    }
    return String(course.category || '');
  };

  // Localized user-friendly Category Labels
  const getCategoryLabel = (rawName) => {
    const norm = String(rawName || '').toLowerCase().trim();
    if (norm.includes('ict') || norm.includes('comp')) {
      return isKhmer ? 'ព័ត៌មានវិទ្យា (ICT)' : 'Computer Science (ICT)';
    }
    if (norm.includes('elect')) {
      return isKhmer ? 'វិស្វកម្មអគ្គិសនី' : 'Electrical Engineering';
    }
    if (norm.includes('archi') || norm.includes('civil')) {
      return isKhmer ? 'វិស្វកម្មសំណង់ស៊ីវិល' : 'Civil Engineering';
    }
    if (norm.includes('air') || norm.includes('hvac')) {
      return isKhmer ? 'បរិក្ខារត្រជាក់ (HVAC)' : 'Air Conditioning';
    }
    if (norm.includes('agri')) {
      return isKhmer ? 'កសិកម្ម & ក្សេត្រសាស្ត្រ' : 'Agriculture';
    }
    if (norm.includes('anim')) {
      return isKhmer ? 'វារីវប្បកម្ម & បសុព្យាបាល' : 'Animal & Aquaculture';
    }
    if (norm.includes('tour')) {
      return isKhmer ? 'ទេសចរណ៍ & បដិសណ្ឋារកិច្ច' : 'Tourism & Hospitality';
    }
    if (norm.includes('eng')) {
      return isKhmer ? 'ភាសាអង់គ្លេស' : 'Business English';
    }
    if (norm.includes('mark')) {
      return isKhmer ? 'ទីផ្សារ (Marketing)' : 'Marketing';
    }
    if (norm.includes('bank') || norm.includes('buss') || norm.includes('business')) {
      return isKhmer ? 'គណនេយ្យ & ធុរកិច្ច' : 'Banking & Business';
    }
    return rawName || (isKhmer ? 'ទូទៅ' : 'General');
  };

  // Derive unique categories with course counts
  const categoryTabs = useMemo(() => {
    const counts = {};
    courses.forEach((c) => {
      const raw = getCourseCategoryRaw(c);
      if (raw) {
        counts[raw] = (counts[raw] || 0) + 1;
      }
    });

    const tabs = [{ key: 'all', label: isKhmer ? 'ទាំងអស់' : 'All Programs', count: courses.length }];
    Object.keys(counts).forEach((raw) => {
      tabs.push({
        key: raw,
        label: getCategoryLabel(raw),
        count: counts[raw],
      });
    });

    return tabs;
  }, [courses, isKhmer]);

  // Filter courses by category and search term
  const filteredCourses = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return courses.filter((c) => {
      const rawCat = getCourseCategoryRaw(c);
      const matchesCategory =
        selectedCategory === 'all' ||
        rawCat.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;
      if (!term) return true;

      const title = String(c.title || '').toLowerCase();
      const desc = String(c.description || '').toLowerCase();
      const catLabel = getCategoryLabel(rawCat).toLowerCase();
      const duration = String(c.duration || '').toLowerCase();

      return (
        title.includes(term) ||
        desc.includes(term) ||
        catLabel.includes(term) ||
        duration.includes(term)
      );
    });
  }, [courses, selectedCategory, searchQuery, isKhmer]);

  return (
    <div className="courses-page-wrapper">
      {/* 1. Page Hero Banner with Breadcrumb & Institutional Highlights */}
      <section className="courses-page-hero">
        <div className="container">
          <div className="courses-hero-content">
            {/* Breadcrumb Navigation */}
            <div className="courses-breadcrumb">
              <Link to="/" onClick={scrollToTop}>
                <Home size={14} />
                <span>{isKhmer ? 'ទំព័រដើម' : 'Home'}</span>
              </Link>
              <span className="crumb-sep">
                <ChevronRight size={13} />
              </span>
              <span className="active-crumb">
                {isKhmer ? 'វគ្គសិក្សា & ជំនាញ' : 'Courses & Programs'}
              </span>
            </div>

            {/* Badge & Title */}
            <div className="courses-hero-badge">
              <Sparkles size={15} />
              <span>{isKhmer ? 'កម្មវិធីបណ្តុះបណ្តាល TVET & បរិញ្ញាបត្រ' : 'TVET & Higher Education Programs'}</span>
            </div>

            <h1 className="courses-hero-title">
              {isKhmer ? 'ជំនាញ និងវគ្គបណ្តុះបណ្តាលបច្ចេកវិទ្យា' : 'Our Academic & Technical Programs'}
            </h1>

            <p className="courses-hero-subtitle">
              {isKhmer
                ? '«ជំនាញពិត ជីវិតប្រសើរ» — វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប ផ្តល់ជូនការបណ្តុះបណ្តាលជំនាញបច្ចេកទេស និងវិជ្ជាជីវៈកម្រិតខ្ពស់ គុណភាពស្តង់ដារ ISO 9001:2015 ជាមួយអាហារូបករណ៍ ១០០% និងឱកាសការងារខ្ពស់ជាង ៩៥%។'
                : 'Empowering Cambodian youth with market-ready vocational skills, modern technological knowledge, and high employment opportunities under ISO 9001:2015 quality standards.'}
            </p>

            {/* Trust Pills */}
            <div className="courses-trust-pills">
              <div className="courses-trust-pill">
                <CheckCircle2 size={16} style={{ color: '#ffaf00' }} />
                <span>{isKhmer ? 'អាហារូបករណ៍ ១០០% របស់រាជរដ្ឋាភិបាល' : '100% Gov Scholarships'}</span>
              </div>
              <div className="courses-trust-pill">
                <CheckCircle2 size={16} style={{ color: '#38bdf8' }} />
                <span>{isKhmer ? 'ឱកាសការងារខ្ពស់ជាង ៩៥% ក្រោយបញ្ចប់' : '95%+ Job Placement'}</span>
              </div>
              <div className="courses-trust-pill">
                <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
                <span>{isKhmer ? 'ចុះកម្មសិក្សាផ្ទាល់នៅសហគ្រាសដៃគូ' : 'Enterprise Internship'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Educational Environment & Facilities Highlights */}
      <section className="courses-env-section">
        <div className="container">
          <div className="row justify-content-center mb-40">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <GraduationCap size={14} /> {isKhmer ? 'បរិយាកាសសិក្សា & រោងជាង' : 'Training Environment'}
                </span>
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                  {t('courses.bestEnvironment')}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {t('courses.bestEnvironmentDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Facility Card 1 */}
            <div className="col-lg-4 col-md-6">
              <div className="courses-env-card">
                <div className="courses-env-icon-box blue">
                  <Laptop size={26} />
                </div>
                <h3 className="courses-env-title">
                  {isKhmer ? 'បន្ទប់ពិសោធន៍ & រោងជាងបច្ចេកវិទ្យាទំនើប' : 'Modern Practical Labs & Workshops'}
                </h3>
                <p className="courses-env-desc">
                  {isKhmer
                    ? 'បំពាក់សម្ភារៈឧបករណ៍ពិសោធន៍ទំនើប និងបន្ទប់កុំព្យូទ័រស្តង់ដារ ១ និស្សិត : ១ កុំព្យូទ័រ/ឧបករណ៍អនុវត្តជាក់ស្តែង ស្របតាមបច្ចេកវិទ្យាឧស្សាហកម្ម ៤.០។'
                    : 'Equipped with cutting-edge industry equipment and 1 Student : 1 PC ratio in advanced IT & engineering laboratories.'}
                </p>
              </div>
            </div>

            {/* Facility Card 2 */}
            <div className="col-lg-4 col-md-6">
              <div className="courses-env-card">
                <div className="courses-env-icon-box amber">
                  <Briefcase size={26} />
                </div>
                <h3 className="courses-env-title">
                  {isKhmer ? 'កម្មសិក្សាការងារផ្ទាល់នៅសហគ្រាសដៃគូ' : 'Enterprise Internships & Placements'}
                </h3>
                <p className="courses-env-desc">
                  {isKhmer
                    ? 'សិស្ស-និស្សិតទទួលបានការចុះអនុវត្តការងារ និងកម្មសិក្សាផ្ទាល់នៅរោងចក្រ ក្រុមហ៊ុន សណ្ឋាគារ និងសហគ្រាសដៃគូធំៗ ដើម្បីពង្រឹងសមត្ថភាពការងារជាក់ស្តែង។'
                    : 'Direct work experience and on-the-job internships with top enterprises, hotels, engineering firms, and tech companies in Siem Reap and Phnom Penh.'}
                </p>
              </div>
            </div>

            {/* Facility Card 3 */}
            <div className="col-lg-4 col-md-6">
              <div className="courses-env-card">
                <div className="courses-env-icon-box green">
                  <Award size={26} />
                </div>
                <h3 className="courses-env-title">
                  {isKhmer ? 'សញ្ញាបត្រទទួលស្គាល់ជាតិ & ISO 9001:2015' : 'Nationally Certified & ISO Standards'}
                </h3>
                <p className="courses-env-desc">
                  {isKhmer
                    ? 'ការបណ្តុះបណ្តាលធានាគុណភាពស្របតាមក្របខ័ណ្ឌគុណវុឌ្ឍិជាតិកម្ពុជា (CQF) ក្រោមឱវាទក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ និងស្តង់ដារអន្តរជាតិ។'
                    : 'Fully accredited by the Ministry of Labour and Vocational Training (MLVT) under the Cambodian National Qualification Framework.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="courses-env-actions">
            <Link to="/register" onClick={scrollToTop} className="footer-btn-primary" style={{ padding: '12px 30px' }}>
              <Edit3 size={17} />
              <span>{isKhmer ? 'ចុះឈ្មោះចូលរៀនឥឡូវនេះ' : 'Apply For Admission'}</span>
            </Link>
            <Link to="/contact" onClick={scrollToTop} className="footer-btn-outline" style={{ padding: '12px 26px' }}>
              <PhoneCall size={17} />
              <span>{isKhmer ? 'ទំនាក់ទំនងប្រឹក្សាជំនាញ' : 'Consult with Advisors'}</span>
            </Link>
            <Link to="/downloads" onClick={scrollToTop} className="home-hero-btn-outline" style={{ padding: '11px 22px' }}>
              <FileDown size={16} />
              <span>{isKhmer ? 'មជ្ឈមណ្ឌលទាញយកឯកសារ' : 'Download Brochure'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Interactive Course Explorer Section */}
      <section className="courses-explorer-section">
        <div className="container">
          {/* Centered Header */}
          <div className="row justify-content-center mb-40">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <BookOpen size={14} /> {isKhmer ? 'កាតាឡុកជំនាញ & វគ្គសិក្សា' : 'Programs Catalog'}
                </span>
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                  {t('courses.topCourses')}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {t('courses.topCoursesDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar & Category Filter Tabs */}
          <div className="courses-filter-wrapper">
            {/* Search Input */}
            <div className="courses-search-container">
              <Search size={18} className="courses-search-icon" />
              <input
                type="text"
                className="courses-search-input"
                placeholder={isKhmer ? 'ស្វែងរកជំនាញ ឬពាក្យគន្លឹះ... (ឧ. IT, អគ្គិសនី, កសិកម្ម)' : 'Search by major, keyword or duration...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="courses-search-clear"
                  onClick={() => setSearchQuery('')}
                  title={isKhmer ? 'សម្អាត' : 'Clear search'}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="courses-category-nav">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`courses-category-btn ${selectedCategory.toLowerCase() === tab.key.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(tab.key)}
                >
                  <span>{tab.label}</span>
                  <span className="category-count-pill">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Active Results Meta */}
            <div className="courses-results-meta">
              {isKhmer ? (
                <>
                  បង្ហាញលទ្ធផល: <strong>{filteredCourses.length}</strong> ជំនាញ
                  {selectedCategory !== 'all' && <> ក្នុងផ្នែក <strong>«{getCategoryLabel(selectedCategory)}»</strong></>}
                  {searchQuery && <> សម្រាប់ការស្វែងរក <strong>«{searchQuery}»</strong></>}
                </>
              ) : (
                <>
                  Showing <strong>{filteredCourses.length}</strong> programs
                  {selectedCategory !== 'all' && <> in <strong>{getCategoryLabel(selectedCategory)}</strong></>}
                  {searchQuery && <> matching <strong>"{searchQuery}"</strong></>}
                </>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="courses-wrapper">
            <div className="row g-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                    <div
                      className="single-courses text-center py-5"
                      style={{
                        minHeight: '320px',
                        background: '#f8fafc',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                      <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                        {isKhmer ? 'កំពុងទាញយកទិន្នន័យ...' : 'Loading courses...'}
                      </span>
                    </div>
                  </div>
                ))
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course, s) => (
                  <div key={course.id || s} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                    <CourseCard course={course} />
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="courses-empty-state">
                    <div className="courses-empty-icon">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="courses-empty-title">
                      {isKhmer ? 'ពុំមានជំនាញដែលត្រូវគ្នានឹងការស្វែងរករបស់អ្នកទេ' : 'No Programs Match Your Search'}
                    </h3>
                    <p className="courses-empty-desc">
                      {isKhmer
                        ? 'សូមសាកល្បងបញ្ចូលពាក្យគន្លឹះផ្សេងទៀត ឬកំណត់តម្រងឡើងវិញដើម្បីមើលវគ្គសិក្សាទាំងអស់។'
                        : 'Try searching with a different keyword or reset the category filter to see all programs.'}
                    </p>
                    <button
                      type="button"
                      className="footer-btn-primary"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                    >
                      <span>{isKhmer ? 'មើលវគ្គសិក្សាទាំងអស់' : 'Reset Filter & View All'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Faculty Members & Instructors Showcase Banner Card */}
      <section className="courses-faculty-section">
        <div className="container">
          <div className="row justify-content-center mb-40">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <Users size={14} /> {isKhmer ? 'គរុកោសល្យ & សាស្ត្រាចារ្យ' : 'Faculty & Instructors'}
                </span>
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                  {isKhmer ? 'សាស្ត្រាចារ្យ និងគ្រូបណ្តុះបណ្តាលជំនាញ RPITSSR' : 'Meet Our Expert Faculty Members'}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {isKhmer
                    ? 'គ្រូបណ្តុះបណ្តាលជំនាញ និងសាស្ត្រាចារ្យប្រកបដោយវិជ្ជាជីវៈខ្ពស់ យកចិត្តទុកដាក់ក្នុងការផ្ទេរចំណេះដឹង និងបណ្តុះបណ្តាលសមត្ថភាពជាក់ស្តែងជូនសិស្ស-និស្សិត។'
                    : 'Our dedicated faculty and certified master trainers possess deep industry expertise to provide student-centered practical mentoring.'}
                </p>
              </div>
            </div>
          </div>

          {/* Prestigious Group Photo Banner Card */}
          <div className="faculty-banner-card">
            <div className="faculty-banner-img-wrap">
              <img
                src="/images/teacher-all.jpg"
                alt="RPITSSR Faculty Members"
                className="faculty-banner-img"
                onError={(e) => { e.target.src = '/images/teacher-all.webp'; }}
              />
            </div>
            <div className="faculty-banner-content">
              <div>
                <h3 className="faculty-banner-title">
                  {isKhmer ? 'ក្រុមការងារសាស្ត្រាចារ្យ និងលោកគ្រូអ្នកគ្រូ RPITSSR' : 'RPITSSR Teaching Staff & Master Trainers'}
                </h3>
                <p className="faculty-banner-desc">
                  {isKhmer
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប មានសាស្ត្រាចារ្យ និងគ្រូបច្ចេកទេសជំនាញជាង ១០៥ នាក់ ដែលត្រូវបានទទួលស្គាល់កម្រិតជាតិ និងមានបទពិសោធន៍បង្រៀនជាក់ស្តែងជាច្រើនឆ្នាំ។'
                    : 'Over 105 certified instructors and faculty members dedicated to excellence in technical and vocational training.'}
                </p>
              </div>
              <Link to="/teachers" onClick={scrollToTop} className="faculty-banner-btn">
                <span>{isKhmer ? 'មើលប្រវត្តិរូបសាស្ត្រាចារ្យទាំងអស់' : 'Explore Faculty Directory'}</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
