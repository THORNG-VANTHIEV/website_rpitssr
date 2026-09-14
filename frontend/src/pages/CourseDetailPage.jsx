import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageBanner } from '../components/common/PageBanner';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    client.get(`/courses/${id}`)
      .then(res => {
        const data = res.data?.course || res.data?.data || res.data;
        setCourse(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback sample course
        setCourse({
          id: id || 1,
          title: 'ព័ត៌មានវិទ្យា (Information Technology & Software Development)',
          category: 'បច្ចេកវិទ្យាព័ត៌មាន (IT)',
          duration: '២ ឆ្នាំ (Associate Degree) / ៤ ឆ្នាំ (Bachelor)',
          level: 'សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស / បរិញ្ញាបត្រ',
          imageUrl: '/images/courses/Course 1.jpg',
          description: 'កម្មវិធីសិក្សាផ្នែកព័ត៌មានវិទ្យាត្រូវបានរៀបចំឡើងដើម្បីបណ្តុះបណ្តាលសិស្ស-និស្សិតឱ្យមានចំណេះដឹង និងជំនាញច្បាស់លាស់ក្នុងការអភិវឌ្ឍគេហទំព័រ កម្មវិធីទូរស័ព្ទ ការគ្រប់គ្រងប្រព័ន្ធទិន្នន័យ (Database) បណ្តាញកុំព្យូទ័រ (Networking) និងសន្តិសុខប្រព័ន្ធព័ត៌មាន (Cybersecurity) ឆ្លើយតបនឹងទីផ្សារការងារក្នុងយុគសម័យឌីជីថល ៤.០។',
          benefits: [
            'រៀនអនុវត្តផ្ទាល់ក្នុងបន្ទប់ពិសោធន៍កុំព្យូទ័រទំនើប 1 Student : 1 PC',
            'កម្មសិក្សាការងារជាមួយក្រុមហ៊ុនបច្ចេកវិទ្យាឈានមុខគេក្នុងខេត្តសៀមរាប និងរាជធានីភ្នំពេញ',
            'វិញ្ញាបនបត្រ និងសញ្ញាបត្រទទួលស្គាល់ដោយក្រសួងការងារ និងស្តង់ដារ ISO 9001:2015',
            'ឱកាសទទួលបានការងារធ្វើភ្លាមៗក្រោយបញ្ចប់ការសិក្សា'
          ]
        });
        setLoading(false);
      });
  }, [id]);

  const categoryName = useMemo(() => {
    if (!course?.category) return null;
    if (typeof course.category === 'object') return course.category.name || null;
    return String(course.category);
  }, [course?.category]);

  const parsedBenefits = useMemo(() => {
    if (!course?.benefits) return [];
    if (Array.isArray(course.benefits)) return course.benefits;
    if (typeof course.benefits === 'string') {
      try {
        const parsed = JSON.parse(course.benefits);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string') return [parsed];
      } catch (e) {
        return [course.benefits];
      }
    }
    return [String(course.benefits)];
  }, [course?.benefits]);

  const courseImage = course?.imageUrl || course?.image || course?.image_url || '/images/courses/Course 1.jpg';

  return (
    <div>
      {/* Modern Page Banner matching rpitssr.edu.kh */}
      <section
        className="modern-page-banner"
        style={{
          background: 'linear-gradient(135deg, #1e73be 0%, #185ca1 100%)',
          padding: '4rem 0 3rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link
              to="/courses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                textDecoration: 'none',
                marginBottom: '1rem',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-arrow-left"></i> {t('courses.backToCourses') || 'Back to Courses'}
            </Link>
            <h1
              style={{
                color: 'white',
                fontSize: '2.4rem',
                fontWeight: '700',
                marginBottom: '1rem',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                lineHeight: '1.3'
              }}
            >
              {course?.title || 'Course Details'}
            </h1>
            {categoryName && (
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.45rem 1rem',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)'
                }}
              >
                📚 {categoryName}
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.12,
            backgroundImage: 'url(/images/course-details.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </section>

      {/* Content Section with Generous Padding and Modern Cards */}
      <section className="courses-details-page-area" style={{ background: '#f8fafc', padding: '50px 0 80px' }}>
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div style={{ border: '4px solid #f3f4f6', borderTop: '4px solid #07294D', borderRadius: '50%', width: '45px', height: '45px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
              <p className="text-muted">{t('common.loading') || 'Loading Course Details...'}</p>
            </div>
          ) : course ? (
            <div className="row g-4">
              {/* Main Course Content Left */}
              <div className="col-lg-8">
                <div
                  className="course-main-card"
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Featured Course Image */}
                  <div style={{ width: '100%', maxHeight: '440px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={courseImage}
                      alt={course.title}
                      style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
                      onError={(e) => { e.target.src = '/images/courses/Course 1.jpg'; }}
                    />
                  </div>

                  {/* Body Content with Generous Padding */}
                  <div className="course-main-card-body">
                    {/* Meta Tags Row */}
                    <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
                      {categoryName && (
                        <span style={{ background: '#eff6ff', color: '#1e73be', padding: '6px 14px', borderRadius: '30px', fontSize: '13px', fontWeight: '600' }}>
                          📚 {categoryName}
                        </span>
                      )}
                      <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '30px', fontSize: '13px', fontWeight: '500' }}>
                        <i className="far fa-clock me-1 text-primary"></i> {course.duration || '2-4 Years'}
                      </span>
                      {course.fee !== undefined && (
                        <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '30px', fontSize: '13px', fontWeight: '600' }}>
                          <i className="fas fa-dollar-sign me-1"></i> {course.fee === '0' || course.fee === 0 || course.fee === 'Free' ? (t('courses.freeScholarship') || 'ឥតគិតថ្លៃ / អាហារូបករណ៍') : `$${course.fee}`}
                        </span>
                      )}
                    </div>

                    {/* Course Overview */}
                    {course.overview && (
                      <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ color: '#07294D', fontWeight: '700', fontSize: '1.4rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '4px', height: '22px', background: '#1e73be', borderRadius: '2px', display: 'inline-block' }}></span>
                          <span>{t('courses.overview') || 'សេចក្តីសង្ខេប'}</span>
                        </h3>
                        <div style={{ color: '#334155', lineHeight: '2.1', fontSize: '1.06rem', padding: '18px 22px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #1e73be' }}>
                          {course.overview}
                        </div>
                      </div>
                    )}

                    {/* Course Description */}
                    <div style={{ marginBottom: '36px' }}>
                      <h3 style={{ color: '#07294D', fontWeight: '700', fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '4px', height: '22px', background: '#1e73be', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>{t('courses.description') || 'ការពិពណ៌នាអំពីវគ្គសិក្សា'}</span>
                      </h3>
                      <div style={{ color: '#334155', lineHeight: '2.1', fontSize: '1.06rem', paddingLeft: '4px' }}>
                        {course.description}
                      </div>
                    </div>

                    {/* Key Highlights & Benefits */}
                    {parsedBenefits.length > 0 && (
                      <div style={{ marginBottom: '36px' }}>
                        <h3 style={{ color: '#07294D', fontWeight: '700', fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '4px', height: '22px', background: '#10b981', borderRadius: '2px', display: 'inline-block' }}></span>
                          <span>{t('courses.highlights') || 'អត្ថប្រយោជន៍ និងចំណុចសំខាន់ៗ'}</span>
                        </h3>
                        <div className="d-flex flex-column gap-3">
                          {parsedBenefits.map((benefit, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '14px 18px',
                                background: '#f8fafc',
                                borderRadius: '10px',
                                border: '1px solid #edf2f7',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px'
                              }}
                            >
                              <i className="fas fa-check-circle text-success mt-1" style={{ fontSize: '16px', flexShrink: 0 }}></i>
                              <span style={{ color: '#334155', fontSize: '1.02rem', lineHeight: '1.7' }}>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Buttons */}
                    <hr style={{ margin: '36px 0 28px', borderColor: '#e2e8f0' }} />
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                      <Link
                        to="/courses"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: '1.5px solid #07294D',
                          color: '#07294D',
                          backgroundColor: '#ffffff',
                          fontWeight: '600',
                          fontSize: '0.92rem',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <i className="fas fa-arrow-left"></i> {t('courses.backToCourses') || 'ត្រឡប់ទៅវគ្គសិក្សាទាំងអស់'}
                      </Link>

                      <Link
                        to="/register"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 24px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '0.95rem',
                          textDecoration: 'none',
                          boxShadow: '0 4px 14px rgba(7, 41, 77, 0.2)',
                        }}
                      >
                        <i className="fas fa-edit"></i> {t('courses.applyNowBtn') || 'ដាក់ពាក្យចុះឈ្មោះឥឡូវនេះ'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Info Sidebar */}
              <div className="col-lg-4">
                <div
                  className="course-sidebar-card"
                  style={{
                    position: 'sticky',
                    top: '100px',
                    zIndex: 20,
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                    padding: '32px 28px',
                    overflow: 'hidden'
                  }}
                >
                  <h4 style={{ color: '#07294D', fontWeight: '800', fontSize: '1.25rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-graduation-cap text-primary"></i>
                    <span>{t('courses.courseInfo') || 'ព័ត៌មានទូទៅនៃវគ្គសិក្សា'}</span>
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>
                    {t('courses.courseInfoSubtitle') || 'ព័ត៌មានលម្អិតអំពីកម្មវិធីបណ្តុះបណ្តាល'}
                  </p>
                  <div style={{ height: '2px', background: 'linear-gradient(to right, #1e73be, #e2e8f0)', marginBottom: '20px' }}></div>

                  <div className="course-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Level */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#1e73be', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                          <i className="fas fa-award"></i>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{t('courses.level') || 'កម្រិតសិក្សា'}</span>
                      </div>
                      <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>{course.level || 'Associate / Bachelor'}</strong>
                    </div>

                    {/* Duration */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#1e73be', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                          <i className="far fa-clock"></i>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{t('courses.duration') || 'រយៈពេល'}</span>
                      </div>
                      <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>{course.duration || '2-4 Years'}</strong>
                    </div>

                    {/* Credits */}
                    {course.credit && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#1e73be', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                            <i className="fas fa-book"></i>
                          </div>
                          <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{t('courses.credits') || 'ចំនួនក្រេឌីត'}</span>
                        </div>
                        <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>{course.credit} Credits</strong>
                      </div>
                    )}

                    {/* Semesters */}
                    {course.semester && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#1e73be', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                            <i className="fas fa-calendar-alt"></i>
                          </div>
                          <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{t('courses.semesters') || 'ចំនួនឆមាស'}</span>
                        </div>
                        <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>{course.semester} Semesters</strong>
                      </div>
                    )}

                    {/* Tuition Fee */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                          <i className="fas fa-dollar-sign"></i>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{t('courses.fee') || 'ថ្លៃសិក្សា'}</span>
                      </div>
                      <strong style={{ color: '#059669', fontSize: '14px', fontWeight: '700' }}>
                        {course.fee === '0' || course.fee === 0 || course.fee === 'Free' ? (t('courses.freeScholarship') || 'ឥតគិតថ្លៃ / អាហារូបករណ៍') : `$${course.fee || 0}`}
                      </strong>
                    </div>

                    {/* Language */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#1e73be', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                          <i className="fas fa-language"></i>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{t('courses.language') || 'ភាសាបង្រៀន'}</span>
                      </div>
                      <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>Khmer / English</strong>
                    </div>

                    {/* Quality Standard */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                          <i className="fas fa-certificate"></i>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{t('courses.qualityStandard') || 'ស្តង់ដារគុណភាព'}</span>
                      </div>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: '700' }}>
                        ISO 9001:2015
                      </span>
                    </div>
                  </div>

                  {/* Actions in Sidebar */}
                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link
                      to="/register"
                      className="btn w-100 py-3"
                      style={{
                        background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '15px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 14px rgba(7, 41, 77, 0.2)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <i className="fas fa-paper-plane"></i>
                      <span>{t('courses.applyNowBtn') || 'ដាក់ពាក្យចុះឈ្មោះឥឡូវនេះ'}</span>
                    </Link>

                    <Link
                      to="/contact"
                      className="btn w-100 py-2"
                      style={{
                        background: '#ffffff',
                        color: '#07294D',
                        fontWeight: '600',
                        fontSize: '14px',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <i className="fas fa-phone-alt"></i>
                      <span>{t('courses.contactInquire') || 'ទំនាក់ទំនងសាកសួរព័ត៌មាន'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <h4>Course not found</h4>
              <Link to="/courses" className="btn btn-primary mt-3">Browse Courses</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

