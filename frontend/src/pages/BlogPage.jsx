import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { BlogCard, getCategoryStyle, resolveCategoryName } from '../components/common/BlogCard';
import { getCleanExcerpt } from '../utils/textUtils';
import client from '../api/client';

const SAMPLE_POSTS = [
  {
    id: 1,
    title: 'RPITSSR Welcomes New Cohort of Technical Students for Academic Year 2026-2027',
    publishedAt: '2026-08-28',
    author: 'Administration',
    category: 'Campus News',
    imageUrl: '/images/gallery/school.jpg',
    summary: 'The institute orientation ceremony took place with over 800 aspiring technical and engineering students enrolled in various state-certified disciplines.'
  },
  {
    id: 2,
    title: 'Siem Reap Provincial TVET Day Highlights Industry-Driven Innovation',
    publishedAt: '2026-08-15',
    author: 'Editorial Team',
    category: 'Events',
    imageUrl: '/images/gallery/gallery 2.jpg',
    summary: 'Exhibition showcasing student automation prototypes, renewable solar implementations, and automotive diagnostics was celebrated by visiting delegates.'
  },
  {
    id: 3,
    title: 'Strengthening International TVET Partnerships with JICA and ADB Support',
    publishedAt: '2026-07-22',
    author: 'Public Relations',
    category: 'Partnership',
    imageUrl: '/images/gallery/gallery 3.jpg',
    summary: 'RPITSSR leadership signed modern curriculum enhancement frameworks to continuously align vocational training with ASEAN workforce standards.'
  },
  {
    id: 4,
    title: 'RPITSSR Achieves Renewal of International ISO 9001:2015 Quality Certification',
    publishedAt: '2026-07-02',
    author: 'Quality Assurance',
    category: 'Achievement',
    imageUrl: '/images/teacher-all.jpg',
    summary: 'Official audit confirmed full compliance with international standards in managing technical and vocational education and training in Siem Reap.'
  }
];

// Helper for authentic Cambodian date formatting
const formatKhmerDate = (dateStr, isKhmer) => {
  if (!dateStr) return isKhmer ? 'មិនមានកាលបរិច្ឆេទ' : 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return isKhmer ? 'មិនមានកាលបរិច្ឆេទ' : 'N/A';

  if (!isKhmer) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const toKhmerNumber = (num) => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().split('').map(char => khmerDigits[char] || char).join('');
  };

  const day = toKhmerNumber(d.getDate());
  const month = khmerMonths[d.getMonth()];
  const year = toKhmerNumber(d.getFullYear());
  return `${day} ${month} ${year}`;
};

export const BlogPage = () => {
  const { t, language, currentLanguage } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 6;

  useEffect(() => {
    client.get('/blog-posts')
      .then(res => {
        const data = res.data?.posts || res.data?.data?.posts || res.data?.data || res.data || [];
        const validList = Array.isArray(data) ? data : [];
        if (validList.length > 0) {
          setPosts(validList);
        } else {
          setPosts(SAMPLE_POSTS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching blog posts:', err);
        setPosts(SAMPLE_POSTS);
        setLoading(false);
      });
  }, []);

  // Category matching helper
  const matchesCategory = (post, cat) => {
    if (cat === 'all') return true;
    const title = (post.title || '').toLowerCase();
    const content = (post.content || post.summary || post.excerpt || '').toLowerCase();
    const catName = (typeof post.category === 'object' ? post.category?.name : post.category || '').toLowerCase();
    const tags = Array.isArray(post.tags) ? post.tags.join(' ').toLowerCase() : (post.tags || '').toLowerCase();
    const allText = `${title} ${content} ${catName} ${tags}`;

    switch (cat) {
      case 'scholarship':
        return allText.includes('scholar') || allText.includes('អាហារូបករណ៍') || allText.includes('១០០%') || allText.includes('promotion');
      case 'events':
        return allText.includes('event') || allText.includes('ពិធី') || allText.includes('បវេសនកាល') || allText.includes('សិក្ខាសាលា');
      case 'partnership':
        return allText.includes('partner') || allText.includes('jica') || allText.includes('adb') || allText.includes('ដៃគូ') || allText.includes('mou');
      case 'achievement':
        return allText.includes('achieve') || allText.includes('iso') || allText.includes('គុណភាព') || allText.includes('ជ័យលាភី') || allText.includes('award');
      case 'news':
        return allText.includes('news') || allText.includes('campus') || allText.includes('ព័ត៌មាន') || allText.includes('ទូទៅ');
      default:
        return true;
    }
  };

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (!matchesCategory(post, activeCategory)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (post.title || '').toLowerCase();
        const content = (post.content || post.summary || post.excerpt || '').toLowerCase();
        const author = (post.author || '').toLowerCase();
        const tags = Array.isArray(post.tags) ? post.tags.join(' ').toLowerCase() : (post.tags || '').toLowerCase();
        return title.includes(q) || content.includes(q) || author.includes(q) || tags.includes(q);
      }
      return true;
    });
  }, [posts, activeCategory, searchQuery]);

  // Handle Spotlight Featured Story
  const showSpotlight = currentPage === 1 && activeCategory === 'all' && !searchQuery.trim() && filteredPosts.length > 0;
  const spotlightPost = showSpotlight ? filteredPosts[0] : null;

  // Pagination posts
  const listForPaging = showSpotlight ? filteredPosts.slice(1) : filteredPosts;
  const totalPages = Math.ceil(listForPaging.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentPosts = listForPaging.slice(startIndex, startIndex + pageSize);

  const categories = [
    { key: 'all', label: t('blog.filter_all') || 'ទាំងអស់' },
    { key: 'news', label: t('blog.filter_news') || 'ព័ត៌មានទូទៅ' },
    { key: 'scholarship', label: t('blog.filter_scholarship') || 'អាហារូបករណ៍' },
    { key: 'events', label: t('blog.filter_events') || 'ព្រឹត្តិការណ៍ & សិក្ខាសាលា' },
    { key: 'partnership', label: t('blog.filter_partnership') || 'កិច្ចសហប្រតិបត្តិការ' },
    { key: 'achievement', label: t('blog.filter_achievement') || 'សមិទ្ធផល & គុណភាព' }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* 1. INSTITUTIONAL HERO BANNER (AGENTS.md Compliant) */}
      <section className="blog-page-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb & Official Badge */}
              <div className="blog-hero-meta-row">
                <div className="blog-breadcrumb">
                  <Link to="/">
                    <i className="fas fa-home me-1"></i>
                    {isKhmer ? 'ទំព័រដើម' : 'Home'}
                  </Link>
                  <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.72rem' }}></i>
                  <span>{t('blog.title') || 'ព័ត៌មាន'}</span>
                </div>
                <div className="blog-hero-badge">
                  <i className="fas fa-newspaper text-primary"></i>
                  <span>{t('blog.hero_badge') || 'មជ្ឈមណ្ឌលព័ត៌មាន និងសេចក្តីប្រកាសផ្លូវការ'}</span>
                </div>
              </div>

              {/* Main Institutional Title */}
              <h1 className="blog-hero-title">
                {t('blog.hero_title') || 'ព័ត៌មាន បច្ចុប្បន្នភាព និងព្រឹត្តិការណ៍ស្ថាប័ន'}
              </h1>

              {/* Subtitle */}
              <p className="blog-hero-subtitle">
                {t('blog.hero_subtitle') || 'តាមដានសេចក្តីប្រកាសព័ត៌មានផ្លូវការ កម្មវិធីបណ្តុះបណ្តាល TVET កិច្ចព្រមព្រៀងសហប្រតិបត្តិការដៃគូ និងសមិទ្ធផលឆ្នើមរបស់សិស្ស-និស្សិតវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'}
              </p>

              {/* Institutional Trust Badges */}
              <div className="blog-trust-pills">
                <div className="blog-trust-pill">
                  <i className="fas fa-shield-alt text-primary"></i>
                  <span>{t('blog.trust_official') || 'ព័ត៌មានផ្លូវការស្ថាប័ន'}</span>
                </div>
                <div className="blog-trust-pill">
                  <i className="fas fa-graduation-cap text-success"></i>
                  <span>{t('blog.trust_tvet') || 'សកម្មភាពបណ្តុះបណ្តាល TVET'}</span>
                </div>
                <div className="blog-trust-pill">
                  <i className="fas fa-award text-warning"></i>
                  <span>{t('blog.trust_scholarship') || 'កិច្ចសហប្រតិបត្តិការ & អាហារូបករណ៍'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED MEDIA & NEWS METRICS STRIP */}
      <section className="py-4" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div className="row g-3">
            <div className="col-6 col-lg-3">
              <div className="blog-metric-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', color: '#1e73be' }}
                >
                  <i className="fas fa-newspaper" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#07294D', fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {isKhmer ? '១៥០+' : '150+'}
                  </div>
                  <div className="text-muted small fw-medium">
                    {t('blog.stat_articles') || 'អត្ថបទ & សេចក្តីប្រកាស'}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="blog-metric-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669' }}
                >
                  <i className="fas fa-check-double" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#07294D', fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {isKhmer ? '១០០%' : '100%'}
                  </div>
                  <div className="text-muted small fw-medium">
                    {t('blog.stat_verified') || 'ព័ត៌មានផ្លូវការ & ផ្ទៀងផ្ទាត់'}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="blog-metric-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', color: '#7c3aed' }}
                >
                  <i className="fas fa-layer-group" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#07294D', fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {isKhmer ? '៥ វិស័យ' : '5 Sectors'}
                  </div>
                  <div className="text-muted small fw-medium">
                    {t('blog.stat_sectors') || 'ជំនាញបច្ចេកទេស TVET'}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="blog-metric-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c' }}
                >
                  <i className="fas fa-broadcast-tower" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#07294D', fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {isKhmer ? '២៤/៧' : '24/7'}
                  </div>
                  <div className="text-muted small fw-medium">
                    {t('blog.stat_updates') || 'ផ្សព្វផ្សាយព័ត៌មានទាន់ហេតុការណ៍'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT: SPOTLIGHT, FILTERS, AND ARTICLES GRID */}
      <section className="pt-60 pb-80">
        <div className="container">
          {/* CATEGORY FILTER TABS & SEARCH BAR */}
          <div className="blog-filter-bar">
            <div className="row g-3 align-items-center justify-content-between">
              <div className="col-12 col-xl-8">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      className={`blog-tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
                      onClick={() => {
                        setActiveCategory(cat.key);
                        setCurrentPage(1);
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-12 col-xl-4">
                <div className="blog-search-input-group">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    className="blog-search-input"
                    placeholder={t('blog.search_placeholder') || 'ស្វែងរកអត្ថបទព័ត៌មាន...'}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="blog-search-clear"
                      onClick={() => setSearchQuery('')}
                      title={t('blog.clear_search') || 'Clear'}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE RESULTS SUMMARY */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 pb-2 px-1">
            <div className="blog-results-counter-pill">
              <i className="fas fa-layer-group text-primary"></i>
              <span className="text-muted">{t('blog.showing_count') || 'បង្ហាញ'}</span>
              <strong style={{ color: '#07294D' }}>
                {isKhmer
                  ? filteredPosts.length.toString().split('').map(d => ['០','១','២','៣','៤','៥','៦','៧','៨','៩'][d] || d).join('')
                  : filteredPosts.length}
              </strong>
              <span className="text-muted">{t('blog.of_count') || 'នៃ'}</span>
              <strong style={{ color: '#07294D' }}>
                {isKhmer
                  ? posts.length.toString().split('').map(d => ['០','១','២','៣','៤','៥','៦','៧','៨','៩'][d] || d).join('')
                  : posts.length}
              </strong>
              <span className="text-muted">{t('blog.articles_count') || 'អត្ថបទ'}</span>
              {activeCategory !== 'all' && (
                <span className="ms-2 badge bg-primary text-white rounded-pill px-2.5 py-1">
                  {categories.find(c => c.key === activeCategory)?.label}
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
                {t('blog.clear_search') || 'កំណត់ឡើងវិញ'}
              </button>
            )}
          </div>

          {/* LOADING STATE */}
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
              <p className="text-muted fw-semibold">{t('common.loading') || 'កំពុងទាញយកទិន្នន័យ...'}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            /* EMPTY RESULTS */
            <div className="p-5 text-center bg-white rounded-4 border shadow-sm my-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '64px', height: '64px', backgroundColor: '#eff6ff', color: '#1e73be' }}
              >
                <i className="fas fa-search" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h4 className="fw-bold" style={{ color: '#07294D' }}>
                {t('blog.noBlogPosts') || 'មិនមានប្រកាសព័ត៌មាននៅឡើយទេ'}
              </h4>
              <p className="text-muted small max-w-md mx-auto mb-4" style={{ maxWidth: '460px' }}>
                {t('blog.no_results_desc') || 'មិនមានអត្ថបទដែលត្រូវគ្នានឹងការស្វែងរករបស់អ្នកទេ។ សូមសាកល្បងពាក្យគន្លឹះផ្សេង។'}
              </p>
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
              >
                <i className="fas fa-redo-alt me-2"></i>
                {t('blog.clear_search') || 'មើលព័ត៌មានទាំងអស់ឡើងវិញ'}
              </button>
            </div>
          ) : (
            <>
              {/* 4. FLAGSHIP SPOTLIGHT STORY (WHEN VIEWING ALL ON PAGE 1) */}
              {spotlightPost && (() => {
                const spotlightCatName = resolveCategoryName(spotlightPost, isKhmer);
                const spotlightCatStyle = getCategoryStyle(spotlightCatName);
                return (
                  <div className="mb-5 pb-2">
                    <div className="blog-spotlight-card">
                      <div className="row g-0 align-items-stretch">
                        <div className="col-lg-6">
                          <div className="blog-spotlight-img-wrap">
                            <Link to={`/blog-details/${spotlightPost.id || spotlightPost.slug}`} className="d-block w-100 h-100">
                              <img
                                src={spotlightPost.imageUrl || spotlightPost.image_url || '/images/blog.webp'}
                                alt={spotlightPost.title}
                                onError={(e) => { e.target.src = '/images/blog.webp'; }}
                              />
                            </Link>
                            <div className="blog-spotlight-ribbon">
                              <i className="fas fa-star me-1.5"></i>
                              <span>{t('blog.featured_story') || 'ព័ត៌មានលេចធ្លោពិសេស'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-6 blog-spotlight-body">
                          {/* Category Tag & Metadata */}
                          <div className="blog-spotlight-meta">
                            <span className="blog-spotlight-cat-tag" style={spotlightCatStyle}>
                              {spotlightCatName}
                            </span>
                            <span className="blog-spotlight-meta-item">
                              <i className="far fa-calendar-alt"></i>
                              <span>{formatKhmerDate(spotlightPost.publishedAt || spotlightPost.createdAt, isKhmer)}</span>
                            </span>
                            <span className="blog-spotlight-meta-divider">•</span>
                            <span className="blog-spotlight-meta-item">
                              <i className="far fa-user"></i>
                              <span>{spotlightPost.author || 'RPITSSR Press'}</span>
                            </span>
                          </div>

                          {/* Spotlight Title */}
                          <h3 className="blog-spotlight-title">
                            <Link to={`/blog-details/${spotlightPost.id || spotlightPost.slug}`}>
                              {spotlightPost.title}
                            </Link>
                          </h3>

                          {/* Excerpt */}
                          <p className="blog-spotlight-excerpt">
                            {getCleanExcerpt(spotlightPost, 240)}
                          </p>

                          {/* Action Footer */}
                          <div className="blog-spotlight-footer d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <Link
                              to={`/blog-details/${spotlightPost.id || spotlightPost.slug}`}
                              className="blog-spotlight-btn"
                            >
                              <span>{t('blog.read_full_story') || 'អានព័ត៌មានលម្អិត'}</span>
                              <i className="fas fa-arrow-right"></i>
                            </Link>

                            <div className="d-flex align-items-center gap-3 text-muted small">
                              <span className="d-inline-flex align-items-center gap-2">
                                <i className="far fa-clock text-primary"></i>
                                <span>{isKhmer ? 'អាន ៣ នាទី' : '3 min read'}</span>
                              </span>
                              {spotlightPost.viewCount !== undefined && spotlightPost.viewCount > 0 && (
                                <span className="d-inline-flex align-items-center gap-2">
                                  <i className="far fa-eye text-secondary"></i>
                                  <span>{spotlightPost.viewCount}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 5. ARTICLES GRID */}
              <div className="row g-4">
                {currentPosts.map((post) => (
                  <div key={post.id} className="col-lg-4 col-md-6">
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>

              {/* 6. CLEAN PAGINATION */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5 pt-3">
                  <div className="d-inline-flex align-items-center gap-2 p-1.5 bg-white rounded-pill border shadow-sm">
                    {/* Previous Page Button */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '38px',
                        height: '38px',
                        border: 'none',
                        backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                        color: currentPage === 1 ? '#cbd5e1' : '#07294D'
                      }}
                    >
                      <i className="fas fa-chevron-left" style={{ fontSize: '0.85rem' }}></i>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      const isActive = currentPage === pNum;
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pNum);
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }}
                          className="btn btn-sm rounded-circle fw-bold d-flex align-items-center justify-content-center"
                          style={{
                            width: '38px',
                            height: '38px',
                            border: 'none',
                            backgroundColor: isActive ? '#07294D' : 'transparent',
                            color: isActive ? '#ffffff' : '#475569',
                            fontSize: '0.9rem',
                            boxShadow: isActive ? '0 4px 12px rgba(7, 41, 77, 0.25)' : 'none'
                          }}
                        >
                          {pNum}
                        </button>
                      );
                    })}

                    {/* Next Page Button */}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '38px',
                        height: '38px',
                        border: 'none',
                        backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                        color: currentPage === totalPages ? '#cbd5e1' : '#07294D'
                      }}
                    >
                      <i className="fas fa-chevron-right" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 7. INSTITUTIONAL TELEGRAM ALERTS BANNER */}
          <div className="mt-5 pt-4">
            <div className="blog-telegram-banner">
              <div className="row align-items-center g-4">
                <div className="col-lg-8">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-warning text-dark fw-bold rounded-pill px-3 py-1 text-uppercase" style={{ fontSize: '0.74rem' }}>
                      <i className="fab fa-telegram-plane me-1"></i> Telegram Channel
                    </span>
                  </div>
                  <h3 className="fw-bold text-white mb-2" style={{ fontSize: '1.5rem' }}>
                    {t('blog.telegram_title') || 'ទទួលដំណឹង និងអាហារូបករណ៍ថ្មីៗមុនគេ'}
                  </h3>
                  <p className="text-white-50 mb-0" style={{ fontSize: '0.95rem', maxWidth: '620px', lineHeight: 1.6 }}>
                    {t('blog.telegram_desc') || 'ចូលរួមជាមួយបណ្តាញតេឡេក្រាមផ្លូវការរបស់វិទ្យាស្ថានដើម្បីទទួលបានសេចក្តីជូនដំណឹង និងឱកាសអាហារូបករណ៍ ១០០% ភ្លាមៗ។'}
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end">
                  <a
                    href="https://t.me/rpitssr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-light rounded-pill px-4 py-2.5 fw-bold d-inline-flex align-items-center gap-2 shadow"
                    style={{ color: '#07294D', fontSize: '0.92rem' }}
                  >
                    <i className="fab fa-telegram text-primary" style={{ fontSize: '1.15rem' }}></i>
                    <span>{t('blog.join_telegram') || 'ចូលរួម Telegram ផ្លូវការ'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
