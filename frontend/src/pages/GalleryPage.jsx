import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';

// Category definitions following AGENTS.md institutional standards
const CATEGORIES = [
  { key: 'all', icon: 'fas fa-th-large', labelKm: 'ទាំងអស់', labelEn: 'All Photos' },
  { key: 'campus', icon: 'fas fa-university', labelKm: 'បរិវេណ & ហេដ្ឋារចនាសម្ព័ន្ធ', labelEn: 'Campus & Facilities' },
  { key: 'academic', icon: 'fas fa-microchip', labelKm: 'ការបណ្តុះបណ្តាល & រោងជាង', labelEn: 'Academic & Labs' },
  { key: 'events', icon: 'fas fa-award', labelKm: 'ព្រឹត្តិការណ៍ & សកម្មភាព', labelEn: 'Events & Activities' },
  { key: 'blog', icon: 'fas fa-newspaper', labelKm: 'រូបភាពព័ត៌មាន & ប្លុក', labelEn: 'News & Press Photos' }
];

// Fallback high-quality institutional dataset to guarantee rich viewing
const SAMPLE_GALLERY = [
  {
    id: 101,
    title: 'RPITSSR Main Academic Campus & Administration',
    description: 'អគារសិក្សាថ្មីកម្ពស់ ៥ ជាន់ បំពាក់ដោយបន្ទប់សិក្សាប្រព័ន្ធឌីជីថល បន្ទប់ពិសោធន៍ និងការិយាល័យរដ្ឋបាលទំនើប',
    imageUrl: '/images/gallery/school.jpg',
    category: 'campus',
    createdAt: '2026-09-12'
  },
  {
    id: 102,
    title: 'Faculty and Students Cohort Assembly',
    description: 'ទិដ្ឋភាពជួបជុំគណៈគ្រប់គ្រង លោកគ្រូ-អ្នកគ្រូ និងនិស្សិតជំនាន់ថ្មី នៃវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប',
    imageUrl: '/images/gallery/gallery 2.jpg',
    category: 'campus',
    createdAt: '2026-09-10'
  },
  {
    id: 103,
    title: 'Computer Science & Software Development Lab',
    description: 'បន្ទប់ពិសោធន៍កុំព្យូទ័រ និងអភិវឌ្ឍន៍កម្មវិធីកម្រិតខ្ពស់ បំពាក់ដោយប្រព័ន្ធអ៊ីនធឺណិតល្បឿនលឿន និងកម្មវិធីស្តង់ដារ',
    imageUrl: '/images/gallery/CS.jpg',
    category: 'academic',
    createdAt: '2026-09-08'
  },
  {
    id: 104,
    title: 'Electrical Automation & PLC Control Workshop',
    description: 'រោងជាងអនុវត្តជាក់ស្តែងផ្នែកអគ្គិសនីស្វ័យប្រវត្តិកម្ម និងការបញ្ជាប្រព័ន្ធម៉ូទ័រឧស្សាហកម្ម PLC',
    imageUrl: '/images/gallery/electricity.jpg',
    category: 'academic',
    createdAt: '2026-09-06'
  },
  {
    id: 105,
    title: 'Civil Construction & Architectural Design Studio',
    description: 'ការអនុវត្តវាស់វែង គូរប្លង់ស្ថាបត្យកម្ម និងតេស្តសម្ភារៈសំណង់ស៊ីវិលរបស់និស្សិតវិស្វកម្ម',
    imageUrl: '/images/gallery/civil engineering.jpg',
    category: 'academic',
    createdAt: '2026-09-04'
  },
  {
    id: 106,
    title: 'Air Conditioning & Refrigeration Technology',
    description: 'សិក្ខាសាលាអនុវត្តបច្ចេកវិទ្យាកំដៅ និងត្រជាក់ឧស្សាហកម្មទំនើប សន្សំសំចៃថាមពលអគ្គិសនី',
    imageUrl: '/images/gallery/ac.jpg',
    category: 'academic',
    createdAt: '2026-09-02'
  },
  {
    id: 107,
    title: 'Automotive Engine Diagnostics & Electronic Systems',
    description: 'ការត្រួតពិនិត្យប្រព័ន្ធអេឡិចត្រូនិក និងម៉ាស៊ីនរថយន្តទំនើបដោយប្រើឧបករណ៍ OBD-II Scanner',
    imageUrl: '/images/gallery/auto.jpg',
    category: 'academic',
    createdAt: '2026-08-30'
  },
  {
    id: 108,
    title: 'Student Graduation and Skills Exhibition Day',
    description: 'ពិធីប្រគល់សញ្ញាបត្រ និងការតាំងពិព័រណ៍ស្នាដៃគំរូ និងការស្រាវជ្រាវរបស់និស្សិតជ័យលាភី',
    imageUrl: '/images/gallery/events.jpg',
    category: 'events',
    createdAt: '2026-08-25'
  },
  {
    id: 109,
    title: 'Campus Sports & Cultural Festival',
    description: 'សកម្មភាពកីឡាបាល់ទាត់ មិត្តភាព និងការសម្តែងសិល្បៈវប្បធម៌បុរាណរបស់និស្សិត RPITSSR',
    imageUrl: '/images/gallery/sports.jpg',
    category: 'events',
    createdAt: '2026-08-20'
  }
];

// Khmer numeral conversion helper
const toKhmerNumber = (num) => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/[0-9]/g, (digit) => khmerDigits[parseInt(digit, 10)]);
};

// Helper for authentic Cambodian date formatting
const formatKhmerDate = (dateStr, isKhmer) => {
  if (!dateStr) return isKhmer ? 'ថ្មីៗ' : 'Recent';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return isKhmer ? 'ថ្មីៗ' : 'Recent';

  if (!isKhmer) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];

  const day = toKhmerNumber(d.getDate());
  const month = khmerMonths[d.getMonth()];
  const year = toKhmerNumber(d.getFullYear());
  return `${day} ${month} ${year}`;
};

// Soft pastel category badge resolver
const getGalleryBadgeStyle = (catKey) => {
  switch (catKey) {
    case 'campus':
      return { background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' };
    case 'academic':
      return { background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' };
    case 'events':
      return { background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' };
    case 'blog':
      return { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' };
    default:
      return { background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' };
  }
};

export const GalleryPage = () => {
  const { t, language, currentLanguage } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const itemsPerPage = 12;

  useEffect(() => {
    document.title = isKhmer
      ? 'វិចិត្រសាលរូបភាព និងសកម្មភាព | RPITSSR'
      : 'Photo Gallery & Activities | RPITSSR';
  }, [isKhmer]);

  const cleanImageUrl = (url, fallback = '/images/gallery/school.jpg') => {
    if (!url) return fallback;
    const clean = url.replace(/\\/g, '/');
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    if (clean.startsWith('/uploads/') || clean.startsWith('/storage/')) return clean;
    if (clean.startsWith('uploads/') || clean.startsWith('storage/')) return `/${clean}`;
    if (clean.startsWith('/images/')) return clean;
    if (clean.startsWith('images/')) return `/${clean}`;
    return clean;
  };

  // Fetch images from both Gallery API and Blog Posts API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        let galleryImgs = [];
        let blogImgs = [];

        // 1. Fetch official gallery images
        try {
          const res = await api.get('/gallery-images');
          const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          galleryImgs = data.map((item) => ({
            ...item,
            source: 'gallery',
            category: item.category || 'campus',
            imageUrl: cleanImageUrl(item.imageUrl || item.image_url),
            createdAt: item.createdAt || item.created_at || '2026-09-12'
          }));
        } catch (err) {
          console.warn('Could not fetch gallery-images, using sample fallbacks:', err);
        }

        // 2. Fetch blog post images
        try {
          const res = await api.get('/blog-posts?limit=100&status=published');
          const data = res.data;
          const posts = Array.isArray(data) ? data : (data?.data?.posts || data?.posts || []);

          posts.forEach((post) => {
            if (post.imageUrl || post.image_url) {
              blogImgs.push({
                id: `blog-featured-${post.id}`,
                title: post.title,
                description: post.excerpt || post.summary || '',
                imageUrl: cleanImageUrl(post.imageUrl || post.image_url),
                source: 'blog',
                category: 'blog',
                createdAt: post.publishedAt || post.createdAt
              });
            }
          });
        } catch (err) {
          console.warn('Could not fetch blog post images:', err);
        }

        // Combine API data or fallback to rich sample dataset
        let combined = [...galleryImgs, ...blogImgs];
        if (combined.length === 0) {
          combined = SAMPLE_GALLERY;
        } else if (combined.length < 6) {
          // Augment with rich samples if data is scarce
          const existingUrls = new Set(combined.map(c => c.imageUrl));
          const additions = SAMPLE_GALLERY.filter(s => !existingUrls.has(s.imageUrl));
          combined = [...combined, ...additions];
        }

        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (isMounted) {
          setImages(combined);
        }
      } catch (err) {
        console.error('Failed to load gallery images:', err);
        if (isMounted) setImages(SAMPLE_GALLERY);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Filtered & Searched Dataset
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchesCategory = activeCategory === 'all' || img.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (img.title && img.title.toLowerCase().includes(q)) ||
        (img.description && img.description.toLowerCase().includes(q))
      );
      return matchesCategory && matchesSearch;
    });
  }, [images, activeCategory, searchQuery]);

  // Counts for each category tab
  const categoryCounts = useMemo(() => {
    const counts = { all: images.length };
    CATEGORIES.forEach(cat => {
      if (cat.key !== 'all') {
        counts[cat.key] = images.filter(img => img.category === cat.key).length;
      }
    });
    return counts;
  }, [images]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentImages = filteredImages.slice(startIndex, startIndex + itemsPerPage);

  // Lightbox handlers
  const openModal = (img, indexInFiltered) => {
    setSelectedImage(img);
    setSelectedIndex(indexInFiltered);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const showPrev = useCallback(() => {
    if (selectedIndex > 0) {
      const prevIdx = selectedIndex - 1;
      setSelectedIndex(prevIdx);
      setSelectedImage(filteredImages[prevIdx]);
    }
  }, [selectedIndex, filteredImages]);

  const showNext = useCallback(() => {
    if (selectedIndex < filteredImages.length - 1) {
      const nextIdx = selectedIndex + 1;
      setSelectedIndex(nextIdx);
      setSelectedImage(filteredImages[nextIdx]);
    }
  }, [selectedIndex, filteredImages]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, showPrev, showNext]);

  const getCategoryLabel = (catKey) => {
    const found = CATEGORIES.find(c => c.key === catKey);
    if (!found) return isKhmer ? 'ទូទៅ' : 'General';
    return isKhmer ? found.labelKm : found.labelEn;
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* 1. INSTITUTIONAL HERO SECTION (AGENTS.md Daylight Format) */}
      <section className="gallery-page-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb & Official Badge */}
              <div className="gallery-hero-meta-row">
                <div className="gallery-breadcrumb">
                  <Link to="/">
                    <i className="fas fa-home me-1"></i>
                    {isKhmer ? 'ទំព័រដើម' : 'Home'}
                  </Link>
                  <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.72rem' }}></i>
                  <span>{t('gallery.title') || 'វិចិត្រសាល'}</span>
                </div>
                <div className="gallery-hero-badge">
                  <i className="fas fa-camera text-primary"></i>
                  <span>{isKhmer ? 'វិចិត្រសាលរូបភាព និងសកម្មភាពផ្លូវការ' : 'Official Institute Photo Gallery'}</span>
                </div>
              </div>

              {/* Main Institutional Title */}
              <h1 className="gallery-hero-title">
                {isKhmer
                  ? 'វិចិត្រសាលរូបភាព និងសកម្មភាពវិទ្យាស្ថាន'
                  : 'Institute Photo Gallery & Campus Activities'}
              </h1>

              {/* Subtitle */}
              <p className="gallery-hero-subtitle">
                {isKhmer
                  ? 'ទិដ្ឋភាពទូទៅនៃហេដ្ឋារចនាសម្ព័ន្ធ បន្ទប់ពិសោធន៍បច្ចេកវិទ្យា សិក្ខាសាលាអនុវត្តផ្ទាល់ និងសកម្មភាពបណ្តុះបណ្តាលរបស់និស្សិត និងសាស្ត្រាចារ្យនៃវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                  : 'Explore campus infrastructure, state-of-the-art technological laboratories, practical engineering workshops, and vibrant student activities at RPITSSR.'}
              </p>

              {/* Institutional Trust Badges */}
              <div className="gallery-trust-pills">
                <div className="gallery-trust-pill">
                  <i className="fas fa-shield-alt text-primary"></i>
                  <span>{isKhmer ? 'រូបភាពផ្លូវការស្ថាប័ន' : 'Official Campus Media'}</span>
                </div>
                <div className="gallery-trust-pill">
                  <i className="fas fa-microchip text-success"></i>
                  <span>{isKhmer ? 'បន្ទប់ពិសោធន៍ស្តង់ដារ TVET' : 'State-of-the-Art Labs'}</span>
                </div>
                <div className="gallery-trust-pill">
                  <i className="fas fa-graduation-cap text-warning"></i>
                  <span>{isKhmer ? 'សកម្មភាពនិស្សិត និងព្រឹត្តិការណ៍' : 'Student Life & Ceremonies'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED INSTITUTIONAL METRICS STRIP */}
      <section className="py-4" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div className="row g-3">
            <div className="col-6 col-lg-3">
              <div className="gallery-metric-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', color: '#1e73be' }}
                >
                  <i className="fas fa-images" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#07294D', fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {isKhmer ? `${toKhmerNumber(images.length)}+` : `${images.length}+`}
                  </div>
                  <div className="text-muted small fw-medium">
                    {isKhmer ? 'រូបភាពផ្លូវការសរុប' : 'Total Photos'}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="gallery-metric-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669' }}
                >
                  <i className="fas fa-university" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#07294D', fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {isKhmer ? 'អគារ ៥ ជាន់' : '5-Storey Campus'}
                  </div>
                  <div className="text-muted small fw-medium">
                    {isKhmer ? 'ហេដ្ឋារចនាសម្ព័ន្ធទំនើប' : 'Modern Facilities'}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="gallery-metric-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', color: '#7c3aed' }}
                >
                  <i className="fas fa-tools" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#07294D', fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {isKhmer ? '១០+ រោងជាង' : '10+ Workshops'}
                  </div>
                  <div className="text-muted small fw-medium">
                    {isKhmer ? 'បន្ទប់ពិសោធន៍បច្ចេកវិទ្យា' : 'Engineering Labs'}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="gallery-metric-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c' }}
                >
                  <i className="fas fa-users" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#07294D', fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {isKhmer ? '៣,៦០០+ នាក់' : '3,600+ Students'}
                  </div>
                  <div className="text-muted small fw-medium">
                    {isKhmer ? 'សកម្មភាពសិក្សាអនុវត្ត' : 'Active TVET Learners'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN GALLERY SECTION */}
      <section className="py-5">
        <div className="container">
          {/* Filter Bar & Search Input */}
          <div className="gallery-filter-bar">
            <div className="row g-3 align-items-center justify-content-between">
              {/* Category Filter Tabs */}
              <div className="col-xl-8 col-lg-7">
                <div className="d-flex align-items-center flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.key;
                    const count = categoryCounts[cat.key] || 0;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.key);
                          setCurrentPage(1);
                        }}
                        className={`gallery-tab-btn ${isActive ? 'active' : ''}`}
                      >
                        <i className={cat.icon}></i>
                        <span>{isKhmer ? cat.labelKm : cat.labelEn}</span>
                        <span className="gallery-tab-count">
                          {isKhmer
                            ? count.toString().split('').map(d => ['០','១','២','៣','៤','៥','៦','៧','៨','៩'][d] || d).join('')
                            : count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Search Box */}
              <div className="col-xl-4 col-lg-5">
                <div className="position-relative">
                  <i
                    className="fas fa-search position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: '16px', fontSize: '0.9rem' }}
                  ></i>
                  <input
                    type="text"
                    className="form-control rounded-pill ps-5 pe-4 py-2 border"
                    style={{ fontSize: '0.9rem', backgroundColor: '#f8fafc' }}
                    placeholder={isKhmer ? 'ស្វែងរករូបភាពតាមចំណងជើង...' : 'Search photos by title...'}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link position-absolute top-50 translate-middle-y end-0 me-2 text-muted p-0"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Results Summary Pill */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 pb-2 px-1">
            <div className="blog-results-counter-pill">
              <i className="fas fa-images text-primary"></i>
              <span className="text-muted">{isKhmer ? 'បង្ហាញ' : 'Showing'}</span>
              <strong style={{ color: '#07294D' }}>
                {isKhmer
                  ? filteredImages.length.toString().split('').map(d => ['០','១','២','៣','៤','៥','៦','៧','៨','៩'][d] || d).join('')
                  : filteredImages.length}
              </strong>
              <span className="text-muted">{isKhmer ? 'នៃ' : 'of'}</span>
              <strong style={{ color: '#07294D' }}>
                {isKhmer
                  ? images.length.toString().split('').map(d => ['០','១','២','៣','៤','៥','៦','៧','៨','៩'][d] || d).join('')
                  : images.length}
              </strong>
              <span className="text-muted">{isKhmer ? 'រូបភាព' : 'photos'}</span>

              {activeCategory !== 'all' && (
                <span className="ms-2 badge bg-primary text-white rounded-pill px-2.5 py-1">
                  {getCategoryLabel(activeCategory)}
                </span>
              )}
              {searchQuery && (
                <span className="ms-2 badge bg-secondary text-white rounded-pill px-2.5 py-1">
                  "{searchQuery}"
                </span>
              )}
            </div>

            {(activeCategory !== 'all' || searchQuery) && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none text-primary p-0 fw-semibold small"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                <i className="fas fa-redo-alt me-1"></i>
                {isKhmer ? 'មើលរូបភាពទាំងអស់ឡើងវិញ' : 'Reset to All Photos'}
              </button>
            )}
          </div>

          {/* Loading Spinner */}
          {loading ? (
            <div className="text-center py-5">
              <div
                style={{
                  border: '4px solid #f1f5f9',
                  borderTop: '4px solid #1e73be',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  animation: 'spin 0.9s linear infinite',
                  margin: '0 auto 16px'
                }}
              ></div>
              <p className="text-muted fw-semibold">{isKhmer ? 'កំពុងទាញយករូបភាព...' : 'Loading gallery photos...'}</p>
            </div>
          ) : filteredImages.length === 0 ? (
            /* Empty State */
            <div className="p-5 text-center bg-white rounded-4 border shadow-sm my-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '64px', height: '64px', backgroundColor: '#eff6ff', color: '#1e73be' }}
              >
                <i className="fas fa-search" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h4 className="fw-bold" style={{ color: '#07294D' }}>
                {isKhmer ? 'រកមិនឃើញរូបភាពដែលត្រូវគ្នាទេ' : 'No Photos Found'}
              </h4>
              <p className="text-muted small max-w-md mx-auto mb-4" style={{ maxWidth: '460px' }}>
                {isKhmer
                  ? 'មិនមានរូបភាពដែលត្រូវគ្នានឹងពាក្យគន្លឹះស្វែងរករបស់អ្នកទេ។ សូមសាកល្បងពាក្យគន្លឹះផ្សេង ឬជ្រើសរើសប្រភេទទាំងអស់។'
                  : 'No photos match your filter or keyword. Try choosing another category or clearing search.'}
              </p>
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                <i className="fas fa-redo-alt me-2"></i>
                {isKhmer ? 'មើលរូបភាពទាំងអស់ឡើងវិញ' : 'Reset & Show All'}
              </button>
            </div>
          ) : (
            /* Gallery Cards Grid */
            <>
              <div className="row g-4">
                {currentImages.map((img, idx) => {
                  const globalIdx = startIndex + idx;
                  const catStyle = getGalleryBadgeStyle(img.category);
                  const catLabel = getCategoryLabel(img.category);

                  return (
                    <div key={img.id || globalIdx} className="col-xl-4 col-md-6 col-12">
                      <div
                        className="inst-gallery-card"
                        onClick={() => openModal(img, globalIdx)}
                      >
                        {/* Media Container */}
                        <div className="inst-gallery-media">
                          <img
                            src={img.imageUrl}
                            alt={img.title || 'RPITSSR Gallery Photo'}
                            onError={(e) => { e.target.src = '/images/gallery/school.jpg'; }}
                          />

                          {/* Category Badge */}
                          <div className="inst-gallery-badge" style={catStyle}>
                            {catLabel}
                          </div>

                          {/* Hover Zoom Icon */}
                          <div className="inst-gallery-zoom-btn" title="View larger">
                            <i className="fas fa-search-plus"></i>
                          </div>
                        </div>

                        {/* Body Details */}
                        <div className="inst-gallery-body">
                          <div className="inst-gallery-meta">
                            <span>
                              <i className="far fa-calendar-alt"></i>
                              {formatKhmerDate(img.createdAt, isKhmer)}
                            </span>
                            <span>•</span>
                            <span>
                              <i className="fas fa-tag"></i>
                              {img.source === 'blog'
                                ? (isKhmer ? 'ព័ត៌មាន & ប្លុក' : 'News & Press')
                                : (isKhmer ? 'វិចិត្រសាលផ្លូវការ' : 'Official Media')}
                            </span>
                          </div>

                          <h3 className="inst-gallery-title" title={img.title}>
                            {img.title || (isKhmer ? 'រូបភាពសកម្មភាពវិទ្យាស្ថាន' : 'Campus Activity Photo')}
                          </h3>

                          {img.description && (
                            <p className="inst-gallery-caption">
                              {img.description}
                            </p>
                          )}

                          <div className="inst-gallery-footer">
                            <span>{isKhmer ? 'ចុចដើម្បីមើលរូបភាពធំ' : 'Click to view full photo'}</span>
                            <i className="fas fa-expand-alt"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Standardized Institutional Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5 pt-3">
                  <div className="d-inline-flex align-items-center gap-2 p-1.5 bg-white rounded-pill border shadow-sm">
                    {/* Prev Button */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '38px',
                        height: '38px',
                        border: 'none',
                        backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                        color: currentPage === 1 ? '#cbd5e1' : '#07294D'
                      }}
                      title="Previous Page"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const isActive = currentPage === page;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          className="btn btn-sm rounded-circle fw-bold d-flex align-items-center justify-content-center"
                          style={{
                            width: '38px',
                            height: '38px',
                            border: 'none',
                            backgroundColor: isActive ? '#07294D' : '#ffffff',
                            color: isActive ? '#ffffff' : '#64748b',
                            boxShadow: isActive ? '0 4px 12px rgba(7, 41, 77, 0.25)' : 'none'
                          }}
                        >
                          {isKhmer
                            ? page.toString().split('').map(d => ['០','១','២','៣','៤','៥','៦','៧','៨','៩'][d] || d).join('')
                            : page}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '38px',
                        height: '38px',
                        border: 'none',
                        backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                        color: currentPage === totalPages ? '#cbd5e1' : '#07294D'
                      }}
                      title="Next Page"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 4. INSTITUTIONAL TELEGRAM & COMMUNITY CALLOUT */}
          <div className="mt-5 pt-4">
            <div className="blog-telegram-banner">
              <div className="row align-items-center g-4">
                <div className="col-lg-8">
                  <div className="d-flex align-items-center gap-2.5 mb-2">
                    <span className="badge rounded-pill bg-warning text-dark px-3 py-1 fw-bold small">
                      <i className="fab fa-telegram-plane me-1"></i>
                      {isKhmer ? 'បណ្តាញទំនាក់ទំនងផ្លូវការ' : 'Official Media Channel'}
                    </span>
                    <span className="text-white-50 small">• RPITSSR TVET Media</span>
                  </div>
                  <h3 className="fw-bold mb-2 text-white" style={{ fontSize: '1.65rem' }}>
                    {isKhmer
                      ? 'តាមដានទិដ្ឋភាព និងសកម្មភាពបណ្តុះបណ្តាល TVET ប្រចាំថ្ងៃ'
                      : 'Follow Daily TVET Campus Moments & Updates'}
                  </h3>
                  <p className="mb-0 text-white-50 small" style={{ maxWidth: '620px', lineHeight: 1.6 }}>
                    {isKhmer
                      ? 'ចូលរួមក្នុង Telegram Channel ផ្លូវការរបស់វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប ដើម្បីទទួលបានរូបភាពសកម្មភាពជាក់ស្តែង សិក្ខាសាលា និងព័ត៌មានអាហារូបករណ៍ ១០០% មុនគេ។'
                      : 'Join the official RPITSSR Telegram channel to receive live event photos, workshop broadcasts, and 100% scholarship notices.'}
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end text-center">
                  <a
                    href="https://t.me/rpitssr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-light rounded-pill px-4 py-2.5 fw-bold d-inline-flex align-items-center gap-2 shadow"
                    style={{ color: '#07294D' }}
                  >
                    <i className="fab fa-telegram text-primary" style={{ fontSize: '1.2rem' }}></i>
                    <span>{isKhmer ? 'ចូលរួម Telegram ផ្លូវការ' : 'Join Official Telegram'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DAYLIGHT-FRIENDLY LIGHTBOX MODAL */}
      {selectedImage && (
        <div className="gallery-modal-overlay" onClick={closeModal}>
          {/* Topbar Controls */}
          <div className="gallery-modal-topbar" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center gap-2">
              <span className="gallery-modal-counter">
                {selectedIndex + 1} / {filteredImages.length}
              </span>
              <span
                className="badge rounded-pill px-3 py-1.5"
                style={getGalleryBadgeStyle(selectedImage.category)}
              >
                {getCategoryLabel(selectedImage.category)}
              </span>
            </div>

            <button
              type="button"
              className="gallery-modal-close-btn"
              onClick={closeModal}
              title="Close (ESC)"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Stage Area with Large Photo */}
          <div className="gallery-modal-stage" onClick={(e) => e.stopPropagation()}>
            {/* Prev Nav Button */}
            {selectedIndex > 0 && (
              <button
                type="button"
                className="gallery-modal-nav-btn prev"
                onClick={showPrev}
                title="Previous Photo (Left Arrow)"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            )}

            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title || 'Gallery Photo'}
              className="gallery-modal-img"
              onError={(e) => { e.target.src = '/images/gallery/school.jpg'; }}
            />

            {/* Next Nav Button */}
            {selectedIndex < filteredImages.length - 1 && (
              <button
                type="button"
                className="gallery-modal-nav-btn next"
                onClick={showNext}
                title="Next Photo (Right Arrow)"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            )}
          </div>

          {/* Caption & Metadata Footer */}
          {(selectedImage.title || selectedImage.description) && (
            <div className="gallery-modal-caption" onClick={(e) => e.stopPropagation()}>
              <h4 className="fw-bold mb-1 text-white" style={{ fontSize: '1.25rem' }}>
                {selectedImage.title}
              </h4>
              {selectedImage.description && (
                <p className="mb-0 text-white-50 small" style={{ lineHeight: 1.5 }}>
                  {selectedImage.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
