import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { courseService } from '../services/courseService';
import { blogService } from '../services/blogService';
import api from '../api/client';
import { CourseCard } from '../components/common/CourseCard';
import { BlogCard } from '../components/common/BlogCard';
import { YouTubeVideoCard } from '../components/common/YouTubeVideoCard';
import { EventCard } from '../components/common/EventCard';
import {
  GraduationCap,
  FileDown,
  Building2,
  Phone,
  ArrowRight,
  Sparkles,
  Award,
  Briefcase,
  Users,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

// Curated real promotional & activity videos from RPITSSR official YouTube channel (@rpitssr_edu)
const promotionalVideos = [
  {
    id: 'v7UHTRM4Qmo',
    youtubeId: 'v7UHTRM4Qmo',
    youtubeUrl: 'https://www.youtube.com/watch?v=v7UHTRM4Qmo',
    title: '📣 សេចក្តីជូនដំណឹង៖ វគ្គសិក្សាអាហារូបករណ៍ ១០០% សម្រាប់ឆ្នាំសិក្សាថ្មី',
    description: 'សូមស្វាគមន៍មកកាន់វិទ្យាស្ថានក្នុងឆ្នាំសិក្សាថ្មី! ចាប់ផ្តើមទទួលចុះឈ្មោះចូលសិក្សាថ្នាក់បរិញ្ញាបត្របច្ចេកវិទ្យា និងសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង) អាហារូបករណ៍ ១០០% — TVET ជំនាញពិត ជីវិតប្រសើរ រៀនឲ្យចេះ ឲ្យចប់ ឲ្យមានការងារ!',
    category: 'អាហារូបករណ៍ ១០០%',
    duration: '1:15',
    publishedDate: 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
    isNew: true
  },
  {
    id: 'jO6qbRaqOow',
    youtubeId: 'jO6qbRaqOow',
    youtubeUrl: 'https://www.youtube.com/watch?v=jO6qbRaqOow',
    title: 'សកម្មភាពការសិក្សា និងការអនុវត្តផ្ទាល់របស់សិស្សវគ្គ C1 (TVET 1.5M)',
    description: 'ទស្សនាសកម្មភាពរៀន និងអនុវត្តផ្ទាល់របស់សិស្សវគ្គ C1 ក្នុងកម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស ១.៥ លាននាក់ (1.5M) — រៀនដោយឥតគិតថ្លៃ ព្រមទាំងទទួលបានប្រាក់ឧបត្ថម្ភ។',
    category: 'កម្មវិធី TVET 1.5M',
    duration: '0:58',
    publishedDate: 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
    isNew: true
  },
  {
    id: 'rF0eP2now0Q',
    youtubeId: 'rF0eP2now0Q',
    youtubeUrl: 'https://www.youtube.com/watch?v=rF0eP2now0Q',
    title: 'បទសម្ភាសន៍ និងចំណាប់អារម្មណ៍របស់និស្សិត ឈន់ ស្រីខួច (ជំនាន់ទី ១៨)',
    description: 'ចំណាប់អារម្មណ៍ និងបទពិសោធន៍ផ្ទាល់របស់និស្សិត ឈន់ ស្រីខួច លើគុណភាពនៃការបណ្តុះបណ្តាល និងបរិយាកាសសិក្សាជាក់ស្តែងនៅវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប។',
    category: 'បទសម្ភាសន៍និស្សិត',
    duration: '1:30',
    publishedDate: 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
    isNew: true
  },
  {
    id: 'QMpV0pgfFqU',
    youtubeId: 'QMpV0pgfFqU',
    youtubeUrl: 'https://www.youtube.com/watch?v=QMpV0pgfFqU',
    title: 'ដំណើរទស្សនកិច្ចសិក្សាស្វែងយល់ការងារជាក់ស្តែងរបស់និស្សិត RPITSSR',
    description: 'សកម្មភាពដំណើរទស្សនកិច្ចសិក្សាទៅកាន់បណ្តាសហគ្រាស និងរោងចក្រដៃគូ ដើម្បីដកស្រង់បទពិសោធន៍ការងារ និងផ្សារភ្ជាប់ទ្រឹស្តីទៅនឹងការអនុវត្តជាក់ស្តែងក្នុងវិស័យការងារ។',
    category: 'ទស្សនកិច្ចសិក្សា',
    duration: '1:45',
    publishedDate: 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
    isNew: true
  }
];

// Animated Counter component matching live site
const CountUpNumber = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export const HomePage = () => {
  const { t, currentLanguage, language } = useLanguage();
  const isKhmer = currentLanguage === 'km' || language === 'km';
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState(promotionalVideos);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // Normalizer matching production bundle chunk 605
  const normalizeArray = (res) => {
    const data = res?.data ?? res;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data?.posts)) return data.data.posts;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.posts)) return data.posts;
    return [];
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/courses').catch(() => ({ data: [] })),
      api.get('/blog-posts').catch(() => ({ data: [] })),
      api.get('/events').catch(() => ({ data: [] })),
      api.get('/event-categories/active').catch(() => api.get('/event-categories').catch(() => ({ data: [] }))),
      api.get('/youtube-videos').catch(() => ({ data: { data: { videos: [] } } })),
    ])
      .then(([coursesRes, blogRes, eventsRes, catRes, youtubeRes]) => {
        const rawCourses = normalizeArray(coursesRes);
        const sortedCourses = [...rawCourses].sort((a, b) => (b.id || 0) - (a.id || 0));
        setCourses(sortedCourses);
        setPosts(normalizeArray(blogRes));
        setEvents(normalizeArray(eventsRes));
        setCategories(normalizeArray(catRes));
        
        const liveVideos = youtubeRes?.data?.data?.videos;
        if (Array.isArray(liveVideos) && liveVideos.length > 0) {
          setVideos(liveVideos);
        }
      })
      .catch((err) => console.error('Failed to load home data', err))
      .finally(() => setLoading(false));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to filter events by category matching live site chunk 605
  const getFilteredEvents = (catId) => {
    if (!catId || catId === 'all') return events;
    const cat = categories.find((c) => String(c.id) === String(catId));
    if (!cat) return events;

    const directMatches = events.filter(
      (ev) => String(ev.category) === String(cat.id) || String(ev.category_id) === String(cat.id)
    );
    if (directMatches.length > 0) return directMatches;

    const catName = (cat.name || '').toLowerCase();
    return events.filter((ev) => {
      if (!ev.title) return false;
      const titleLower = ev.title.toLowerCase();
      if (catName.includes('course') || catName.includes('class')) {
        return titleLower.includes('course') || titleLower.includes('class') || titleLower.includes('education');
      }
      if (catName.includes('admission') || catName.includes('enroll')) {
        return titleLower.includes('admission') || titleLower.includes('enrollment') || titleLower.includes('registration');
      }
      if (catName.includes('training') || catName.includes('workshop')) {
        return titleLower.includes('training') || titleLower.includes('workshop') || titleLower.includes('seminar');
      }
      if (catName.includes('event') || catName.includes('general')) {
        return titleLower.includes('event') || titleLower.includes('ceremony') || titleLower.includes('celebration');
      }
      return titleLower.includes(catName);
    });
  };

  const displayedEvents = getFilteredEvents(activeTab);

  return (
    <div>
      {/* 1. Purpose-Driven Hero Section */}
      <section className="modern-home-hero">
        <div className="modern-home-hero-overlay"></div>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="modern-home-hero-content">
            <div className="home-hero-badge">
              <Sparkles size={16} />
              <span>{isKhmer ? 'វិទ្យាស្ថានបណ្តុះបណ្តាលវិជ្ជាជីវៈ និងបច្ចេកវិទ្យាកម្រិតខ្ពស់' : 'Leading Technical & Vocational Institute'}</span>
            </div>

            <h1 className="home-hero-title">
              {isKhmer ? (
                <>
                  វិទ្យាស្ថានពហុបច្ចេកទេស<br />
                  <span style={{ color: '#ffaf00' }}>ភូមិភាគតេជោសែនសៀមរាប</span>
                </>
              ) : (
                <>
                  Regional Polytechnic Institute<br />
                  <span style={{ color: '#ffaf00' }}>Techo Sen Siem Reap</span>
                </>
              )}
            </h1>

            <p className="home-hero-subtitle">
              {isKhmer
                ? '«ជំនាញពិត ជីវិតប្រសើរ» — បណ្តុះបណ្តាលជំនាញបច្ចេកទេស និងវិជ្ជាជីវៈកម្រិតខ្ពស់ គុណភាពស្តង់ដារជាតិ និងអន្តរជាតិ ដើម្បីកសាងអនាគតការងារដ៏រឹងមាំជូនយុវជនកម្ពុជា។'
                : 'Empowering Cambodian youth with market-ready vocational skills, modern technological knowledge, and high employment opportunities.'}
            </p>

            <div className="home-hero-actions">
              <Link to="/courses" className="home-hero-btn-primary" onClick={scrollToTop}>
                <GraduationCap size={18} />
                <span>{isKhmer ? 'ស្វែងយល់ពីជំនាញ' : 'Explore Programs'}</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/apply" className="home-hero-btn-secondary" onClick={scrollToTop}>
                <span>{isKhmer ? 'ចុះឈ្មោះចូលរៀន' : 'Enroll Now'}</span>
              </Link>
              <Link to="/downloads" className="home-hero-btn-outline" onClick={scrollToTop}>
                <FileDown size={16} />
                <span>{isKhmer ? 'មជ្ឈមណ្ឌលទាញយក' : 'Download Center'}</span>
              </Link>
            </div>

            <div className="home-hero-trust-bar">
              <div className="home-trust-item">
                <CheckCircle2 size={16} />
                <span>{isKhmer ? 'អាហារូបករណ៍ ១០០% របស់រាជរដ្ឋាភិបាល' : '100% Gov Scholarships'}</span>
              </div>
              <div className="home-trust-item">
                <CheckCircle2 size={16} />
                <span>{isKhmer ? 'ឱកាសការងារខ្ពស់ជាង ៩៥% ក្រោយបញ្ចប់' : '95%+ Job Placement'}</span>
              </div>
              <div className="home-trust-item">
                <CheckCircle2 size={16} />
                <span>{isKhmer ? 'ចុះកម្មសិក្សាផ្ទាល់នៅសហគ្រាសដៃគូ' : 'Enterprise Internship'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Access Gateways */}
      <section className="home-gateways-section">
        <div className="container">
          <div className="home-gateways-grid">
            {/* Gateway 1: Programs */}
            <Link to="/courses" className="home-gateway-card" onClick={scrollToTop}>
              <div>
                <div className="home-gateway-icon-wrap" style={{ background: '#eff6ff', color: '#1e73be' }}>
                  <GraduationCap size={24} />
                </div>
                <h3 className="home-gateway-title">
                  {isKhmer ? 'ជំនាញ និងវគ្គសិក្សា' : 'Academic Programs'}
                </h3>
                <p className="home-gateway-desc">
                  {isKhmer
                    ? 'កម្រិតបរិញ្ញាបត្របច្ចេកវិទ្យា សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស និងវគ្គ TVET 1.5M'
                    : 'Bachelor of Technology, Higher Diploma, and 1.5M TVET Programs.'}
                </p>
              </div>
              <span className="home-gateway-action">
                <span>{isKhmer ? 'ស្វែងយល់បន្ថែម' : 'Learn More'}</span>
                <ArrowRight size={15} />
              </span>
            </Link>

            {/* Gateway 2: Download Center */}
            <Link to="/downloads" className="home-gateway-card" onClick={scrollToTop}>
              <div>
                <div className="home-gateway-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <FileDown size={24} />
                </div>
                <h3 className="home-gateway-title">
                  {isKhmer ? 'មជ្ឈមណ្ឌលទាញយក' : 'Download Center'}
                </h3>
                <p className="home-gateway-desc">
                  {isKhmer
                    ? 'ទម្រង់ពាក្យសុំ ឯកសារសិក្សា បទបញ្ជាផ្ទៃក្នុង និងឯកសាររដ្ឋបាលផ្លូវការ'
                    : 'Application forms, brochures, curriculum guides, and official circulars.'}
                </p>
              </div>
              <span className="home-gateway-action" style={{ color: '#059669' }}>
                <span>{isKhmer ? 'ទាញយកឯកសារ' : 'View Downloads'}</span>
                <ArrowRight size={15} />
              </span>
            </Link>

            {/* Gateway 3: Organization / Leadership */}
            <Link to="/organization" className="home-gateway-card" onClick={scrollToTop}>
              <div>
                <div className="home-gateway-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
                  <Building2 size={24} />
                </div>
                <h3 className="home-gateway-title">
                  {isKhmer ? 'រចនាសម្ព័ន្ធដឹកនាំ' : 'Institute Leadership'}
                </h3>
                <p className="home-gateway-desc">
                  {isKhmer
                    ? 'ស្វែងយល់ពីរចនាសម្ព័ន្ធគ្រប់គ្រង ថ្នាក់ដឹកនាំ មហាវិទ្យាល័យ និងដេប៉ាតឺម៉ង់'
                    : 'Governance, organizational structure, directorate, and academic faculties.'}
                </p>
              </div>
              <span className="home-gateway-action" style={{ color: '#d97706' }}>
                <span>{isKhmer ? 'មើលរចនាសម្ព័ន្ធ' : 'View Structure'}</span>
                <ArrowRight size={15} />
              </span>
            </Link>

            {/* Gateway 4: Online Admissions */}
            <Link to="/apply" className="home-gateway-card" onClick={scrollToTop}>
              <div>
                <div className="home-gateway-icon-wrap" style={{ background: '#fdf2f8', color: '#db2777' }}>
                  <GraduationCap size={24} />
                </div>
                <h3 className="home-gateway-title">
                  {isKhmer ? 'ចុះឈ្មោះចូលរៀនអនឡាញ' : 'Online Admission'}
                </h3>
                <p className="home-gateway-desc">
                  {isKhmer
                    ? 'ដាក់ពាក្យស្នើសុំចូលរៀនតាមអនឡាញ និងតាមដានស្ថានភាពពាក្យសុំបានភ្លាមៗ'
                    : 'Submit admission application online and track your status anytime.'}
                </p>
              </div>
              <span className="home-gateway-action" style={{ color: '#db2777' }}>
                <span>{isKhmer ? 'ដាក់ពាក្យចូលរៀន' : 'Apply Online'}</span>
                <ArrowRight size={15} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Key Institutional Facts & Figures Showcase */}
      <section className="home-stats-section">
        <div className="container">
          <div className="row justify-content-center mb-40">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <Sparkles size={14} /> {isKhmer ? 'ស្ថិតិ & សមិទ្ធផល' : 'Facts & Figures'}
                </span>
                <h2 className="title" style={{ fontSize: 'clamp(1.35rem, 3.8vw, 2rem)', fontWeight: 800, color: '#07294D', lineHeight: 1.4, wordBreak: 'keep-all' }}>
                  {isKhmer ? 'ស្ថិតិ និងសមិទ្ធផលសំខាន់ៗរបស់វិទ្យាស្ថាន' : 'Key Facts & Figures at a Glance'}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {isKhmer
                    ? 'ឆ្លុះបញ្ចាំងពីទំហំ គុណភាពបណ្តុះបណ្តាល និងកិត្យានុភាពជាគ្រឹះស្ថានអប់រំបច្ចេកទេសឈានមុខគេក្នុងខេត្តសៀមរាប'
                    : 'Reflecting our scale, academic excellence, and prestige as the premier polytechnic institute in Siem Reap'}
                </p>
              </div>
            </div>
          </div>

          <div className="row g-3 g-lg-4 justify-content-center home-stats-row">
            {/* Stat 1: Students */}
            <div className="col-6 col-lg-3 col-sm-6">
              <div className="home-stat-card stat-blue">
                <div
                  className="home-stat-icon-wrap"
                  style={{ backgroundColor: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}
                >
                  <GraduationCap size={28} />
                </div>
                <div className="home-stat-number-wrap">
                  <span className="home-stat-number-val">
                    <CountUpNumber end={3652} duration={2000} />
                  </span>
                  <span className="home-stat-number-plus">+</span>
                </div>
                <div className="home-stat-title-kh">
                  {isKhmer ? 'និស្សិតកំពុងសិក្សា' : 'Enrolled Students'}
                </div>
                <div className="home-stat-subtitle-en">Students</div>
                <span
                  className="badge rounded-pill mt-2 px-3 py-1.5"
                  style={{ backgroundColor: '#eff6ff', color: '#1e73be', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #dbeafe' }}
                >
                  <i className="fas fa-certificate me-1" style={{ color: '#0284c7' }}></i>
                  {isKhmer ? 'TVET & បរិញ្ញាបត្រ' : 'TVET & Degree'}
                </span>
              </div>
            </div>

            {/* Stat 2: Faculties */}
            <div className="col-6 col-lg-3 col-sm-6">
              <div className="home-stat-card stat-orange">
                <div
                  className="home-stat-icon-wrap"
                  style={{ backgroundColor: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}
                >
                  <Users size={28} />
                </div>
                <div className="home-stat-number-wrap">
                  <span className="home-stat-number-val">
                    <CountUpNumber end={105} duration={2000} />
                  </span>
                  <span className="home-stat-number-plus">+</span>
                </div>
                <div className="home-stat-title-kh">
                  {isKhmer ? 'សាស្ត្រាចារ្យ & គ្រូបណ្តុះបណ្តាល' : 'Faculty Members'}
                </div>
                <div className="home-stat-subtitle-en">Faculties</div>
                <span
                  className="badge rounded-pill mt-2 px-3 py-1.5"
                  style={{ backgroundColor: '#fff7ed', color: '#c2410c', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #fed7aa' }}
                >
                  <i className="fas fa-star me-1" style={{ color: '#f59e0b' }}></i>
                  {isKhmer ? 'ជំនាញច្បាស់លាស់' : 'Certified Experts'}
                </span>
              </div>
            </div>

            {/* Stat 3: Programs / Courses */}
            <div className="col-6 col-lg-3 col-sm-6">
              <div className="home-stat-card stat-purple">
                <div
                  className="home-stat-icon-wrap"
                  style={{ backgroundColor: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}
                >
                  <BookOpen size={28} />
                </div>
                <div className="home-stat-number-wrap">
                  <span className="home-stat-number-val">
                    <CountUpNumber end={120} duration={2000} />
                  </span>
                  <span className="home-stat-number-plus">+</span>
                </div>
                <div className="home-stat-title-kh">
                  {isKhmer ? 'ជំនាញ & វគ្គបណ្តុះបណ្តាល' : 'Courses & Programs'}
                </div>
                <div className="home-stat-subtitle-en">Programs</div>
                <span
                  className="badge rounded-pill mt-2 px-3 py-1.5"
                  style={{ backgroundColor: '#faf5ff', color: '#6d28d9', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #e9d5ff' }}
                >
                  <i className="fas fa-bolt me-1" style={{ color: '#9333ea' }}></i>
                  {isKhmer ? 'ជំនាញទីផ្សារ ៤.០' : 'Industry 4.0'}
                </span>
              </div>
            </div>

            {/* Stat 4: Awards Win */}
            <div className="col-6 col-lg-3 col-sm-6">
              <div className="home-stat-card stat-gold">
                <div
                  className="home-stat-icon-wrap"
                  style={{ backgroundColor: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}
                >
                  <Award size={28} />
                </div>
                <div className="home-stat-number-wrap">
                  <span className="home-stat-number-val">
                    <CountUpNumber end={30} duration={2000} />
                  </span>
                  <span className="home-stat-number-plus">+</span>
                </div>
                <div className="home-stat-title-kh">
                  {isKhmer ? 'ពានរង្វាន់ & ស្នាដៃឆ្នើម' : 'National Awards'}
                </div>
                <div className="home-stat-subtitle-en">Awards Win</div>
                <span
                  className="badge rounded-pill mt-2 px-3 py-1.5"
                  style={{ backgroundColor: '#fefce8', color: '#a16207', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #fef08a' }}
                >
                  <i className="fas fa-trophy me-1" style={{ color: '#eab308' }}></i>
                  {isKhmer ? 'ស្តង់ដារគុណភាពជាតិ' : 'National Standards'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Top Courses Area */}
      <section className="top-courses-area home-top-courses-area">
        <div className="container">
          <div className="row justify-content-center mb-40">
            <div className="col-lg-8 text-center">
              <div className="section-title-2 mt-40">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <GraduationCap size={14} /> {isKhmer ? 'ជំនាញ & វគ្គសិក្សា' : 'Academic Programs'}
                </span>
                <h2 className="title" style={{ fontSize: 'clamp(1.35rem, 3.8vw, 2rem)', fontWeight: 800, color: '#07294D', lineHeight: 1.4, wordBreak: 'keep-all' }}>
                  {t('home.topCourses')}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {t('home.coursesDescription')}
                </p>
              </div>
            </div>
          </div>

          <div className="courses-wrapper">
            <div className="row g-2 g-md-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, s) => (
                  <div key={s} className="col-6 col-lg-3 col-sm-6 courses-col">
                    <div className="single-courses mt-30 text-center py-5">
                      <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                    </div>
                  </div>
                ))
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.id} className="col-6 col-lg-3 col-sm-6 courses-col">
                    <CourseCard course={course} />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p>No courses available at the moment.</p>
                </div>
              )}
            </div>

            {courses.length > 0 && (
              <div className="home-courses-all-btn-wrap text-center">
                <Link to="/courses" className="home-hero-btn-primary" style={{ display: 'inline-flex' }} onClick={scrollToTop}>
                  <BookOpen size={18} />
                  <span>{isKhmer ? 'មើលជំនាញ និងវគ្គសិក្សាទាំងអស់' : 'Browse All Courses & Programs'}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Why Choose RPITSSR (Key Advantages) */}
      <section className="home-why-section">
        <div className="container">
          <div className="row justify-content-center mb-40">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <Award size={14} /> {isKhmer ? 'ឧត្តមភាពវិទ្យាស្ថាន' : 'Why RPITSSR'}
                </span>
                <h2 className="title" style={{ fontSize: 'clamp(1.35rem, 3.8vw, 2rem)', fontWeight: 800, color: '#07294D', lineHeight: 1.4, wordBreak: 'keep-all' }}>
                  {isKhmer ? 'ហេតុអ្វីជ្រើសរើសសិក្សានៅ RPITSSR?' : 'Why Choose RPITSSR?'}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
                  {isKhmer
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប ផ្តល់ជូននូវការបណ្តុះបណ្តាលដែលផ្សារភ្ជាប់ទ្រឹស្តីទៅនឹងការអនុវត្តជាក់ស្តែង ដើម្បីធានាបាននូវជំនាញពិតប្រាកដ។'
                    : 'Providing world-class vocational training combining theoretical knowledge with hands-on enterprise practice.'}
                </p>
              </div>
            </div>
          </div>

          <div className="home-why-grid">
            {/* Card 1: Modern Labs */}
            <div className="home-why-card">
              <div className="home-why-icon-box" style={{ background: '#eff6ff', color: '#1e73be' }}>
                <Wrench size={26} />
              </div>
              <h4 className="home-why-card-title">
                {isKhmer ? 'បន្ទប់ពិសោធន៍ & រោងជាងទំនើប' : 'Modern Labs & Workshops'}
              </h4>
              <p className="home-why-card-desc">
                {isKhmer
                  ? 'បំពាក់ដោយឧបករណ៍ និងបច្ចេកវិទ្យាសិក្សាស្របតាមស្តង់ដារឧស្សាហកម្មជាក់ស្តែង សម្រាប់សិស្ស-និស្សិតអនុវត្តផ្ទាល់។'
                  : 'Equipped with industry-standard machinery and simulation software for hands-on learning.'}
              </p>
            </div>

            {/* Card 2: Faculty */}
            <div className="home-why-card">
              <div className="home-why-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Users size={26} />
              </div>
              <h4 className="home-why-card-title">
                {isKhmer ? 'សាស្ត្រាចារ្យ & គ្រូបណ្តុះបណ្តាលជំនាញ' : 'Experienced Faculty'}
              </h4>
              <p className="home-why-card-desc">
                {isKhmer
                  ? 'គ្រូបណ្តុះបណ្តាលមានបទពិសោធន៍វិជ្ជាជីវៈច្បាស់លាស់ ទទួលបានការបណ្តុះបណ្តាលទាំងក្នុងនិងក្រៅប្រទេស។'
                  : 'Certified instructors with extensive field experience and modern pedagogical training.'}
              </p>
            </div>

            {/* Card 3: Job Placement */}
            <div className="home-why-card">
              <div className="home-why-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Briefcase size={26} />
              </div>
              <h4 className="home-why-card-title">
                {isKhmer ? 'ឱកាសការងារ ៩៥%+ ខ្ពស់' : 'High Job Placement Rate'}
              </h4>
              <p className="home-why-card-desc">
                {isKhmer
                  ? 'កិច្ចសហប្រតិបត្តិការជាមួយសហគ្រាស និងក្រុមហ៊ុនដៃគូរាប់រយ ជួយផ្តល់កម្មសិក្សា និងការងារភ្លាមៗក្រោយបញ្ចប់។'
                  : 'Strong corporate partnerships offering internships and direct recruitment opportunities.'}
              </p>
            </div>

            {/* Card 4: Scholarship & Free Training */}
            <div className="home-why-card">
              <div className="home-why-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
                <ShieldCheck size={26} />
              </div>
              <h4 className="home-why-card-title">
                {isKhmer ? 'អាហារូបករណ៍ ១០០% & ឧបត្ថម្ភ' : 'Scholarships & Stipends'}
              </h4>
              <p className="home-why-card-desc">
                {isKhmer
                  ? 'វគ្គសិក្សាអាហារូបករណ៍ ១០០% របស់រាជរដ្ឋាភិបាល (TVET 1.5M) រៀនដោយឥតគិតថ្លៃ ព្រមទាំងទទួលបានប្រាក់ឧបត្ថម្ភប្រចាំខែ។'
                  : 'Free tuition and monthly stipends under the National TVET 1.5M training framework.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Promotional Videos & Media Showcase */}
      <section className="modern-video-showcase-area" id="promotional-videos-section">
        <div className="container">
          <div className="video-section-header">
            <span className="video-section-badge">
              <i className="fas fa-play-circle"></i> {isKhmer ? 'វីដេអូ & សកម្មភាពថ្មីៗ' : 'Videos & Media'}
            </span>
            <h2 className="video-section-title">
              {isKhmer ? 'វីដេអូផ្សព្វផ្សាយ និងសកម្មភាពបណ្តុះបណ្តាល' : 'Promotional Videos & Activities'}
            </h2>
            <p className="video-section-desc">
              {isKhmer
                ? 'ទស្សនាទិដ្ឋភាពទូទៅ បរិយាកាសសិក្សា និងសកម្មភាពអនុវត្តជំនាញជាក់ស្តែងរបស់និស្សិតនៃវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                : 'Explore campus life, modern workshops, and real-world technical skill training at RPITSSR'}
            </p>
          </div>

          <div className="row g-4 align-items-stretch">
            {/* Main Featured Video (Left Column) */}
            <div className="col-lg-7">
              {videos[0] && (
                <YouTubeVideoCard video={videos[0]} featured={true} />
              )}
            </div>

            {/* Compact Video Playlist (Right Column) */}
            <div className="col-lg-5">
              <div className="compact-video-list">
                {videos.slice(1, 4).map((vid) => (
                  <YouTubeVideoCard key={vid.id || vid.youtubeId} video={vid} featured={false} />
                ))}
              </div>
            </div>
          </div>

          {/* Expanded Video Grid (Remaining Videos) */}
          {showAllVideos && videos.length > 4 && (
            <div className="expanded-videos-grid">
              <div className="row g-4">
                {videos.slice(4).map((vid) => (
                  <div key={vid.id || vid.youtubeId} className="col-lg-4 col-md-6 col-12">
                    <YouTubeVideoCard video={vid} variant="grid" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show More / Show Less Toggle Button */}
          {videos.length > 4 && (
            <div className="video-show-more-wrap">
              <button
                type="button"
                className="video-toggle-btn"
                onClick={() => {
                  if (showAllVideos) {
                    const sectionEl = document.getElementById('promotional-videos-section');
                    if (sectionEl) {
                      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                  setShowAllVideos(!showAllVideos);
                }}
              >
                <span>
                  {showAllVideos
                    ? (isKhmer ? 'បង្រួមវីដេអូវិញ' : 'Show Less')
                    : (isKhmer ? '🎬 មើលវីដេអូផ្សព្វផ្សាយបន្ថែមទៀត' : '🎬 Show More Promotional Videos')}
                </span>
                <span className="toggle-count-badge">
                  {showAllVideos
                    ? (isKhmer ? '↑ បង្រួម' : '↑ Less')
                    : `+${videos.length - 4} ${isKhmer ? 'វីដេអូ' : 'Videos'}`}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 6. Upcoming Events Area */}
      <section className="event-area modern-event-area">
        <div className="container">
          {/* Section Header */}
          <div className="event-section-header text-center">
            <span className="event-section-badge">
              <i className="fas fa-calendar-alt"></i> ព្រឹត្តិការណ៍ & កម្មវិធីសំខាន់ៗ
            </span>
            <h2 className="event-main-title">
              {t('home.upcomingEventsTitle') || 'ព្រឹត្តិការណ៍ និងកម្មវិធីនាពេលខាងមុខ'}
            </h2>
            <p className="event-section-desc">
              ចូលរួមសិក្ខាសាលា ពិព័រណ៍ស្នាដៃបច្ចេកវិទ្យា និងវគ្គបណ្តុះបណ្តាលជំនាញជាក់ស្តែង ដើម្បីពង្រីកចំណេះដឹង និងឱកាសការងារជាមួយ RPITSSR
            </p>

            {/* Category Tabs */}
            <div className="modern-event-tabs-wrapper">
              <ul className="modern-event-nav">
                <li>
                  <button
                    type="button"
                    className={`modern-event-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    <i className="fas fa-th-large"></i>
                    <span>ទាំងអស់</span>
                    <span className="cat-count-pill">{events.length}</span>
                  </button>
                </li>
                {categories.slice(0, 5).map((cat) => {
                  const catCount = events.filter(
                    (ev) => String(ev.category_id) === String(cat.id) || String(ev.category) === String(cat.id)
                  ).length;
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className={`modern-event-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(cat.id)}
                      >
                        <span>{cat.name}</span>
                        {catCount > 0 && <span className="cat-count-pill">{catCount}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Events Grid */}
          <div className="event-grid-container mt-40">
            <div className="row g-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, s) => (
                  <div key={s} className="col-xl-3 col-lg-6 col-md-6">
                    <div className="modern-event-skeleton">
                      <div className="skeleton-img"></div>
                      <div className="skeleton-body">
                        <div className="skeleton-line short"></div>
                        <div className="skeleton-line title"></div>
                        <div className="skeleton-line medium"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : displayedEvents.length > 0 ? (
                displayedEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="col-xl-3 col-lg-6 col-md-6 d-flex">
                    <EventCard event={event} />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <div className="modern-no-events-card">
                    <div className="no-events-icon-wrap">
                      <i className="fas fa-calendar-day"></i>
                    </div>
                    <h4>មិនទាន់មានព្រឹត្តិការណ៍ក្នុងផ្នែកនេះនៅឡើយទេ</h4>
                    <p>សូមរង់ចាំតាមដានកម្មវិធីថ្មីៗ ឬត្រឡប់ទៅមើលព្រឹត្តិការណ៍ទាំងអស់</p>
                    <button
                      type="button"
                      className="btn-back-all-events"
                      onClick={() => setActiveTab('all')}
                    >
                      <i className="fas fa-arrow-left me-1"></i> មើលព្រឹត្តិការណ៍ទាំងអស់
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Footer: View All Events Button */}
          <div className="event-section-footer text-center mt-45">
            <Link to="/events" className="modern-view-all-events-btn" onClick={scrollToTop}>
              <span>{t('home.viewMore') || 'មើលព្រឹត្តិការណ៍ទាំងអស់'}</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Latest News / Blog Area - Matches rpitssr.edu.kh chunk 605 1:1 */}
      <section className="blog-area modern-blog">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="section-title-2 text-center">
                <h2 className="title">{t('home.latestNews')}</h2>
                <span className="line"></span>
                <p>{t('home.latestNewsDescription')}</p>
              </div>
            </div>
          </div>

          <div className="blog-wrapper">
            <div className="row blog-cards-row">
              {loading ? (
                Array.from({ length: 3 }).map((_, s) => (
                  <div key={s} className="col-lg-4 col-md-6 blog-card-col">
                    <div className="modern-blog-card text-center py-5">
                      <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                    </div>
                  </div>
                ))
              ) : (
                posts.slice(0, 3).map((post, s) => (
                  <div key={post.id} className="col-lg-4 col-md-6 blog-card-col">
                    <BlogCard post={post} featured={s === 0} />
                  </div>
                ))
              )}
            </div>

            {posts.length > 3 && (
              <div className="row mt-4">
                <div className="col-12 text-center">
                  <Link
                    to="/blog"
                    className="view-all-blogs-btn"
                    onClick={scrollToTop}
                  >
                    {t('home.viewAllNews')}
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ height: '50px' }}></div>
      </section>
    </div>
  );
};
