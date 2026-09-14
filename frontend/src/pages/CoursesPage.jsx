import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CourseCard } from '../components/common/CourseCard';
import api from '../api/client';

export const CoursesPage = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = '📚 Our Courses - វគ្គសិក្សា | RPITSSR';
    (async () => {
      try {
        setLoading(true);
        const [coursesRes, teachersRes] = await Promise.all([
          api.get('/courses'),
          api.get('/teachers')
        ]);
        const sortedCourses = [...(coursesRes.data || [])].sort(
          (a, b) => (b.id || 0) - (a.id || 0)
        );
        setCourses(sortedCourses);
        setTeachers(teachersRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getImageUrl = (url, fallback = '/images/courses/Course 3.jpg') => {
    if (!url) return fallback;
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
    if (cleanUrl.startsWith('/uploads/')) return cleanUrl;
    if (cleanUrl.startsWith('uploads/')) return `/${cleanUrl}`;
    if (cleanUrl.startsWith('/images/')) return cleanUrl;
    if (cleanUrl.startsWith('images/')) return `/${cleanUrl}`;
    return cleanUrl;
  };

  const TeacherImage = ({ imageUrl, name }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const validUrl = getImageUrl(imageUrl, '');

    if (!validUrl || imgFailed) {
      return (
        <div
          style={{
            width: '100%',
            height: '359px',
            maxWidth: '266px',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d',
            fontSize: '14px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '20px',
            margin: '0 auto'
          }}
        >
          <i className="fas fa-user" style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}></i>
          <span>No Image Available</span>
        </div>
      );
    }

    return (
      <img
        src={validUrl}
        alt={name || 'teacher'}
        onError={() => setImgFailed(true)}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '359px',
          maxWidth: '266px',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      />
    );
  };

  return (
    <div>
      {/* 1. Page Banner */}
      <section className="page-banner">
        <div
          className="page-banner-bg bg_cover"
          style={{
            backgroundImage: 'url(/images/our-course.webp)',
            height: '200px',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="container">
            <div className="banner-content text-center">
              <h2 className="title">{t('courses.title')}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Best Educational Environment Area */}
      <section className="campus-visit-area-2">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5">
              <div className="about-content mt-40">
                <h2 className="about-title">
                  {t('courses.bestEnvironment')} <span>Environment</span>
                </h2>
                <span className="line"></span>
                <p>
                  {t('courses.bestEnvironmentDesc')} <br /> <br />
                  Our state-of-the-art laboratories, practical training programs, and collaborative learning spaces ensure students receive the best education possible.
                </p>
                <Link to="/" className="main-btn">
                  {t('courses.exploreBtn')}
                </Link>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="campus-image-2 mt-50">
                <h4 className="campus-title-2">{t('courses.courseGallery')}</h4>
                <div className="image-1">
                  <img src="/images/courses/Course 3.jpg" width="585" height="308" alt="course" />
                </div>
                <div className="image-2">
                  <img src="/images/courses/Course 5.jpg" width="253" height="220" alt="course" />
                </div>
                <div className="image-3">
                  <img src="/images/courses/Course 7.jpg" width="412" height="270" alt="course" />
                </div>
                <Link to="/gallery" className="more" onClick={() => window.scrollTo(0, 0)}>
                  {t('courses.viewMore')} <i className="fal fa-long-arrow-right"></i>
                </Link>
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
                <h2 className="title">{t('courses.topCourses')}</h2>
                <p>{t('courses.topCoursesDesc')}</p>
              </div>
            </div>
          </div>

          <div className="courses-wrapper">
            <div className="row">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="col-lg-3 col-sm-6 courses-col">
                    <div className="single-courses mt-30 text-center py-5" style={{ minHeight: '300px', background: '#f5f5f5' }}>
                      <i className="fas fa-spinner fa-spin fa-2x text-muted"></i>
                    </div>
                  </div>
                ))
              ) : courses.length > 0 ? (
                courses.map((course, s) => (
                  <div key={course.id || s} className="col-lg-3 col-sm-6 courses-col">
                    <CourseCard course={course} />
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '4rem 2rem',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      border: '2px dashed #e5e7eb',
                      margin: '2rem 0'
                    }}
                  >
                    <i className="fas fa-book-open" style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '1rem' }}></i>
                    <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{t('courses.noCourses')}</h3>
                    <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>{t('courses.noCoursesMsg')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Teachers Area */}
      <section className="teachers-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="section-title mt-40">
                <h2 className="title">Meet our Teachers</h2>
                <p>Our expert faculty members are dedicated to providing quality education and guidance</p>
              </div>
            </div>
          </div>

          <div className="teachers-wrapper">
            <div className="row teachers-row">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="col-md-4 col-sm-6 teachers-col">
                    <div className="single-teacher mt-30 text-center py-5" style={{ minHeight: '350px', background: '#f5f5f5' }}>
                      <i className="fas fa-spinner fa-spin fa-2x text-muted"></i>
                    </div>
                  </div>
                ))
              ) : teachers.length === 0 ? (
                <div className="col-12 text-center">
                  <p>No teachers found. Please add teachers through the admin panel.</p>
                </div>
              ) : (
                teachers.map((teacher, idx) => (
                  <div key={teacher.id || idx} className="col-md-4 col-sm-6 teachers-col">
                    <div className="single-teacher mt-30 text-center">
                      <div className="teacher-image">
                        <Link to={`/teacher-details/${teacher.id}`}>
                          <TeacherImage imageUrl={teacher.imageUrl} name={teacher.name} />
                        </Link>
                      </div>
                      <div className="teacher-content">
                        <h4 className="name">
                          <Link to={`/teacher-details/${teacher.id}`}>{teacher.name}</Link>
                        </h4>
                        <span className="designation">{teacher.designation || 'Faculty Member'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Two 50px bottom spacers matching chunk 622 */}
      <div style={{ height: '50px' }}></div>
      <div style={{ height: '50px' }}></div>
    </div>
  );
};
