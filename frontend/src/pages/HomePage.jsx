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
  const { t, language } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState(promotionalVideos);
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
      {/* 1. Hero Slider Area */}
      <section className="slider-area hero-full-showcase" style={{ paddingTop: '0px' }}>
        <div
          className="single-slider d-flex align-items-end bg_cover position-relative"
          style={{
            backgroundImage: 'url(/images/teacher-all.jpg)',
            backgroundPosition: 'center bottom',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            width: '100%',
          }}
        >
          <div className="container" style={{ position: 'relative', zIndex: 2 }}></div>
        </div>
      </section>

      {/* 2. Campus Image Gallery Feature Area */}
      <section className="features-area single-campus">
        <div className="container">
          <div className="features-wrapper">
            <div className="row justify-content-end">
              <div className="col-lg-8">
                <h2 className="features-title">
                  Visit our <span>Campus <br /> with</span> Image Gallery
                </h2>
              </div>
            </div>
            <div className="row justify-content-end">
              <div className="col-lg-11">
                <div className="features-image">
                  <img
                    className="campus-image"
                    src="/images/gallery/school.jpg"
                    width="1061"
                    height="387"
                    alt="Campus gallery"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Top Courses Area */}
      <section className="top-courses-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="section-title mt-40">
                <h2 className="title">{t('home.topCourses')}</h2>
                <p>{t('home.coursesDescription')}</p>
              </div>
            </div>
          </div>

          <div className="courses-wrapper">
            <div className="row">
              {loading ? (
                Array.from({ length: 4 }).map((_, s) => (
                  <div key={s} className="col-lg-3 col-sm-6 courses-col">
                    <div className="single-courses mt-30 text-center py-5">
                      <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                    </div>
                  </div>
                ))
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.id} className="col-lg-3 col-sm-6 courses-col">
                    <CourseCard course={course} />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p>No courses available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Specialty Features Area */}
      <section className="specialty-area">
        <div className="container">
          <div className="row no-gutters wow fadeInUpBig" data-wow-duration="1s" data-wow-delay="0.2s">
            <div className="col-sm-4">
              <div className="single-specialty mt-30">
                <div className="specialty-box">
                  <div className="box-icon">
                    <img src="/images/icon/icon-1.webp" width="70" height="70" alt="icon" />
                  </div>
                  <div className="box-content">
                    <p>Skill Based Scholarships</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="single-specialty active mt-30">
                <div className="specialty-box">
                  <div className="box-icon">
                    <img src="/images/icon/icon-2.webp" width="70" height="70" alt="icon" />
                  </div>
                  <div className="box-content">
                    <p>Download Prospectus</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="single-specialty mt-30">
                <div className="specialty-box">
                  <div className="box-icon">
                    <img src="/images/icon/icon-3.webp" width="70" height="70" alt="icon" />
                  </div>
                  <div className="box-content">
                    <p>After Course Certification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Promotional Videos & Media Showcase */}
      <section className="modern-video-showcase-area">
        <div className="container">
          <div className="video-section-header">
            <span className="video-section-badge">
              <i className="fas fa-play-circle"></i> វីដេអូ & សកម្មភាពថ្មីៗ
            </span>
            <h2 className="video-section-title">វីដេអូផ្សព្វផ្សាយ និងសកម្មភាពបណ្តុះបណ្តាល</h2>
            <p className="video-section-desc">
              ទស្សនាទិដ្ឋភាពទូទៅ បរិយាកាសសិក្សា និងសកម្មភាពអនុវត្តជំនាញជាក់ស្តែងរបស់និស្សិតនៃវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
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

      {/* 7. Modern Counter / Stats Showcase */}
      <section className="modern-counter-section">
        <div className="container">
          <div className="modern-counter-container">
            <div className="counter-grid-wrapper">
              {/* Stat 1: Students */}
              <div className="modern-stat-card stat-card-students">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div className="stat-number-wrap">
                  <span className="stat-number-val">
                    <CountUpNumber end={3652} duration={2000} />
                  </span>
                  <span className="stat-number-plus">+</span>
                </div>
                <div className="stat-title-kh">
                  {language === 'km' ? 'និស្សិតកំពុងសិក្សា' : 'Enrolled Students'}
                </div>
                <div className="stat-subtitle-en">Students</div>
                <div className="stat-highlight-pill">
                  <i className="fas fa-certificate" style={{ color: '#38bdf8' }}></i>
                  <span>TVET & បរិញ្ញាបត្រ</span>
                </div>
              </div>

              {/* Stat 2: Faculties */}
              <div className="modern-stat-card stat-card-faculties">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <div className="stat-number-wrap">
                  <span className="stat-number-val">
                    <CountUpNumber end={105} duration={2000} />
                  </span>
                  <span className="stat-number-plus">+</span>
                </div>
                <div className="stat-title-kh">
                  {language === 'km' ? 'សាស្ត្រាចារ្យ & គ្រូបណ្តុះបណ្តាល' : 'Faculty Members'}
                </div>
                <div className="stat-subtitle-en">Faculties</div>
                <div className="stat-highlight-pill">
                  <i className="fas fa-star" style={{ color: '#fb923c' }}></i>
                  <span>ជំនាញច្បាស់លាស់</span>
                </div>
              </div>

              {/* Stat 3: Branches / Programs */}
              <div className="modern-stat-card stat-card-branches">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-sitemap"></i>
                </div>
                <div className="stat-number-wrap">
                  <span className="stat-number-val">
                    <CountUpNumber end={120} duration={2000} />
                  </span>
                  <span className="stat-number-plus">+</span>
                </div>
                <div className="stat-title-kh">
                  {language === 'km' ? 'ជំនាញ & វគ្គបណ្តុះបណ្តាល' : 'Courses & Programs'}
                </div>
                <div className="stat-subtitle-en">Branches</div>
                <div className="stat-highlight-pill">
                  <i className="fas fa-bolt" style={{ color: '#c084fc' }}></i>
                  <span>ជំនាញទីផ្សារ ៤.០</span>
                </div>
              </div>

              {/* Stat 4: Awards Win */}
              <div className="modern-stat-card stat-card-awards">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="stat-number-wrap">
                  <span className="stat-number-val">
                    <CountUpNumber end={30} duration={2000} />
                  </span>
                  <span className="stat-number-plus">+</span>
                </div>
                <div className="stat-title-kh">
                  {language === 'km' ? 'ពានរង្វាន់ & ស្នាដៃឆ្នើម' : 'National Awards'}
                </div>
                <div className="stat-subtitle-en">Awards Win</div>
                <div className="stat-highlight-pill">
                  <i className="fas fa-award" style={{ color: '#facc15' }}></i>
                  <span>ស្តង់ដារគុណភាពជាតិ</span>
                </div>
              </div>
            </div>
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
