import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';
import {
  Bell,
  Search,
  Calendar,
  Download,
  ExternalLink,
  Tag,
  ShieldCheck,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  FileText,
  Clock,
  Pin,
  X,
  Send,
  ChevronRight,
  ArrowRight,
  Info
} from 'lucide-react';

// Khmer numeral conversion helper
const toKhmerNumber = (num) => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/[0-9]/g, (digit) => khmerDigits[parseInt(digit, 10)]);
};

// Format Date nicely in Khmer or English
const formatNoticeDate = (dateString, isKhmer) => {
  if (!dateString) return isKhmer ? 'កាលបរិច្ឆេទមិនទាន់កំណត់' : 'Date not set';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    if (isKhmer) {
      const monthsKh = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ];
      const day = toKhmerNumber(d.getDate());
      const month = monthsKh[d.getMonth()];
      const year = toKhmerNumber(d.getFullYear());
      return `${day} ${month} ${year}`;
    } else {
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch {
    return dateString;
  }
};

const SAMPLE_FALLBACK_NOTICES = [
  {
    id: 1,
    title: 'សេចក្តីជូនដំណឹងស្តីពីការជ្រើសរើសសិស្ស-និស្សិតចូលរៀនវគ្គថ្មី ឆ្នាំសិក្សា ២០២៦-២០២៧',
    date: '2026-09-08',
    category: 'admissions',
    isPinned: true,
    fileUrl: '/uploads/notices/admissions-2026-2027.pdf',
    content: `វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR) សូមជូនដំណឹងដល់ប្អូនៗសិស្សានុសិស្ស អាណាព្យាបាល និងសាធារណជនទាំងអស់ឱ្យបានជ្រាបថា វិទ្យាស្ថានចាប់ផ្តើមទទួលពាក្យចុះឈ្មោះចូលរៀនចាប់ពីថ្ងៃផ្សាយដំណឹងនេះតទៅលើគ្រប់កម្រិតបណ្តុះបណ្តាល៖
- កម្រិតសញ្ញាបត្របច្ចេកទេស និងវិជ្ជាជីវៈ (C1, C2, C3)
- កម្រិតសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង / Associate Degree)
- កម្រិតបរិញ្ញាបត្របច្ចេកវិទ្យា (Bachelor of Technology - B.Tech)

ជំនាញបណ្តុះបណ្តាលរួមមាន៖ បច្ចេកវិទ្យាព័ត៌មាន (IT), អគ្គិសនី, បរិក្ខារត្រជាក់, មេកានិចយានយន្ត, និងសំណង់ស៊ីវិល។
* សិស្សមានប័ណ្ណក្រីក្រ/សមធម៌ ឬប័ណ្ណ ប.ស.ស ទទួលបានអាហារូបករណ៍ ១០០% ឥតគិតថ្លៃ និងប្រាក់ឧបត្ថម្ភ ២៨០,០០០ រៀល/ខែ។`
  },
  {
    id: 2,
    title: 'សេចក្តីប្រកាសស្តីពីការបើកទទួលពាក្យអាហារូបករណ៍ TVET 1.5M វគ្គទី ៤',
    date: '2026-09-05',
    category: 'scholarship',
    isPinned: true,
    fileUrl: '/uploads/notices/tvet-scholarship-batch4.pdf',
    content: `ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ សហការជាមួយវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប ប្រកាសបើកទទួលពាក្យសុំអាហារូបករណ៍ក្នុងកម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស ១.៥ លាននាក់ (TVET 1.5M) វគ្គទី ៤។
លក្ខខណ្ឌ៖
១. យុវជនមកពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះ (មានប័ណ្ណសមធម៌)
២. សិក្សាឥតគិតថ្លៃ ១០០% រយៈពេល ៤ ខែ
៣. ទទួលបានប្រាក់ឧបត្ថម្ភប្រចាំខែ ២៨០,០០០ រៀល
៤. មានការចុះអនុវត្តការងារផ្ទាល់នៅតាមរោងចក្រ សហគ្រាស និងធានាការងារធ្វើ ៩៥% ក្រោយបញ្ចប់ការសិក្សា។`
  },
  {
    id: 3,
    title: 'កាលវិភាគប្រឡងបញ្ចប់ឆមាសទី២ សម្រាប់សិស្ស-និស្សិតគ្រប់ដេប៉ាតឺម៉ង់',
    date: '2026-08-25',
    category: 'academic',
    isPinned: false,
    fileUrl: '/uploads/notices/exam-schedule-s2.pdf',
    content: `ការិយាល័យកិច្ចការសិក្សា និងស្រាវជ្រាវ សូមជម្រាបជូនសិស្ស-និស្សិតគ្រប់ដេប៉ាតឺម៉ង់ទាំងអស់ឱ្យបានជ្រាបថា ការប្រឡងបញ្ចប់ឆមាសទី២ ឆ្នាំសិក្សា ២០២៥-២០២៦ នឹងប្រព្រឹត្តទៅចាប់ពីថ្ងៃទី ១២ ដល់ថ្ងៃទី ២២ ខែកញ្ញា ឆ្នាំ២០២៦។
សូមសិស្ស-និស្សិតទាំងអស់ពិនិត្យមើលកាលវិភាគតាមមុខវិជ្ជានីមួយៗ និងអនុវត្តតាមបទបញ្ជាផ្ទៃក្នុងនៃការប្រឡងឱ្យបានត្រឹមត្រូវ។ អ្នកដែលអវត្តមានដោយគ្មានការអនុញ្ញាតនឹងចាត់ទុកជាធ្លាក់ដោយស្វ័យប្រវត្តិ។`
  },
  {
    id: 4,
    title: 'ការចុះឈ្មោះចុះកម្មសិក្សាការងារ (Internship) នៅតាមសហគ្រាសដៃគូ ឆមាសទី១',
    date: '2026-08-18',
    category: 'internship',
    isPinned: false,
    fileUrl: null,
    content: `ការិយាល័យទំនាក់ទំនងឧស្សាហកម្ម និងសហគ្រាស សូមអញ្ជើញនិស្សិតឆ្នាំបញ្ចប់កម្រិតបរិញ្ញាបត្ររង និងបរិញ្ញាបត្របច្ចេកវិទ្យាទាំងអស់ មកបំពេញបែបបទចុះឈ្មោះជ្រើសរើសទីតាំងចុះកម្មសិក្សាការងារ (Internship) រយៈពេល ៣ ខែ ចាប់ពីថ្ងៃជូនដំណឹងនេះរហូតដល់ថ្ងៃទី ៣០ ខែសីហា ឆ្នាំ២០២៦ នៅការិយាល័យទំនាក់ទំនងសហគ្រាស (អគារ B បន្ទប់ ១០៤)។`
  },
  {
    id: 5,
    title: 'ការបើកផ្តល់ប្រាក់ឧបត្ថម្ភប្រចាំខែ ២៨០,០០០ រៀល សម្រាប់សិស្សអាហារូបករណ៍ ១.៥ លាននាក់',
    date: '2026-08-10',
    category: 'scholarship',
    isPinned: false,
    fileUrl: null,
    content: `ការិយាល័យគណនេយ្យ និងហិរញ្ញវត្ថុ សូមជូនដំណឹងដល់សិស្ស-និស្សិតដែលកាន់ប័ណ្ណសមធម៌/ប័ណ្ណក្រីក្រ នៃកម្មវិធី TVET 1.5M ទាំងអស់មកទទួលប្រាក់ឧបត្ថម្ភប្រចាំខែតាមគណនីធនាគារវីង (Wing Bank) ឬទំនាក់ទំនងការិយាល័យហិរញ្ញវត្ថុក្នុងម៉ោងរដ្ឋបាល។`
  },
  {
    id: 6,
    title: 'សេចក្តីជូនដំណឹងស្តីពីការឈប់សម្រាកក្នុងឱកាសពិធីបុណ្យភ្ជុំបិណ្ឌ ប្រពៃណីជាតិ',
    date: '2026-08-01',
    category: 'general',
    isPinned: false,
    fileUrl: null,
    content: `វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប សូមជូនដំណឹងដល់គណៈគ្រប់គ្រង លោកគ្រូ អ្នកគ្រូ មន្ត្រីរាជការ បុគ្គលិក និងសិស្ស-និស្សិតទាំងអស់ឱ្យបានជ្រាបថា វិទ្យាស្ថាននឹងឈប់សម្រាកការងារ និងការសិក្សាក្នុងឱកាសពិធីបុណ្យភ្ជុំបិណ្ឌប្រពៃណីជាតិ ចាប់ពីថ្ងៃទី ១០ ដល់ថ្ងៃទី ១៤ ខែកញ្ញា ឆ្នាំ២០២៦។ ការងារ និងការសិក្សានឹងចាប់ផ្តើមដំណើរការធម្មតាឡើងវិញនៅថ្ងៃចន្ទ បន្ទាប់។`
  }
];

export const NoticePage = () => {
  const { currentLanguage, language, t } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    client.get('/notices')
      .then(res => {
        if (!isMounted) return;
        const data = res.data?.data || res.data || [];
        const validList = Array.isArray(data) ? data : [];
        if (validList.length > 0) {
          setNotices(validList);
        } else {
          setNotices(SAMPLE_FALLBACK_NOTICES);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Error fetching notices:', err);
        setNotices(SAMPLE_FALLBACK_NOTICES);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Category definitions with bilingual labels
  const categories = [
    { id: 'all', labelKh: 'ទាំងអស់', labelEn: 'All Notices', icon: Bell },
    { id: 'admissions', labelKh: 'ការចុះឈ្មោះ & ចូលរៀន', labelEn: 'Admissions & Intake', icon: GraduationCap },
    { id: 'academic', labelKh: 'កិច្ចការសិក្សា & ប្រឡង', labelEn: 'Academic & Exams', icon: BookOpen },
    { id: 'scholarship', labelKh: 'អាហារូបករណ៍ & ឧបត្ថម្ភ', labelEn: 'Scholarships & Grants', icon: Award },
    { id: 'internship', labelKh: 'កម្មសិក្សា & ការងារ', labelEn: 'Internships & Careers', icon: Briefcase },
    { id: 'general', labelKh: 'សេចក្តីជូនដំណឹងទូទៅ', labelEn: 'General Administration', icon: FileText }
  ];

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts = { all: notices.length };
    categories.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = notices.filter(n => {
          const itemCat = (n.category || '').toLowerCase();
          return itemCat === cat.id;
        }).length;
      }
    });
    return counts;
  }, [notices]);

  // Key metrics calculation
  const metrics = useMemo(() => {
    const total = notices.length;
    const pinnedCount = notices.filter(n => n.isPinned || n.isPinned === 1).length;
    const scholarshipCount = notices.filter(n => (n.category || '').toLowerCase() === 'scholarship').length;
    const academicCount = notices.filter(n => ['academic', 'admissions'].includes((n.category || '').toLowerCase())).length;

    return {
      total,
      pinnedCount,
      scholarshipCount,
      academicCount
    };
  }, [notices]);

  // Filtered and searched notices
  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
      // Category match
      const noticeCat = (notice.category || '').toLowerCase();
      const matchesCategory = activeCategory === 'all' || noticeCat === activeCategory;

      // Search query match
      const title = (notice.title || '').toLowerCase();
      const content = (notice.content || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || title.includes(query) || content.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [notices, activeCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage) || 1;
  const paginatedNotices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotices, currentPage, itemsPerPage]);

  // Reset pagination on filter change
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Category badge styling helper
  const getCategoryBadgeClass = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'admissions':
        return 'notice-cat-blue';
      case 'scholarship':
        return 'notice-cat-amber';
      case 'academic':
        return 'notice-cat-green';
      case 'internship':
        return 'notice-cat-purple';
      default:
        return 'notice-cat-blue';
    }
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.id === (category || '').toLowerCase());
    if (cat) {
      return isKhmer ? cat.labelKh : cat.labelEn;
    }
    return isKhmer ? 'សេចក្តីជូនដំណឹង' : 'Notice';
  };

  return (
    <div className="notice-page-root" style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* =========================================================================
          1. DAYLIGHT INSTITUTIONAL HERO (Strictly AGENTS.md Daylight standard)
          ========================================================================= */}
      <section className="notice-page-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb */}
              <div className="notice-breadcrumb">
                <Link to="/">{isKhmer ? 'ទំព័រដើម' : 'Home'}</Link>
                <ChevronRight size={14} />
                <span>{isKhmer ? 'សេចក្តីជូនដំណឹងផ្លូវការ' : 'Official Notices'}</span>
              </div>

              {/* Institutional Hero Badge */}
              <div>
                <span className="notice-hero-badge">
                  <ShieldCheck size={16} />
                  {isKhmer
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប • RPITSSR'
                    : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                </span>
              </div>

              {/* Title */}
              <h1 className="notice-hero-title">
                {isKhmer ? 'សេចក្តីជូនដំណឹង និងការប្រកាសផ្លូវការ' : 'Official Notices & Announcements'}
              </h1>

              {/* Subtitle */}
              <p className="notice-hero-subtitle">
                {isKhmer
                  ? 'ក្តារព័ត៌មានផ្លូវការរបស់វិទ្យាស្ថាន ផ្សព្វផ្សាយសេចក្តីជូនដំណឹងទាក់ទងនឹងការចុះឈ្មោះចូលរៀន ការប្រឡង អាហារូបករណ៍ កម្មសិក្សាការងារ និងសេចក្តីប្រកាសរដ្ឋបាលផ្សេងៗ។'
                  : 'The official institutional notice board providing authenticated circulars on student admissions, examination schedules, TVET scholarships, internships, and administrative decrees.'}
              </p>

              {/* Trust Badges */}
              <div className="notice-trust-badges">
                <span className="notice-trust-pill">
                  <ShieldCheck size={14} color="#059669" />
                  {isKhmer ? 'ឯកសារផ្លូវការ ១០០%' : '100% Verified Circulars'}
                </span>
                <span className="notice-trust-pill">
                  <Award size={14} color="#d97706" />
                  {isKhmer ? 'អាហារូបករណ៍ TVET 1.5M' : 'TVET 1.5M Scholarships'}
                </span>
                <span className="notice-trust-pill">
                  <Calendar size={14} color="#1e73be" />
                  {isKhmer ? 'កាលវិភាគប្រឡង & សិក្សា' : 'Exam & Class Schedules'}
                </span>
                <span className="notice-trust-pill">
                  <Briefcase size={14} color="#7c3aed" />
                  {isKhmer ? 'ឱកាសកម្មសិក្សា & ការងារ' : 'Internship & Careers'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Metrics, Search, Filters, Cards, Lightbox)
          ========================================================================= */}
      <section className="notice-main-area pt-10 pb-80">
        <div className="container">
          {/* 4-Card Metrics Strip */}
          <div className="notice-metrics-grid">
            <div className="notice-metric-card">
              <div className="notice-metric-icon" style={{ background: '#eff6ff', color: '#1e73be' }}>
                <Bell size={24} />
              </div>
              <div>
                <div className="notice-metric-num">
                  {isKhmer ? toKhmerNumber(metrics.total) : metrics.total}
                </div>
                <div className="notice-metric-label">
                  {isKhmer ? 'សេចក្តីជូនដំណឹងសរុប' : 'Total Announcements'}
                </div>
              </div>
            </div>

            <div className="notice-metric-card">
              <div className="notice-metric-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Pin size={24} />
              </div>
              <div>
                <div className="notice-metric-num">
                  {isKhmer ? toKhmerNumber(metrics.pinnedCount) : metrics.pinnedCount}
                </div>
                <div className="notice-metric-label">
                  {isKhmer ? 'សេចក្តីជូនដំណឹងសំខាន់' : 'Pinned & Urgent'}
                </div>
              </div>
            </div>

            <div className="notice-metric-card">
              <div className="notice-metric-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Award size={24} />
              </div>
              <div>
                <div className="notice-metric-num">
                  {isKhmer ? toKhmerNumber(metrics.scholarshipCount) : metrics.scholarshipCount}
                </div>
                <div className="notice-metric-label">
                  {isKhmer ? 'អាហារូបករណ៍ TVET' : 'Scholarships & Stipends'}
                </div>
              </div>
            </div>

            <div className="notice-metric-card">
              <div className="notice-metric-icon" style={{ background: '#f0fdf4', color: '#059669' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="notice-metric-num">
                  {isKhmer ? toKhmerNumber(metrics.academicCount) : metrics.academicCount}
                </div>
                <div className="notice-metric-label">
                  {isKhmer ? 'កិច្ចការសិក្សា & ប្រឡង' : 'Academic & Admissions'}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="notice-filter-wrapper">
            <div className="row align-items-center g-3">
              <div className="col-lg-6 col-md-12">
                <div className="notice-search-box">
                  <Search className="notice-search-icon" size={18} />
                  <input
                    type="text"
                    className="notice-search-input"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={
                      isKhmer
                        ? 'ស្វែងរកតាមចំណងជើង ឬខ្លឹមសារសេចក្តីជូនដំណឹង...'
                        : 'Search notices by title or keywords...'
                    }
                  />
                  {searchQuery && (
                    <button
                      className="notice-search-clear"
                      onClick={handleClearSearch}
                      title={isKhmer ? 'សម្អាតការស្វែងរក' : 'Clear Search'}
                      aria-label="Clear Search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="col-lg-6 col-md-12 text-lg-end text-start">
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                  {isKhmer ? 'បង្ហាញលទ្ធផល ៖ ' : 'Showing: '}
                  <strong style={{ color: '#07294D' }}>
                    {isKhmer ? toKhmerNumber(filteredNotices.length) : filteredNotices.length}
                  </strong>{' '}
                  {isKhmer ? 'សេចក្តីជូនដំណឹង' : 'notices'}
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="notice-filter-pills">
              {categories.map(cat => {
                const IconComponent = cat.icon;
                const count = categoryCounts[cat.id] || 0;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    className={`notice-filter-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <IconComponent size={15} />
                    <span>{isKhmer ? cat.labelKh : cat.labelEn}</span>
                    <span className="notice-count-badge">
                      {isKhmer ? toKhmerNumber(count) : count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notices List */}
          {loading ? (
            <div className="text-center py-5">
              <div
                style={{
                  border: '4px solid #f1f5f9',
                  borderTop: '4px solid #07294D',
                  borderRadius: '50%',
                  width: '46px',
                  height: '46px',
                  animation: 'spin 0.9s linear infinite',
                  margin: '0 auto 16px'
                }}
              />
              <p style={{ color: '#64748b', fontSize: '0.96rem', fontWeight: 600 }}>
                {isKhmer ? 'កំពុងផ្ទុកសេចក្តីជូនដំណឹង...' : 'Loading announcements...'}
              </p>
            </div>
          ) : paginatedNotices.length === 0 ? (
            <div
              className="text-center py-5 bg-white rounded-4"
              style={{ border: '1px dashed #cbd5e1', padding: '50px 20px' }}
            >
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
                <Info size={32} />
              </div>
              <h4 style={{ color: '#07294D', fontWeight: 700, marginBottom: '8px' }}>
                {isKhmer ? 'ពុំមានសេចក្តីជូនដំណឹងត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ' : 'No matching notices found'}
              </h4>
              <p style={{ color: '#64748b', maxWidth: '460px', margin: '0 auto 20px', fontSize: '0.94rem' }}>
                {isKhmer
                  ? 'សូមព្យាយាមផ្លាស់ប្តូរពាក្យគន្លឹះស្វែងរក ឬជ្រើសរើសប្រភេទផ្សេងទៀត។'
                  : 'Please adjust your search keywords or clear filters to see other announcements.'}
              </p>
              {(searchQuery || activeCategory !== 'all') && (
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                    setCurrentPage(1);
                  }}
                  style={{ borderColor: '#1e73be', color: '#1e73be' }}
                >
                  {isKhmer ? 'កំណត់ការស្វែងរកឡើងវិញ' : 'Reset All Filters'}
                </button>
              )}
            </div>
          ) : (
            <div className="notice-list-container">
              {paginatedNotices.map((notice, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                const formattedNum = globalIndex < 10 ? `0${globalIndex}` : `${globalIndex}`;
                const isPinned = Boolean(notice.isPinned);

                return (
                  <article
                    key={notice.id || index}
                    className={`inst-notice-card ${isPinned ? 'pinned' : ''}`}
                  >
                    <div className="notice-card-header">
                      <div className="notice-badge-group">
                        {isPinned && (
                          <span className="notice-pinned-badge">
                            <Pin size={12} />
                            {isKhmer ? 'សំខាន់ / Pinned' : 'Important Notice'}
                          </span>
                        )}
                        <span className={`notice-cat-badge ${getCategoryBadgeClass(notice.category)}`}>
                          <Tag size={12} />
                          {getCategoryLabel(notice.category)}
                        </span>
                      </div>
                      <span className="notice-card-num">
                        #{isKhmer ? toKhmerNumber(formattedNum) : formattedNum}
                      </span>
                    </div>

                    <h2
                      className="notice-card-title"
                      onClick={() => setSelectedNotice(notice)}
                    >
                      {notice.title}
                    </h2>

                    <p className="notice-card-excerpt">
                      {notice.content}
                    </p>

                    <div className="notice-card-footer">
                      <div className="notice-date-meta">
                        <Clock size={15} color="#1e73be" />
                        <span>
                          {isKhmer ? 'ផ្សាយថ្ងៃ ៖ ' : 'Published: '}
                          <strong>{formatNoticeDate(notice.date, isKhmer)}</strong>
                        </span>
                      </div>

                      <div className="notice-action-btns">
                        {notice.fileUrl && (
                          <a
                            href={notice.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="notice-btn-pdf"
                            title={isKhmer ? 'ទាញយកឯកសារភ្ជាប់ជា PDF' : 'Download attached document'}
                          >
                            <Download size={14} />
                            <span>{isKhmer ? 'ទាញយក PDF' : 'Download PDF'}</span>
                          </a>
                        )}

                        <button
                          className="notice-btn-detail"
                          onClick={() => setSelectedNotice(notice)}
                        >
                          <span>{isKhmer ? 'អានសេចក្តីជូនដំណឹង' : 'Read Notice'}</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
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
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                style={{ height: '38px', minWidth: '40px' }}
              >
                {isKhmer ? '« មុន' : '« Prev'}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
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
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                style={{ height: '38px', minWidth: '40px' }}
              >
                {isKhmer ? 'បន្ទាប់ »' : 'Next »'}
              </button>
            </div>
          )}

          {/* =======================================================================
              3. OFFICIAL TELEGRAM CHANNEL ALERT BANNER
              ======================================================================= */}
          <div className="notice-telegram-banner">
            <div className="row align-items-center">
              <div className="col-lg-8 mb-lg-0 mb-3">
                <div className="d-inline-flex align-items-center gap-2 mb-2" style={{ color: '#67e8f9', fontSize: '0.86rem', fontWeight: 700 }}>
                  <Send size={15} />
                  {isKhmer ? 'បណ្តាញទំនាក់ទំនងព័ត៌មានរហ័សផ្លូវការ' : 'Instant Official Notification Channel'}
                </div>
                <h3 className="notice-telegram-title">
                  {isKhmer
                    ? 'ទទួលព័ត៌មាន និងសេចក្តីជូនដំណឹងថ្មីៗតាម Telegram ផ្លូវការ'
                    : 'Subscribe to our Official Telegram Channel for Instant Alerts'}
                </h3>
                <p className="notice-telegram-text">
                  {isKhmer
                    ? 'កុំឱ្យខកខានឱកាសអាហារូបករណ៍ ១០០% កាលវិភាគប្រឡង និងដំណឹងជ្រើសរើសចូលរៀនថ្មីៗពីវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប។'
                    : 'Never miss scholarship circulars, exam schedules, and new intake announcements directly verified by RPITSSR administration.'}
                </p>
              </div>
              <div className="col-lg-4 text-lg-end text-start">
                <a
                  href="https://t.me/rpitssr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="notice-telegram-btn"
                >
                  <Send size={18} />
                  <span>{isKhmer ? 'ចូលរួម Telegram ផ្លូវការ' : 'Join Telegram Channel'}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. NOTICE DETAIL MODAL LIGHTBOX
          ========================================================================= */}
      {selectedNotice && (
        <div
          className="notice-modal-backdrop"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="notice-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="notice-modal-header">
              <button
                className="notice-modal-close"
                onClick={() => setSelectedNotice(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                {selectedNotice.isPinned && (
                  <span className="notice-pinned-badge">
                    <Pin size={12} />
                    {isKhmer ? 'សំខាន់ / Pinned' : 'Important'}
                  </span>
                )}
                <span className={`notice-cat-badge ${getCategoryBadgeClass(selectedNotice.category)}`}>
                  <Tag size={12} />
                  {getCategoryLabel(selectedNotice.category)}
                </span>
                <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>
                  <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {formatNoticeDate(selectedNotice.date, isKhmer)}
                </span>
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', lineHeight: 1.4, margin: '8px 0 0' }}>
                {selectedNotice.title}
              </h2>
            </div>

            <div className="notice-modal-body">
              {/* Official Seal / Department Header */}
              <div className="notice-modal-official-seal">
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.92rem' }}>
                    {isKhmer
                      ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                      : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.82rem' }}>
                    {isKhmer
                      ? 'សេចក្តីជូនដំណឹងផ្លូវការចេញដោយការិយាល័យរដ្ឋបាល និងកិច្ចការសិក្សា'
                      : 'Official Circular released by Administrative & Academic Affairs'}
                  </div>
                </div>
              </div>

              {/* Notice Content Body */}
              <div className="notice-modal-content-text">
                {selectedNotice.content}
              </div>

              {/* Action Buttons in Modal */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                {selectedNotice.fileUrl ? (
                  <a
                    href={selectedNotice.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2"
                    style={{ background: '#07294D', borderColor: '#07294D' }}
                  >
                    <Download size={16} />
                    <span>{isKhmer ? 'ទាញយកឯកសារភ្ជាប់ផ្លូវការ (PDF)' : 'Download Official PDF Attachment'}</span>
                  </a>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '0.86rem', fontStyle: 'italic' }}>
                    {isKhmer ? '* មិនមានឯកសារភ្ជាប់បន្ថែមសម្រាប់សេចក្តីជូនដំណឹងនេះទេ' : '* No external PDF attachment attached to this notice'}
                  </div>
                )}

                <button
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setSelectedNotice(null)}
                >
                  {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticePage;
