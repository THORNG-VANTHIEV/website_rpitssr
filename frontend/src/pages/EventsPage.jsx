import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

// Rich fallback sample events if API is empty
const SAMPLE_EVENTS = [
  {
    id: 1,
    titleKm: 'ពិធីបើកវគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស (TVET 1.5M) ជំនាន់ថ្មី',
    titleEn: 'Opening Ceremony of the National 1.5M TVET Vocational Training Cohort',
    title: 'ពិធីបើកវគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស (TVET 1.5M) ជំនាន់ថ្មី',
    date: '2026-09-28',
    time: '08:00 ព្រឹក - 11:30 ព្រឹក',
    place: 'សាលសន្និសីទធំ វិទ្យាស្ថាន RPITSSR (អាគារ A)',
    category_id: 1,
    category: { id: 1, name: 'កម្មវិធី TVET', slug: 'tvet-training' },
    imageUrl: '/images/gallery/school.jpg',
    description: 'ពិធីបើកបវេសនកាល និងការតម្រង់ទិសសិស្សនិស្សិតថ្មីសម្រាប់វគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស ១.៥ លាននាក់របស់រាជរដ្ឋាភិបាល ដោយឥតគិតថ្លៃ ព្រមទាំងទទួលបានប្រាក់ឧបត្ថម្ភ។',
    overview: 'កម្មវិធីបើកបវេសនកាលផ្លូវការក្រោមអធិបតីភាពគណៈគ្រប់គ្រងវិទ្យាស្ថាន ព្រមទាំងតំណាងមន្ទីរការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈខេត្តសៀមរាប។',
    speakers: 'លោកនាយកវិទ្យាស្ថាន RPITSSR, ប្រធានដេប៉ាតឺម៉ង់បណ្តុះបណ្តាលវិជ្ជាជីវៈ',
    schedule: '08:00 AM: ទទួលបដិសណ្ឋារកិច្ច | 08:30 AM: មតិស្វាគមន៍ និងរបាយការណ៍សង្ខេប | 09:30 AM: ការតម្រង់ទិសមុខជំនាញ | 11:00 AM: ទស្សនកិច្ចបន្ទប់អនុវត្តផ្ទាល់',
    fee: 'ឥតគិតថ្លៃ (Free)'
  },
  {
    id: 2,
    titleKm: 'សិក្ខាសាលាជំនាញឌីជីថល និងបញ្ញាសិប្បនិម្មិត ICT & AI Innovation 2026',
    titleEn: 'Digital Skills & Artificial Intelligence Workshop: ICT & AI Innovation 2026',
    title: 'សិក្ខាសាលាជំនាញឌីជីថល និងបញ្ញាសិប្បនិម្មិត ICT & AI Innovation 2026',
    date: '2026-10-08',
    time: '08:30 ព្រឹក - 12:00 ថ្ងៃត្រង់',
    place: 'មជ្ឈមណ្ឌលព័ត៌មានវិទ្យា ICT Lab (អាគារ B)',
    category_id: 2,
    category: { id: 2, name: 'សិក្ខាសាលា ICT & AI', slug: 'ict-technology' },
    imageUrl: '/images/courses/Course 10.jpg',
    description: 'ស្វែងយល់ពីបច្ចេកវិទ្យាថ្មីៗ ការអភិវឌ្ឍ Software ប្រព័ន្ធបណ្តាញ Network សុវត្ថិភាព Cyber Security និងការអនុវត្តជាក់ស្តែងនៃ Artificial Intelligence (AI) ក្នុងទីផ្សារការងារឌីជីថល។',
    overview: 'រៀបចំដោយដេប៉ាតឺម៉ង់ព័ត៌មានវិទ្យា (ICT) នៃវិទ្យាស្ថាន RPITSSR សហការជាមួយក្រុមហ៊ុនបច្ចេកវិទ្យាឈានមុខគេ។',
    speakers: 'អ្នកជំនាញផ្នែក IT & Cloud Computing, សាស្ត្រាចារ្យព័ត៌មានវិទ្យា RPITSSR',
    schedule: '08:30 AM: បើកកម្មវិធី | 09:00 AM: បទបង្ហាញស្តីពី AI & Cloud Architecture | 10:30 AM: ការអនុវត្តផ្ទាល់ Workshop | 11:30 AM: សំណួរ & ចម្លើយ Q&A',
    fee: 'ឥតគិតថ្លៃ (Free)'
  },
  {
    id: 3,
    titleKm: 'ទិវាពិព័រណ៍ស្នាដៃបច្ចេកវិទ្យា និងឱកាសការងារ (RPITSSR Tech Expo & Career Fair 2026)',
    titleEn: 'Annual Tech Expo & Career Fair 2026: Student Inventions & Job Matching',
    title: 'ទិវាពិព័រណ៍ស្នាដៃបច្ចេកវិទ្យា និងឱកាសការងារ (RPITSSR Tech Expo & Career Fair 2026)',
    date: '2026-10-18',
    time: '08:00 ព្រឹក - 05:00 ល្ងាច',
    place: 'ទីធ្លាធំ និងសាលពិព័រណ៍ពហុបច្ចេកទេស RPITSSR',
    category_id: 3,
    category: { id: 3, name: 'ពិព័រណ៍ស្នាដៃ & ការងារ', slug: 'job-fair-expo' },
    imageUrl: '/images/gallery/gallery 2.jpg',
    description: 'ទស្សនាការតាំងពិព័រណ៍ស្នាដៃច្នៃប្រឌិត និងគម្រោងបច្ចេកទេសរបស់និស្សិត ព្រមទាំងឱកាសសម្ភាសន៍ការងារផ្ទាល់ជាមួយក្រុមហ៊ុន និងសហគ្រាសដៃគូជាង ២០ នៅក្នុងខេត្តសៀមរាប។',
    overview: 'ព្រឹត្តិការណ៍ប្រចាំឆ្នាំដ៏ធំបំផុតរបស់វិទ្យាស្ថាន ដើម្បីផ្សារភ្ជាប់និស្សិតបញ្ចប់ការសិក្សាទៅកាន់ទីផ្សារការងារ និងសហគ្រាសដៃគូ។',
    speakers: 'តំណាងក្រុមហ៊ុនដៃគូ, គណៈគ្រប់គ្រងវិទ្យាស្ថាន, និស្សិតឆ្នើមម្ចាស់ស្នាដៃ',
    schedule: '08:00 AM: បើកពិព័រណ៍ស្នាដៃ | 09:00 AM: ទស្សនាស្តង់សហគ្រាស និងគម្រោងនិស្សិត | 01:30 PM: ការសម្ភាសន៍ជ្រើសរើសបុគ្គលិកផ្ទាល់ | 04:30 PM: ពិធីប្រគល់រង្វាន់ស្នាដៃឆ្នើម',
    fee: 'ឥតគិតថ្លៃ (Free)'
  },
  {
    id: 4,
    titleKm: 'សិក្ខាសាលាតម្រង់ទិស និងការចុះឈ្មោះអាហារូបករណ៍ ១០០% សម្រាប់ឆ្នាំសិក្សាថ្មី',
    titleEn: 'Academic Orientation & 100% Scholarship Registration Seminar',
    title: 'សិក្ខាសាលាតម្រង់ទិស និងការចុះឈ្មោះអាហារូបករណ៍ ១០០% សម្រាប់ឆ្នាំសិក្សាថ្មី',
    date: '2026-10-25',
    time: '08:00 ព្រឹក - 11:00 ព្រឹក',
    place: 'សាលប្រជុំធំ និងការិយាល័យសិក្សាធិការ RPITSSR',
    category_id: 4,
    category: { id: 4, name: 'កម្មវិធីសាលា & សិក្សាធិការ', slug: 'academic-events' },
    imageUrl: '/images/gallery/gallery 3.jpg',
    description: 'ផ្តល់ការប្រឹក្សាយោបល់អំពីជម្រើសមុខជំនាញ កម្រិតបរិញ្ញាបត្របច្ចេកវិទ្យា និងសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស ព្រមទាំងការណែនាំនីតិវិធីដាក់ពាក្យស្នើសុំអាហារូបករណ៍ ១០០%។',
    overview: 'កម្មវិធីពិសេសសម្រាប់សិស្សានុសិស្សដែលបានប្រឡងចប់មធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប) និងអ្នកមានបំណងរៀនជំនាញបច្ចេកទេសពិតប្រាកដ។',
    speakers: 'ប្រធានការិយាល័យសិក្សាធិការ, ទីប្រឹក្សាអាជីព TVET',
    schedule: '08:00 AM: ចុះឈ្មោះចូលរួម | 08:30 AM: បទបង្ហាញអំពីមុខជំនាញនីមួយៗ | 09:45 AM: ការប្រឹក្សាផ្ទាល់ខ្លួន | 10:30 AM: ទទួលពាក្យចុះឈ្មោះសិក្សា',
    fee: 'ឥតគិតថ្លៃ (Free)'
  }
];

// Khmer numerals conversion helper
const toKhmerNumber = (num) => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num.toString().split('').map(char => khmerDigits[char] || char).join('');
};

// Date parser for 2-part calendar badge
const parseDateBadge = (dateStr, isKhmer) => {
  if (!dateStr) return { day: '--', month: 'TBD', year: '' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: '--', month: 'TBD', year: '' };

    const khmerMonths = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    const enMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const dayNum = d.getDate();
    const dayFormatted = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dayDisplay = isKhmer ? toKhmerNumber(dayFormatted) : dayFormatted;
    const monthDisplay = isKhmer ? khmerMonths[d.getMonth()] : enMonths[d.getMonth()];
    const yearDisplay = isKhmer ? toKhmerNumber(d.getFullYear()) : d.getFullYear();

    return {
      day: dayDisplay,
      month: monthDisplay,
      year: yearDisplay,
      fullDateKh: `${toKhmerNumber(dayNum)} ${khmerMonths[d.getMonth()]} ${toKhmerNumber(d.getFullYear())}`
    };
  } catch {
    return { day: '--', month: 'TBD', year: '' };
  }
};

// Soft pastel category badge resolver
const getCategoryBadgeStyle = (slugOrId) => {
  switch (slugOrId) {
    case 'tvet-training':
    case 1:
      return { background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' };
    case 'ict-technology':
    case 2:
      return { background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' };
    case 'job-fair-expo':
    case 3:
      return { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' };
    case 'academic-events':
    case 4:
      return { background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' };
    default:
      return { background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' };
  }
};

export const EventsPage = () => {
  const { t, language, currentLanguage } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const itemsPerPage = 8;

  // Set document title
  useEffect(() => {
    document.title = isKhmer
      ? 'ព្រឹត្តិការណ៍ និងសិក្ខាសាលា | RPITSSR'
      : 'Events & Academic Workshops | RPITSSR';
  }, [isKhmer]);

  // Fetch events and categories from API
  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch events
        const resEvents = await client.get('/events');
        const eventData = Array.isArray(resEvents.data) ? resEvents.data : (resEvents.data?.data || []);

        if (isMounted) {
          if (eventData && eventData.length > 0) {
            setEvents(eventData);
          } else {
            setEvents(SAMPLE_EVENTS);
          }
        }

        // Fetch categories
        try {
          const resCats = await client.get('/event-categories');
          const catData = Array.isArray(resCats.data) ? resCats.data : (resCats.data?.data || []);
          if (isMounted && catData && catData.length > 0) {
            setCategories(catData);
          }
        } catch {
          // fallback default categories
        }
      } catch (err) {
        console.error('Failed to load events:', err);
        if (isMounted) {
          setEvents(SAMPLE_EVENTS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Default institutional categories if backend categories empty
  const allCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return [
        { id: 'all', name: isKhmer ? 'ទាំងអស់' : 'All Events', slug: 'all', icon: 'fas fa-th-large' },
        ...categories.map(c => ({
          ...c,
          icon: c.slug === 'tvet-training' ? 'fas fa-user-graduate' :
                c.slug === 'ict-technology' ? 'fas fa-laptop-code' :
                c.slug === 'job-fair-expo' ? 'fas fa-briefcase' : 'fas fa-calendar-check'
        }))
      ];
    }
    return [
      { id: 'all', name: isKhmer ? 'ទាំងអស់' : 'All Events', slug: 'all', icon: 'fas fa-th-large' },
      { id: 1, name: isKhmer ? 'កម្មវិធី TVET' : 'TVET Programs', slug: 'tvet-training', icon: 'fas fa-user-graduate' },
      { id: 2, name: isKhmer ? 'សិក្ខាសាលា ICT & AI' : 'ICT & AI Workshops', slug: 'ict-technology', icon: 'fas fa-laptop-code' },
      { id: 3, name: isKhmer ? 'ពិព័រណ៍ស្នាដៃ & ការងារ' : 'Tech Expo & Job Fairs', slug: 'job-fair-expo', icon: 'fas fa-briefcase' },
      { id: 4, name: isKhmer ? 'កម្មវិធីសាលា & សិក្សាធិការ' : 'Academic Events', slug: 'academic-events', icon: 'fas fa-calendar-check' }
    ];
  }, [categories, isKhmer]);

  // Filter events by category and search
  const filteredEvents = useMemo(() => {
    return events.filter(item => {
      // Category match
      let matchCat = selectedCategory === 'all';
      if (!matchCat) {
        if (item.category_id && String(item.category_id) === String(selectedCategory)) {
          matchCat = true;
        } else if (item.category && (String(item.category.id) === String(selectedCategory) || item.category.slug === selectedCategory)) {
          matchCat = true;
        }
      }

      // Query match
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCat;

      const titleMatch = (item.title || item.titleKm || item.titleEn || '').toLowerCase().includes(query);
      const placeMatch = (item.place || '').toLowerCase().includes(query);
      const descMatch = (item.description || item.overview || '').toLowerCase().includes(query);
      const speakerMatch = (item.speakers || '').toLowerCase().includes(query);

      return matchCat && (titleMatch || placeMatch || descMatch || speakerMatch);
    });
  }, [events, selectedCategory, searchQuery]);

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: events.length };
    allCategories.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = events.filter(e => {
          if (e.category_id && String(e.category_id) === String(cat.id)) return true;
          if (e.category && (String(e.category.id) === String(cat.id) || e.category.slug === cat.slug)) return true;
          return false;
        }).length;
      }
    });
    return counts;
  }, [events, allCategories]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Modal open / close handlers
  const openModal = (event) => {
    setSelectedEvent(event);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedEvent(null);
    document.body.style.overflow = 'auto';
  };

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedEvent) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEvent]);

  // Clean image url helper
  const cleanImg = (url) => {
    if (!url) return '/images/gallery/school.jpg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/') || url.startsWith('/storage/') || url.startsWith('/images/')) return url;
    return `/${url}`;
  };

  // Resolve category name
  const getCategoryName = (item) => {
    if (item.category && item.category.name) return item.category.name;
    const found = allCategories.find(c => String(c.id) === String(item.category_id));
    if (found) return found.name;
    return isKhmer ? 'ព្រឹត្តិការណ៍' : 'Event';
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* 1. INSTITUTIONAL HERO SECTION (AGENTS.md Daylight Format) */}
      <section className="events-page-hero">
        <div className="container" style={{ maxWidth: '1140px' }}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb & Official Badge */}
              <div className="events-hero-meta-row">
                <div className="events-breadcrumb">
                  <Link to="/">
                    <i className="fas fa-home me-1"></i>
                    {isKhmer ? 'ទំព័រដើម' : 'Home'}
                  </Link>
                  <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.72rem' }}></i>
                  <span>{t('events.title') || (isKhmer ? 'ព្រឹត្តិការណ៍' : 'Events')}</span>
                </div>
                <div className="events-hero-badge">
                  <i className="fas fa-calendar-star text-primary"></i>
                  <span>{isKhmer ? 'មជ្ឈមណ្ឌលព្រឹត្តិការណ៍ និងសិក្ខាសាលាស្ថាប័ន' : 'Institute Events & Academic Workshops'}</span>
                </div>
              </div>

              {/* Main Institutional Title */}
              <h1 className="events-hero-title">
                {isKhmer
                  ? 'ព្រឹត្តិការណ៍ និងសិក្ខាសាលាស្ថាប័ន'
                  : 'Institute Events & Academic Workshops'}
              </h1>

              {/* Subtitle */}
              <p className="events-hero-subtitle">
                {isKhmer
                  ? 'តាមដានកម្មវិធីសិក្ខាសាលាបច្ចេកវិទ្យា ទិវាជាតិ TVET ពិព័រណ៍ស្នាដៃនិស្សិត វេទិកាការងារ និងកម្មវិធីបណ្តុះបណ្តាលនានារបស់វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប។'
                  : 'Discover upcoming technology workshops, national TVET day exhibitions, student project showcases, career fairs, and academic milestones at RPITSSR.'}
              </p>

              {/* Institutional Trust Badges */}
              <div className="events-trust-pills">
                <div className="events-trust-pill">
                  <i className="fas fa-check-circle text-success"></i>
                  <span>{isKhmer ? 'ចូលរួមដោយឥតគិតថ្លៃ' : '100% Free Entry'}</span>
                </div>
                <div className="events-trust-pill">
                  <i className="fas fa-certificate text-warning"></i>
                  <span>{isKhmer ? 'ទទួលបានវិញ្ញាបនបត្របញ្ជាក់' : 'Official Certificates'}</span>
                </div>
                <div className="events-trust-pill">
                  <i className="fas fa-building-columns text-primary"></i>
                  <span>{isKhmer ? 'ទីតាំងជាក់ស្តែងនៅវិទ្យាស្ថាន' : 'On-Campus Workshops'}</span>
                </div>
                <div className="events-trust-pill">
                  <i className="fas fa-handshake text-info"></i>
                  <span>{isKhmer ? 'ជួបផ្ទាល់ជាមួយក្រុមហ៊ុនដៃគូ' : 'Direct Industry Networking'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INSTITUTIONAL METRICS STRIP */}
      <section className="events-metrics-area">
        <div className="container" style={{ maxWidth: '1140px' }}>
          <div className="events-metrics-grid">
            <div className="events-metric-card">
              <div className="events-metric-icon" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <i className="fas fa-calendar-days"></i>
              </div>
              <div className="events-metric-info">
                <span className="events-metric-val">
                  {isKhmer ? `${toKhmerNumber(events.length)}+ ព្រឹត្តិការណ៍` : `${events.length}+ Events`}
                </span>
                <span className="events-metric-lbl">
                  {isKhmer ? 'កម្មវិធីបណ្តុះបណ្តាល និងសិក្ខាសាលា' : 'Workshops & Exhibitions'}
                </span>
              </div>
            </div>

            <div className="events-metric-card">
              <div className="events-metric-icon" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <i className="fas fa-layer-group"></i>
              </div>
              <div className="events-metric-info">
                <span className="events-metric-val">
                  {isKhmer ? '០៤ ប្រភេទកម្មវិធី' : '4 Event Tracks'}
                </span>
                <span className="events-metric-lbl">
                  {isKhmer ? 'TVET, ICT, ពិព័រណ៍ & ការងារ' : 'TVET, Tech & Job Fairs'}
                </span>
              </div>
            </div>

            <div className="events-metric-card">
              <div className="events-metric-icon" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <i className="fas fa-users"></i>
              </div>
              <div className="events-metric-info">
                <span className="events-metric-val">
                  {isKhmer ? '១,៥០០+ នាក់' : '1,500+ Attendees'}
                </span>
                <span className="events-metric-lbl">
                  {isKhmer ? 'សិស្ស និស្សិត និងសាធារណជន' : 'Students & Public Community'}
                </span>
              </div>
            </div>

            <div className="events-metric-card">
              <div className="events-metric-icon" style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>
                <i className="fas fa-award"></i>
              </div>
              <div className="events-metric-info">
                <span className="events-metric-val">
                  {isKhmer ? '១០០% ឥតគិតថ្លៃ' : '100% Free Access'}
                </span>
                <span className="events-metric-lbl">
                  {isKhmer ? 'ការចុះឈ្មោះ និងចូលរួម' : 'Free Registration & Entry'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN EVENTS GRID & FILTER */}
      <section style={{ background: '#f8fafc', padding: '50px 0 90px', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1180px' }}>

          {/* Filter Card & Live Search */}
          <div className="events-filter-card">
            {/* Search Input */}
            <div className="events-search-wrapper">
              <i className="fas fa-search events-search-icon"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isKhmer ? 'ស្វែងរកព្រឹត្តិការណ៍តាមចំណងជើង ទីតាំង ឬវាគ្មិន...' : 'Search events by title, venue, or speaker...'}
                className="events-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="events-search-clear"
                  title={isKhmer ? 'លុបពាក្យស្វែងរក' : 'Clear Search'}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="events-category-pills">
              {allCategories.map((cat) => {
                const isSelected = String(selectedCategory) === String(cat.id);
                const count = categoryCounts[cat.id] || 0;
                const countFormatted = isKhmer ? toKhmerNumber(count) : count;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    className={`events-cat-pill ${isSelected ? 'active' : ''}`}
                  >
                    <i className={cat.icon} style={{ fontSize: '13px' }}></i>
                    <span>{cat.name}</span>
                    <span className="events-cat-count">
                      {countFormatted}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions Bar (Counter) */}
          <div className="events-actions-bar">
            <div className="events-results-counter">
              <i className="fas fa-calendar-check text-primary"></i>
              <span>
                {isKhmer
                  ? `បង្ហាញ ${toKhmerNumber(filteredEvents.length)} នៃ ${toKhmerNumber(events.length)} ព្រឹត្តិការណ៍`
                  : `Showing ${filteredEvents.length} of ${events.length} events`}
              </span>
              {searchQuery && (
                <span style={{ color: '#1e73be', fontWeight: 700 }}>
                  ({isKhmer ? `ពាក្យគន្លឹះ: "${searchQuery}"` : `Keyword: "${searchQuery}"`})
                </span>
              )}
            </div>
          </div>

          {/* Events Grid */}
          <div className="row g-4">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div style={{
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #07294D',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 15px'
                }}></div>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  {t('common.loading') || (isKhmer ? 'កំពុងទាញយកទិន្នន័យព្រឹត្តិការណ៍...' : 'Loading Events...')}
                </p>
              </div>
            ) : currentEvents.length > 0 ? (
              currentEvents.map((item) => {
                const dateInfo = parseDateBadge(item.date, isKhmer);
                const badgeStyle = getCategoryBadgeStyle(item.category?.slug || item.category_id);
                const catName = getCategoryName(item);

                return (
                  <div key={item.id} className="col-xl-3 col-lg-6 col-md-6 d-flex">
                    <div className="inst-event-card w-100">
                      {/* Image Thumbnail Container */}
                      <div className="inst-event-thumb-wrap" onClick={() => openModal(item)} style={{ cursor: 'pointer' }}>
                        <img
                          src={cleanImg(item.imageUrl || item.image)}
                          alt={item.title || 'Event'}
                          className="inst-event-img"
                          loading="lazy"
                        />
                        <div className="inst-event-thumb-overlay"></div>

                        {/* Floating Category Tag */}
                        <span className="inst-event-cat-tag" style={badgeStyle}>
                          <i className="fas fa-tag" style={{ fontSize: '10px' }}></i>
                          <span>{catName}</span>
                        </span>

                        {/* Floating 2-Part Calendar Badge */}
                        <div className="inst-event-cal-badge">
                          <span className="inst-event-cal-month">{dateInfo.month}</span>
                          <span className="inst-event-cal-day">{dateInfo.day}</span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="inst-event-body">
                        {/* Time & Free Badges */}
                        <div className="inst-event-meta-row">
                          <span className="inst-event-meta-time">
                            <i className="far fa-clock text-primary"></i>
                            <span>{item.time || '08:00 AM'}</span>
                          </span>
                          <span className="inst-event-free-tag">
                            <i className="fas fa-check-circle"></i>
                            <span>{isKhmer ? 'ឥតគិតថ្លៃ' : 'Free'}</span>
                          </span>
                        </div>

                        {/* Event Title */}
                        <h4
                          className="inst-event-title"
                          onClick={() => openModal(item)}
                          title={item.title}
                        >
                          {item.title}
                        </h4>

                        {/* Location */}
                        <div className="inst-event-location">
                          <i className="fas fa-map-marker-alt text-danger mt-1"></i>
                          <span>{item.place || (isKhmer ? 'វិទ្យាស្ថាន RPITSSR' : 'RPITSSR Campus')}</span>
                        </div>

                        {/* Description Snippet */}
                        {item.description && (
                          <p className="inst-event-desc">
                            {item.description.length > 95 ? `${item.description.slice(0, 95)}...` : item.description}
                          </p>
                        )}

                        {/* Action Footer */}
                        <div className="inst-event-footer">
                          <button
                            type="button"
                            className="inst-event-detail-btn"
                            onClick={() => openModal(item)}
                          >
                            <i className="fas fa-circle-info text-primary"></i>
                            <span>{isKhmer ? 'មើលព័ត៌មានលម្អិត' : 'View Event Details'}</span>
                            <i className="fas fa-arrow-right" style={{ fontSize: '11px' }}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5">
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '50px 20px',
                    border: '1px dashed #cbd5e1',
                    boxShadow: '0 4px 18px rgba(7, 41, 77, 0.03)',
                    maxWidth: '560px',
                    margin: '0 auto'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px' }}>
                    <i className="fas fa-calendar-xmark"></i>
                  </div>
                  <h5 style={{ color: '#07294D', fontWeight: '800', marginBottom: '8px' }}>
                    {t('events.noEvents') || (isKhmer ? 'មិនមានព្រឹត្តិការណ៍ត្រូវនឹងការស្វែងរកឡើយ' : 'No Events Found')}
                  </h5>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
                    {t('events.checkBackLater') || (isKhmer ? 'សូមសាកល្បងស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង ឬជ្រើសរើសប្រភេទទាំងអស់។' : 'Please check back later or choose another category.')}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    style={{
                      background: '#07294D',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 22px',
                      borderRadius: '30px',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fas fa-redo-alt me-1"></i>
                    {isKhmer ? 'សម្អាតការស្វែងរក' : 'Reset Filters'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Institutional Pill Pagination */}
          {totalPages > 1 && (
            <div className="row mt-50">
              <div className="col-12">
                <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                  {/* Previous Button */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '30px',
                      padding: '8px 18px',
                      color: currentPage === 1 ? '#94a3b8' : '#07294D',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-chevron-left" style={{ fontSize: '11px' }}></i>
                    <span>{isKhmer ? 'មុន' : 'Prev'}</span>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = currentPage === pageNum;
                    const pageDisplay = isKhmer ? toKhmerNumber(pageNum) : pageNum;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          border: isActive ? 'none' : '1.5px solid #e2e8f0',
                          background: isActive ? 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)' : '#ffffff',
                          color: isActive ? '#ffffff' : '#475569',
                          fontWeight: '800',
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isActive ? '0 4px 14px rgba(7, 41, 77, 0.25)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {pageDisplay}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '30px',
                      padding: '8px 18px',
                      color: currentPage === totalPages ? '#94a3b8' : '#07294D',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{isKhmer ? 'បន្ទាប់' : 'Next'}</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Telegram Channel Alert Banner */}
          <div
            style={{
              marginTop: '60px',
              background: 'linear-gradient(135deg, #07294D 0%, #185ca1 100%)',
              borderRadius: '20px',
              padding: '36px 40px',
              boxShadow: '0 12px 35px rgba(7, 41, 77, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px'
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                <i className="fab fa-telegram-plane"></i> {isKhmer ? 'ឆានែល Telegram ផ្លូវការ' : 'Official Telegram Channel'}
              </div>
              <h3 style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.45rem', marginBottom: '8px', lineHeight: '1.4' }}>
                {isKhmer
                  ? 'ទទួលបានការជូនដំណឹងពីព្រឹត្តិការណ៍ និងសិក្ខាសាលាថ្មីៗមុនគេ'
                  : 'Stay Updated on Upcoming Workshops & Institutional Events'}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                {isKhmer
                  ? 'ចូលរួមជាមួយឆានែល Telegram ផ្លូវការរបស់វិទ្យាស្ថាន RPITSSR ដើម្បីទទួលបានព័ត៌មានលម្អិត កាលបរិច្ឆេទ និងការចុះឈ្មោះចូលរួមដោយឥតគិតថ្លៃ។'
                  : 'Join the official RPITSSR Telegram channel for instant notifications, workshop registration links, and event recaps.'}
              </p>
            </div>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <a
                href="https://t.me/rpitssr"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#07294D',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '14.5px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="fab fa-telegram-plane text-primary" style={{ fontSize: '16px' }}></i>
                <span>{isKhmer ? 'ចូលរួមឆានែល Telegram' : 'Join Telegram Channel'}</span>
              </a>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14.5px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="fas fa-phone-alt"></i>
                <span>{isKhmer ? 'ទំនាក់ទំនងរៀបចំ' : 'Event Inquiry'}</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. EVENT DETAIL MODAL (Daylight Institutional Lightbox) */}
      {selectedEvent && (
        <div className="event-modal-backdrop" onClick={closeModal}>
          <div className="event-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header Image with Floating Tag and Close Button */}
            <div className="event-modal-header-img">
              <img
                src={cleanImg(selectedEvent.imageUrl || selectedEvent.image)}
                alt={selectedEvent.title}
                className="event-modal-img"
              />
              <button
                type="button"
                className="event-modal-close-btn"
                onClick={closeModal}
                title={isKhmer ? 'បិទផ្ទាំង' : 'Close Modal'}
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="inst-event-thumb-overlay"></div>
              <span
                className="inst-event-cat-tag"
                style={{
                  ...getCategoryBadgeStyle(selectedEvent.category?.slug || selectedEvent.category_id),
                  bottom: '16px',
                  top: 'auto',
                  left: '20px'
                }}
              >
                <i className="fas fa-tag me-1"></i>
                <span>{getCategoryName(selectedEvent)}</span>
              </span>
            </div>

            {/* Modal Body Content */}
            <div className="event-modal-content">
              {/* Title */}
              <h2 style={{ color: '#07294D', fontWeight: '800', fontSize: '1.5rem', lineHeight: '1.4', marginBottom: '14px' }}>
                {selectedEvent.title}
              </h2>

              {/* Key Meta Grid */}
              <div className="event-modal-meta-grid">
                <div className="event-modal-meta-box">
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#1e73be', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    <i className="far fa-calendar-alt"></i>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>{isKhmer ? 'កាលបរិច្ឆេទ' : 'Date'}</small>
                    <strong style={{ color: '#07294D', fontSize: '0.92rem' }}>
                      {parseDateBadge(selectedEvent.date, isKhmer).fullDateKh || selectedEvent.date}
                    </strong>
                  </div>
                </div>

                <div className="event-modal-meta-box">
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#1e73be', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    <i className="far fa-clock"></i>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>{isKhmer ? 'ពេលវេលា' : 'Time'}</small>
                    <strong style={{ color: '#07294D', fontSize: '0.92rem' }}>
                      {selectedEvent.time || '08:00 AM'}
                    </strong>
                  </div>
                </div>

                <div className="event-modal-meta-box">
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>{isKhmer ? 'ទីកន្លែងប្រារព្ធ' : 'Venue / Hall'}</small>
                    <strong style={{ color: '#07294D', fontSize: '0.92rem' }}>
                      {selectedEvent.place || (isKhmer ? 'វិទ្យាស្ថាន RPITSSR' : 'RPITSSR Campus')}
                    </strong>
                  </div>
                </div>

                <div className="event-modal-meta-box">
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    <i className="fas fa-ticket"></i>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>{isKhmer ? 'តម្លៃចូលរួម' : 'Admission'}</small>
                    <strong style={{ color: '#059669', fontSize: '0.92rem' }}>
                      {selectedEvent.fee || (isKhmer ? 'ឥតគិតថ្លៃ (Free Entry)' : 'Free Entry')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Description & Overview */}
              <div style={{ marginTop: '20px' }}>
                <h4 className="event-modal-section-title">
                  <i className="fas fa-align-left text-primary"></i>
                  <span>{isKhmer ? 'ទិដ្ឋភាពទូទៅនៃកម្មវិធី' : 'Event Overview & Objectives'}</span>
                </h4>
                <p style={{ color: '#334155', fontSize: '0.98rem', lineHeight: '1.9', margin: '0 0 14px' }}>
                  {selectedEvent.overview || selectedEvent.description}
                </p>
                {selectedEvent.overview && selectedEvent.description && selectedEvent.overview !== selectedEvent.description && (
                  <p style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: '1.8' }}>
                    {selectedEvent.description}
                  </p>
                )}
              </div>

              {/* Speakers Section if available */}
              {selectedEvent.speakers && (
                <div style={{ marginTop: '20px' }}>
                  <h4 className="event-modal-section-title">
                    <i className="fas fa-microphone-lines text-warning"></i>
                    <span>{isKhmer ? 'វាគ្មិន និងគណៈអធិបតី' : 'Speakers & Guests of Honor'}</span>
                  </h4>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', color: '#07294D', fontWeight: '600', fontSize: '0.94rem' }}>
                    {selectedEvent.speakers}
                  </div>
                </div>
              )}

              {/* Schedule Section if available */}
              {selectedEvent.schedule && (
                <div style={{ marginTop: '20px' }}>
                  <h4 className="event-modal-section-title">
                    <i className="fas fa-timeline text-info"></i>
                    <span>{isKhmer ? 'កាលវិភាគលម្អិត' : 'Event Schedule'}</span>
                  </h4>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', color: '#334155', fontSize: '0.92rem', lineHeight: '1.8' }}>
                    {selectedEvent.schedule}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: '30px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <a
                  href="https://t.me/rpitssr"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: '1 1 200px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                    color: '#ffffff',
                    padding: '13px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 15px rgba(7, 41, 77, 0.2)'
                  }}
                >
                  <i className="fab fa-telegram-plane"></i>
                  <span>{isKhmer ? 'ចុះឈ្មោះចូលរួមតាម Telegram' : 'Register via Telegram'}</span>
                </a>
                <Link
                  to="/contact"
                  onClick={closeModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#f1f5f9',
                    border: '1.5px solid #e2e8f0',
                    color: '#07294D',
                    padding: '13px 22px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    textDecoration: 'none'
                  }}
                >
                  <i className="fas fa-phone-alt"></i>
                  <span>{isKhmer ? 'ទំនាក់ទំនងសាកសួរ' : 'Event Contact Desk'}</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
