import React from 'react';
import { Link } from 'react-router-dom';
import { PageBanner } from '../components/common/PageBanner';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <div className="about-page-wrapper">
      {/* 1. Page Banner */}
      <PageBanner
        title={t('about.pageTitle') || 'About Us'}
        image="/images/about-us.webp"
      />

      {/* 2. Main About Section */}
      <section className="about-area pt-70 pb-70">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center mb-50">
              <div className="section-title-2">
                <h2 className="title">{t('about.subtitle') || 'Learn About Our History and Mission'}</h2>
                <span className="line"></span>
              </div>
            </div>
          </div>
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-content mt-20">
                <h3 className="about-subtitle mb-20">{t('about.aboutInstitute') || 'About RPITSSR'}</h3>
                <p className="mb-20">{t('about.about_description')}</p>

                <h3 className="about-subtitle mb-20">{t('about.vision') || 'Our Vision'}</h3>
                <p className="mb-20">{t('about.vision_text')}</p>

                <h3 className="about-subtitle mb-20">{t('about.mission') || 'Our Mission'}</h3>
                <p className="mb-20">{t('about.mission_text')}</p>

                <div className="about-features mt-30">
                  <div className="single-feature d-flex mb-15">
                    <div className="feature-icon mr-15" style={{ marginRight: '12px' }}>
                      <i className="fas fa-check text-success"></i>
                    </div>
                    <div className="feature-content">
                      <p>{t('about.features.feature1')}</p>
                    </div>
                  </div>
                  <div className="single-feature d-flex mb-15">
                    <div className="feature-icon mr-15" style={{ marginRight: '12px' }}>
                      <i className="fas fa-check text-success"></i>
                    </div>
                    <div className="feature-content">
                      <p>{t('about.features.feature2')}</p>
                    </div>
                  </div>
                  <div className="single-feature d-flex mb-15">
                    <div className="feature-icon mr-15" style={{ marginRight: '12px' }}>
                      <i className="fas fa-check text-success"></i>
                    </div>
                    <div className="feature-content">
                      <p>{t('about.features.feature3')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-image-wrapper mt-40">
                <img
                  src="/images/teacher-all.jpg"
                  alt="RPIT Faculty and Students"
                  style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. History & Reputation */}
      <section className="about-history" style={{ backgroundColor: '#ffffff', padding: '70px 0 80px' }}>
        <div className="container" style={{ maxWidth: '1240px' }}>
          <div className="row">
            <div className="col-lg-8 mx-auto text-center mb-50">
              <div className="section-title-2">
                <h2 className="title" style={{ color: '#07294D', fontWeight: '800' }}>
                  {t('about.historyReputation') || 'Our History and Leadership'}
                </h2>
                <span className="line"></span>
              </div>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div
                className="history-content h-100"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '36px 32px'
                }}
              >
                <h4 className="mb-20" style={{ color: '#07294D', fontWeight: '700', fontSize: '1.2rem' }}>
                  {t('about.leadershipGrowth')}
                </h4>
                <p className="mb-0" style={{ lineHeight: '2.0', color: '#475569', fontSize: '1rem' }}>
                  {t('about.leadershipGrowthDesc')}
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="history-content h-100"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '36px 32px'
                }}
              >
                <h4 className="mb-20" style={{ color: '#07294D', fontWeight: '700', fontSize: '1.2rem' }}>
                  {t('about.teachersExpertise')}
                </h4>
                <p className="mb-0" style={{ lineHeight: '2.0', color: '#475569', fontSize: '1rem' }}>
                  {t('about.teachersExpertiseDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Values */}
      <section className="about-values" style={{ padding: '70px 0 80px', backgroundColor: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1240px' }}>
          <div className="row">
            <div className="col-lg-8 mx-auto text-center mb-50">
              <div className="section-title-2">
                <h2 className="title" style={{ color: '#07294D', fontWeight: '800' }}>
                  {t('about.values_title') || 'គុណតម្លៃ RPITSSR'}
                </h2>
                <span className="line"></span>
              </div>
            </div>
          </div>
          <div className="row g-4 justify-content-center">
            {/* Value 1: Reliable */}
            <div className="col-lg-4 col-md-6">
              <div
                className="value-item text-center h-100"
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  padding: '40px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '22px'
                  }}
                >
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h4 style={{ fontWeight: '700', color: '#07294D', fontSize: '1.2rem', marginBottom: '14px' }}>
                  {t('about.reliable')}
                </h4>
                <p style={{ color: '#475569', lineHeight: '2.0', fontSize: '0.98rem', marginBottom: 0, padding: '0 8px' }}>
                  {t('about.reliableDesc')}
                </p>
              </div>
            </div>

            {/* Value 2: Productivity */}
            <div className="col-lg-4 col-md-6">
              <div
                className="value-item text-center h-100"
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  padding: '40px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '22px'
                  }}
                >
                  <i className="fas fa-flask"></i>
                </div>
                <h4 style={{ fontWeight: '700', color: '#07294D', fontSize: '1.2rem', marginBottom: '14px' }}>
                  {t('about.productivity')}
                </h4>
                <p style={{ color: '#475569', lineHeight: '2.0', fontSize: '0.98rem', marginBottom: 0, padding: '0 8px' }}>
                  {t('about.productivityDesc')}
                </p>
              </div>
            </div>

            {/* Value 3: Sustainability */}
            <div className="col-lg-4 col-md-6">
              <div
                className="value-item text-center h-100"
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  padding: '40px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '22px'
                  }}
                >
                  <i className="fas fa-users"></i>
                </div>
                <h4 style={{ fontWeight: '700', color: '#07294D', fontSize: '1.2rem', marginBottom: '14px' }}>
                  {t('about.sustainability')}
                </h4>
                <p style={{ color: '#475569', lineHeight: '2.0', fontSize: '0.98rem', marginBottom: 0, padding: '0 8px' }}>
                  {t('about.sustainabilityDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Director Message */}
      <section className="director-message" style={{ padding: '70px 0 85px', backgroundColor: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div className="row">
            <div className="col-lg-8 mx-auto text-center mb-40">
              <div className="section-title-2">
                <h2 className="title" style={{ color: '#07294D', fontWeight: '800' }}>
                  {t('about.directorMessageTitle') || 'សាររបស់នាយិកាវិទ្យាស្ថាន'}
                </h2>
                <span className="line"></span>
                <p className="mt-2 text-muted" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                  {t('about.welcome_from_leadership')}
                </p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-11 col-xl-10">
              <div
                className="director-message-card"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.05)',
                  padding: '44px 48px',
                  position: 'relative'
                }}
              >
                {/* Quotation Icon Badge */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e73be 0%, #07294D 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    margin: '0 auto 24px',
                    boxShadow: '0 6px 18px rgba(30, 115, 190, 0.25)'
                  }}
                >
                  <i className="fas fa-quote-left"></i>
                </div>

                {/* Message Content with Generous Padding and Breathing Room */}
                <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
                  <p
                    style={{
                      color: '#1e293b',
                      fontSize: '1.08rem',
                      lineHeight: '2.2',
                      letterSpacing: '0.2px',
                      marginBottom: '26px',
                      padding: '0 16px'
                    }}
                  >
                    "{t('about.directorMessageContent')}"
                  </p>
                </div>

                {/* Author Signature Divider */}
                <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #1e73be, #ffaf00)', margin: '0 auto 16px', borderRadius: '2px' }}></div>

                <div className="text-center">
                  <h5 style={{ color: '#07294D', fontWeight: '800', fontSize: '1.15rem', marginBottom: '4px' }}>
                    {t('about.directorTitleName') || 'លោកស្រី នាយិកាវិទ្យាស្ថាន'}
                  </h5>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: 0 }}>
                    {t('about.instituteName') || 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'}
                  </p>
                </div>

                {/* Direct Link to Interactive Org Chart */}
                <div className="text-center mt-4">
                  <Link
                    to="/organization"
                    className="btn btn-outline-primary rounded-pill px-4 py-2"
                    style={{ fontWeight: '600', fontSize: '0.95rem' }}
                  >
                    <i className="fas fa-sitemap me-2"></i>
                    {t('organization.pageTitle') || 'រចនាសម្ព័ន្ធគ្រប់គ្រង និងថ្នាក់ដឹកនាំ'} ➜
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Features Badges Area */}
      <div className="features-area-2 py-60" style={{ backgroundColor: '#f0f4f8' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-4 mb-30">
              <div className="features-image-2 text-center">
                <img
                  src="/images/courses/Course 3.jpg"
                  alt="Features"
                  style={{ width: '100%', maxWidth: '342px', height: 'auto', borderRadius: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                />
              </div>
            </div>
            <div className="col-lg-8">
              <div className="row g-3">
                <div className="col-sm-6 mb-20">
                  <div className="single-features-item d-flex align-items-center bg-white p-3 rounded shadow-sm">
                    <div className="item-icon mr-15" style={{ marginRight: '15px' }}>
                      <img src="/images/icon/icon-2-1.webp" width="60" height="60" alt="Icon" />
                    </div>
                    <div className="item-content media-body">
                      <h5 className="mb-1" style={{ fontWeight: '700' }}>250+</h5>
                      <p className="mb-0 text-muted">{t('about.courses') || 'Courses'}</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 mb-20">
                  <div className="single-features-item d-flex align-items-center bg-white p-3 rounded shadow-sm">
                    <div className="item-icon mr-15" style={{ marginRight: '15px' }}>
                      <img src="/images/icon/icon-2-2.webp" width="60" height="60" alt="Icon" />
                    </div>
                    <div className="item-content media-body">
                      <h5 className="mb-1" style={{ fontWeight: '700' }}>{t('about.skillScholarships')}</h5>
                      <p className="mb-0 text-muted">Scholarships</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 mb-20">
                  <div className="single-features-item d-flex align-items-center bg-white p-3 rounded shadow-sm">
                    <div className="item-icon mr-15" style={{ marginRight: '15px' }}>
                      <img src="/images/icon/icon-2-3.webp" width="60" height="60" alt="Icon" />
                    </div>
                    <div className="item-content media-body">
                      <h5 className="mb-1" style={{ fontWeight: '700' }}>{t('about.onlineEducation')}</h5>
                      <p className="mb-0 text-muted">Education</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 mb-20">
                  <div className="single-features-item d-flex align-items-center bg-white p-3 rounded shadow-sm">
                    <div className="item-icon mr-15" style={{ marginRight: '15px' }}>
                      <img src="/images/icon/icon-2-4.webp" width="60" height="60" alt="Icon" />
                    </div>
                    <div className="item-content media-body">
                      <h5 className="mb-1" style={{ fontWeight: '700' }}>{t('about.expertTeachers')}</h5>
                      <p className="mb-0 text-muted">Teachers</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 mb-20">
                  <div className="single-features-item d-flex align-items-center bg-white p-3 rounded shadow-sm">
                    <div className="item-icon mr-15" style={{ marginRight: '15px' }}>
                      <img src="/images/icon/icon-2-5.webp" width="60" height="60" alt="Icon" />
                    </div>
                    <div className="item-content media-body">
                      <h5 className="mb-1" style={{ fontWeight: '700' }}>{t('about.afterCourseCertification')}</h5>
                      <p className="mb-0 text-muted">Certification</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 mb-20">
                  <div className="single-features-item d-flex align-items-center bg-white p-3 rounded shadow-sm">
                    <div className="item-icon mr-15" style={{ marginRight: '15px' }}>
                      <img src="/images/icon/icon-2-6.webp" width="60" height="60" alt="Icon" />
                    </div>
                    <div className="item-content media-body">
                      <h5 className="mb-1" style={{ fontWeight: '700' }}>{t('about.downloadProspectus')}</h5>
                      <p className="mb-0 text-muted">Prospectus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Campus Photo Showcase (5 items) */}
      <section className="campus-visit-area-3 py-80">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center mb-50">
              <div className="section-title-2">
                <h2 className="title">{t('about.campusEnvironment') || 'Our Campus & Learning Environment'}</h2>
                <span className="line"></span>
                <p className="mt-3 text-muted">{t('about.campusEnvironmentDesc')}</p>
              </div>
            </div>
          </div>
          {/* Row 1: 3 items */}
          <div className="row mb-30">
            <div className="col-lg-4 col-md-6 mb-30">
              <div className="campus-image-item rounded overflow-hidden shadow-sm h-100">
                <img
                  src="/images/courses/Course 6.jpg"
                  alt={t('about.laboratoryCamplex')}
                  style={{ width: '100%', height: '230px', objectFit: 'cover' }}
                />
                <div className="p-3 text-center bg-white">
                  <h6 className="mb-0 font-weight-bold" style={{ color: '#07294D' }}>
                    {t('about.laboratoryCamplex') || 'Laboratory Complex'}
                  </h6>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-30">
              <div className="campus-image-item rounded overflow-hidden shadow-sm h-100">
                <img
                  src="/images/gallery/gallery 2.jpg"
                  alt={t('about.studentActivities')}
                  style={{ width: '100%', height: '230px', objectFit: 'cover' }}
                />
                <div className="p-3 text-center bg-white">
                  <h6 className="mb-0 font-weight-bold" style={{ color: '#07294D' }}>
                    {t('about.studentActivities') || 'Student Activities'}
                  </h6>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-30">
              <div className="campus-image-item rounded overflow-hidden shadow-sm h-100">
                <img
                  src="/images/courses/Course 8.jpg"
                  alt={t('about.researchFacility')}
                  style={{ width: '100%', height: '230px', objectFit: 'cover' }}
                />
                <div className="p-3 text-center bg-white">
                  <h6 className="mb-0 font-weight-bold" style={{ color: '#07294D' }}>
                    {t('about.researchFacility') || 'Research Facility'}
                  </h6>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 2 items */}
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-6 mb-30">
              <div className="campus-image-item rounded overflow-hidden shadow-sm h-100">
                <img
                  src="/images/gallery/gallery 5.jpg"
                  alt={t('about.libraryStudyAreas')}
                  style={{ width: '100%', height: '260px', objectFit: 'cover' }}
                />
                <div className="p-3 text-center bg-white">
                  <h6 className="mb-0 font-weight-bold" style={{ color: '#07294D' }}>
                    {t('about.libraryStudyAreas') || 'Library & Study Areas'}
                  </h6>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 mb-30">
              <div className="campus-image-item rounded overflow-hidden shadow-sm h-100">
                <img
                  src="/images/gallery/gallery 6.jpg"
                  alt={t('about.campusGrounds')}
                  style={{ width: '100%', height: '260px', objectFit: 'cover' }}
                />
                <div className="p-3 text-center bg-white">
                  <h6 className="mb-0 font-weight-bold" style={{ color: '#07294D' }}>
                    {t('about.campusGrounds') || 'Campus Grounds'}
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Our Academic Programs */}
      <section className="academic-programs-area py-80" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="row align-items-center mb-50">
            <div className="col-lg-6 col-md-6 mb-20 mb-md-0">
              <div className="section-title-2">
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 700, color: '#07294D' }}>
                  {t('about.academicPrograms') || 'Our Academic Programs'}
                </h2>
                <span className="line"></span>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <p className="text-muted mb-0" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                {t('about.academicProgramsDesc') || 'Comprehensive courses designed to meet industry demands and academic excellence'}
              </p>
            </div>
          </div>

          <div className="row">
            {/* Program 1 */}
            <div className="col-lg-3 col-md-6 mb-30">
              <div className="program-card bg-white rounded overflow-hidden shadow-sm h-100">
                <div className="program-image-wrapper" style={{ height: '190px', overflow: 'hidden' }}>
                  <img
                    src="/images/courses/Course 10.jpg"
                    alt={t('about.scienceTechnology')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="p-3 text-center bg-white">
                  <h6 className="mb-0 font-weight-bold" style={{ color: '#07294D', fontSize: '0.98rem' }}>
                    {t('about.scienceTechnology') || 'Science & Technology'}
                  </h6>
                </div>
              </div>
            </div>

            {/* Program 2 */}
            <div className="col-lg-3 col-md-6 mb-30">
              <div className="program-card bg-white rounded overflow-hidden shadow-sm h-100">
                <div className="program-image-wrapper" style={{ height: '190px', overflow: 'hidden' }}>
                  <img
                    src="/images/courses/Course 6.jpg"
                    alt={t('about.researchMethods')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="p-3 text-center bg-white">
                  <h6 className="mb-0 font-weight-bold" style={{ color: '#07294D', fontSize: '0.98rem' }}>
                    {t('about.researchMethods') || 'Research Methods'}
                  </h6>
                </div>
              </div>
            </div>

            {/* Program 3 */}
            <div className="col-lg-3 col-md-6 mb-30">
              <div className="program-card bg-white rounded overflow-hidden shadow-sm h-100">
                <div className="program-image-wrapper" style={{ height: '190px', overflow: 'hidden' }}>
                  <img
                    src="/images/courses/Course 4.jpg"
                    alt={t('about.appliedSciences')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="p-3 text-center bg-white">
                  <h6 className="mb-0 font-weight-bold" style={{ color: '#07294D', fontSize: '0.98rem' }}>
                    {t('about.appliedSciences') || 'Applied Sciences'}
                  </h6>
                </div>
              </div>
            </div>

            {/* Program 4 */}
            <div className="col-lg-3 col-md-6 mb-30">
              <div className="program-card bg-white rounded overflow-hidden shadow-sm h-100">
                <div className="program-image-wrapper" style={{ height: '190px', overflow: 'hidden' }}>
                  <img
                    src="/images/courses/Course 9.jpg"
                    alt={t('about.innovationStudies')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="p-3 text-center bg-white">
                  <h6 className="mb-0 font-weight-bold" style={{ color: '#07294D', fontSize: '0.98rem' }}>
                    {t('about.innovationStudies') || 'Innovation Studies'}
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

