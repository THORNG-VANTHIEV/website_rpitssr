import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Home,
  ChevronRight,
  Sparkles,
  Award,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Target,
  Compass,
  Users,
  Rocket,
  GraduationCap,
  Cpu,
  Wrench,
  Flame,
  BookOpen,
  School,
  ArrowRight,
  Quote,
  Layers,
  FileCheck2
} from 'lucide-react';

export const AboutPage = () => {
  const { t, currentLanguage } = useLanguage();
  const isKhmer = currentLanguage === 'km';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const facilities = [
    {
      id: 1,
      nameKh: 'រោងជាងវិស្វកម្មអគ្គិសនី & ស្វ័យប្រវត្តិកម្ម',
      nameEn: 'Electrical Engineering & Automation Lab',
      categoryKh: 'អគ្គិសនី & ស្វ័យប្រវត្តិកម្ម',
      categoryEn: 'Electrical & Automation',
      image: '/images/courses/Course 8.jpg',
      icon: Cpu
    },
    {
      id: 2,
      nameKh: 'បន្ទប់កុំព្យូទ័រ & បច្ចេកវិទ្យាព័ត៌មាន (ICT)',
      nameEn: 'Information & Communication Technology Lab',
      categoryKh: 'ព័ត៌មានវិទ្យា',
      categoryEn: 'ICT & Computing',
      image: '/images/courses/Course 10.jpg',
      icon: Sparkles
    },
    {
      id: 3,
      nameKh: 'រោងជាងបរិក្ខារត្រជាក់ & កម្តៅ (HVAC)',
      nameEn: 'Refrigeration & Air Conditioning Workshop',
      categoryKh: 'បរិក្ខារត្រជាក់',
      categoryEn: 'HVAC & Refrigeration',
      image: '/images/courses/Course 6.jpg',
      icon: Flame
    },
    {
      id: 4,
      nameKh: 'រោងជាងមេកានិច & គ្រឿងយន្តឧស្សាហកម្ម',
      nameEn: 'Mechanical & Automotive Workshop',
      categoryKh: 'មេកានិច & គ្រឿងយន្ត',
      categoryEn: 'Mechanics & Automotive',
      image: '/images/courses/Course 4.jpg',
      icon: Wrench
    },
    {
      id: 5,
      nameKh: 'ការសិក្សាទ្រឹស្តី និងស្រាវជ្រាវក្នុងថ្នាក់',
      nameEn: 'Theoretical Lecture & Research Classroom',
      categoryKh: 'ទ្រឹស្តី & ស្រាវជ្រាវ',
      categoryEn: 'Theory & Research',
      image: '/images/gallery/gallery 2.jpg',
      icon: BookOpen
    },
    {
      id: 6,
      nameKh: 'អគារទីចាត់ការ និងបរិវេណវិទ្យាស្ថាន',
      nameEn: 'Main Administration & Campus Grounds',
      categoryKh: 'បរិវេណវិទ្យាស្ថាន',
      categoryEn: 'Campus Grounds',
      image: '/images/gallery/school.jpg',
      icon: School
    }
  ];

  return (
    <div className="about-page-wrapper">
      {/* 1. Page Hero Banner with Breadcrumbs & Trust Badges */}
      <section className="about-page-hero">
        <div className="container">
          <div className="about-hero-content">
            {/* Breadcrumb & Institutional Badge Row with Gap */}
            <div className="about-hero-meta-row">
              <div className="about-breadcrumb">
                <Link to="/" onClick={scrollToTop}>
                  <Home size={14} />
                  <span>{isKhmer ? 'ទំព័រដើម' : 'Home'}</span>
                </Link>
                <span className="crumb-sep">
                  <ChevronRight size={13} />
                </span>
                <span className="active-crumb">
                  {isKhmer ? 'អំពីវិទ្យាស្ថាន' : 'About Us'}
                </span>
              </div>

              <div className="about-hero-badge">
                <Sparkles size={15} />
                <span>{t('about.badge_tvet') || 'គ្រឹះស្ថានអប់រំបណ្តុះបណ្តាលបច្ចេកទេស និងវិជ្ជាជីវៈរដ្ឋ'}</span>
              </div>
            </div>

            <h1 className="about-hero-title">
              {isKhmer
                ? 'អំពីវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                : 'About Regional Polytechnic Institute Techo Sen Siem Reap'}
            </h1>

            <p className="about-hero-subtitle">
              {isKhmer
                ? '«ជំនាញពិត ជីវិតប្រសើរ» — គ្រឹះស្ថានសាធារណៈឈានមុខគេក្នុងការបណ្តុះបណ្តាលបច្ចេកទេស និងវិជ្ជាជីវៈ (TVET) ប្រកបដោយគុណភាព ស្តង់ដារជាតិ និងអន្តរជាតិ ISO 9001:2015 ជាមួយឱកាសការងារខ្ពស់ជាង ៩៥%។'
                : 'Empowering Cambodian youth through world-class Technical and Vocational Education and Training (TVET) under ISO 9001:2015 international quality standards.'}
            </p>

            {/* Institutional Trust Badges */}
            <div className="about-trust-pills">
              <div className="about-trust-pill">
                <Award size={15} />
                <span>{t('about.trust_subdecree') || 'អនុក្រឹត្យលេខ ១១៧ អនក្រ.បក'}</span>
              </div>
              <div className="about-trust-pill">
                <ShieldCheck size={15} />
                <span>{t('about.trust_iso') || 'ស្តង់ដារគុណភាព ISO 9001:2015'}</span>
              </div>
              <div className="about-trust-pill">
                <Building2 size={15} />
                <span>{t('about.trust_ministry') || 'ក្រោមឱវាទក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Overview, Vision & Mission Section */}
      <section className="about-overview-section">
        <div className="container">
          <div className="row justify-content-center mb-50">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <Building2 size={14} /> {isKhmer ? 'ប្រវត្តិ និងអត្តសញ្ញាណ' : 'Profile & Identity'}
                </span>
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                  {isKhmer ? 'សាវតារ និងទិសដៅយុទ្ធសាស្ត្ររបស់វិទ្យាស្ថាន' : 'Institutional Background & Strategic Direction'}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {isKhmer
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប បានប្តេជ្ញាចិត្តយ៉ាងមុតមាំក្នុងការអភិវឌ្ឍធនធានមនុស្សជំនាញឆ្លើយតបនឹងបដិវត្តន៍ឧស្សាហកម្ម ៤.០'
                    : 'RPITSSR is firmly committed to human capital development and industrial readiness in the Industry 4.0 era.'}
                </p>
              </div>
            </div>
          </div>

          <div className="row align-items-center mb-50">
            <div className="col-lg-6">
              <div className="about-narrative-card">
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginBottom: '16px' }}>
                  {t('about.aboutInstitute') || 'អំពីវិទ្យាស្ថាន'}
                </h3>
                <p className="about-narrative-lead">
                  {t('about.about_description')}
                </p>
                <p className="about-narrative-text">
                  {isKhmer
                    ? 'វិទ្យាស្ថានត្រូវបានបំពាក់ដោយសម្ភារៈឧបករណ៍បច្ចេកវិទ្យាទំនើបៗ រោងជាងស្ដង់ដារឧស្សាហកម្ម និងបន្ទប់ពិសោធន៍អនុវត្តជាក់ស្តែង ដើម្បីធានាឱ្យសិស្ស និស្សិតមានជំនាញច្បាស់លាស់ អាចបំពេញការងារបានភ្លាមៗក្រោយពេលបញ្ចប់ការសិក្សា។'
                    : 'Equipped with cutting-edge training machinery, modern engineering laboratories, and real-world industrial workshops, ensuring all graduates are job-ready immediately upon graduation.'}
                </p>

                <div className="about-feature-points">
                  <div className="about-feature-point">
                    <div className="about-feature-check">
                      <CheckCircle2 size={14} />
                    </div>
                    <span>{t('about.features.feature1') || 'សាស្ត្រាចារ្យដែលមានគុរុកោសល្យខ្ពស់ និងសមត្ថភាពគ្រប់គ្រាន់'}</span>
                  </div>
                  <div className="about-feature-point">
                    <div className="about-feature-check">
                      <CheckCircle2 size={14} />
                    </div>
                    <span>{t('about.features.feature2') || 'វិធីសាស្ត្រក្នុងការបង្រៀន និងការបណ្តុះបណ្តាលប្រកបដោយប្រសិទ្ធភាពខ្ពស់'}</span>
                  </div>
                  <div className="about-feature-point">
                    <div className="about-feature-check">
                      <CheckCircle2 size={14} />
                    </div>
                    <span>{t('about.features.feature3') || 'ការសិក្សាទាំងទ្រឹស្តី និងអនុវត្តន៍ដោយយកចិត្តទុកដាក់'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-photo-wrapper">
                <img
                  src="/images/teacher-all.jpg"
                  alt="RPITSSR Faculty and Leadership"
                  loading="lazy"
                />
                <div className="about-photo-badge">
                  <span>🏛️ {isKhmer ? 'គណៈគ្រប់គ្រង និងសាស្រ្តាចារ្យ RPITSSR' : 'RPITSSR Leadership & Faculty'}</span>
                  <span style={{ color: '#ffaf00' }}>105+ {isKhmer ? 'រូប' : 'Staff'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vision & Mission Row: 2 Crisp White Cards */}
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="about-vm-card">
                <div className="vm-icon-badge blue">
                  <Compass size={28} />
                </div>
                <h4>{t('about.vision') || 'ចក្ខុវិស័យ (Our Vision)'}</h4>
                <p>{t('about.vision_text')}</p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-vm-card">
                <div className="vm-icon-badge amber">
                  <Target size={28} />
                </div>
                <h4>{t('about.mission') || 'បេសកកម្ម (Our Mission)'}</h4>
                <p>{t('about.mission_text')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. History & Milestones Section */}
      <section className="about-history-section">
        <div className="container">
          <div className="row justify-content-center mb-50">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <Award size={14} /> {isKhmer ? 'ប្រវត្តិ និងកេរ្តិ៍ឈ្មោះ' : 'History & Growth'}
                </span>
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                  {t('about.historyReputation') || 'ប្រវត្តិ និងកេរ្តិ៍ឈ្មោះវិទ្យាស្ថាន'}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {isKhmer
                    ? 'ដំណើរវិវត្តន៍ឥតឈប់ឈរក្រោមកិច្ចដឹកនាំរបស់រាជរដ្ឋាភិបាល និងក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ'
                    : 'Continuous institutional evolution under the Royal Government of Cambodia and MLVT.'}
                </p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="about-history-card">
                <div className="history-header">
                  <div className="history-icon-badge">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4>{t('about.leadershipGrowth') || 'ការដឹកនាំ និងកំណើនសិស្ស'}</h4>
                    <span style={{ fontSize: '0.82rem', color: '#1e73be', fontWeight: 700 }}>
                      {isKhmer ? 'សមិទ្ធផលស្ថាប័ន' : 'Institutional Growth'}
                    </span>
                  </div>
                </div>
                <p>{t('about.leadershipGrowthDesc')}</p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-history-card">
                <div className="history-header">
                  <div className="history-icon-badge">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h4>{t('about.teachersExpertise') || 'សាស្ត្រាចារ្យ និងការបណ្តុះបណ្តាល'}</h4>
                    <span style={{ fontSize: '0.82rem', color: '#1e73be', fontWeight: 700 }}>
                      {isKhmer ? 'គុណវុឌ្ឍិគរុកោសល្យ' : 'Pedagogical Excellence'}
                    </span>
                  </div>
                </div>
                <p>{t('about.teachersExpertiseDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Values Section (3 Crisp White Cards) */}
      <section className="about-values-section">
        <div className="container">
          <div className="row justify-content-center mb-50">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <Sparkles size={14} /> {isKhmer ? 'គុណតម្លៃស្ថាប័ន' : 'Core Values'}
                </span>
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                  {t('about.values_title') || 'គុណតម្លៃស្នូល RPITSSR'}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {isKhmer
                    ? 'គោលការណ៍គ្រឹះទាំង ៣ ដែលជាត្រីវិស័យក្នុងការដឹកនាំ និងការបណ្តុះបណ្តាលធនធានមនុស្សនៅ RPITSSR'
                    : 'The three core foundational pillars guiding educational excellence and institutional integrity at RPITSSR.'}
                </p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Value 1: Reliable */}
            <div className="col-lg-4 col-md-6">
              <div className="about-value-card">
                <div className="about-value-icon-badge blue">
                  <ShieldCheck size={32} />
                </div>
                <h4>{t('about.reliable') || 'ទំនុកចិត្ត (Reliable)'}</h4>
                <p>{t('about.reliableDesc')}</p>
              </div>
            </div>

            {/* Value 2: Productivity */}
            <div className="col-lg-4 col-md-6">
              <div className="about-value-card">
                <div className="about-value-icon-badge green">
                  <Rocket size={32} />
                </div>
                <h4>{t('about.productivity') || 'ផលិតភាព (Productivity)'}</h4>
                <p>{t('about.productivityDesc')}</p>
              </div>
            </div>

            {/* Value 3: Sustainability */}
            <div className="col-lg-4 col-md-6">
              <div className="about-value-card">
                <div className="about-value-icon-badge purple">
                  <Users size={32} />
                </div>
                <h4>{t('about.sustainability') || 'និរន្តរភាព (Sustainability)'}</h4>
                <p>{t('about.sustainabilityDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Director's Message Section */}
      <section className="about-director-section">
        <div className="container" style={{ maxWidth: '1080px' }}>
          <div className="row justify-content-center mb-40">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <Quote size={14} /> {t('about.welcome_from_leadership') || 'សារស្វាគមន៍ពីថ្នាក់ដឹកនាំ'}
                </span>
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                  {t('about.directorMessageTitle') || 'សាររបស់នាយិកាវិទ្យាស្ថាន'}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="about-director-card">
                <div className="director-quote-badge">
                  <Quote size={24} />
                </div>

                <p className="director-message-quote">
                  "{t('about.directorMessageContent')}"
                </p>

                <div className="director-divider-line"></div>

                <div className="director-seal-badge">
                  <img
                    src="/images/rpitssr-seal.png"
                    alt="RPITSSR Official Seal"
                  />
                </div>

                <h4 className="director-name">
                  {t('about.directorTitleName') || (isKhmer ? 'លោកស្រី នាយិកាវិទ្យាស្ថាន' : 'Director of the Institute')}
                </h4>
                <p className="director-institute">
                  {t('about.instituteName') || (isKhmer ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប' : 'Regional Polytechnic Institute Techo Sen Siem Reap')}
                </p>

                <div>
                  <Link
                    to="/organization"
                    onClick={scrollToTop}
                    className="director-org-btn"
                  >
                    <Users size={16} />
                    <span>{isKhmer ? 'រចនាសម្ព័ន្ធគ្រប់គ្រង និងថ្នាក់ដឹកនាំ' : 'Organizational Structure & Leadership'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Facilities & Labs Showcase Section */}
      <section className="about-facilities-section">
        <div className="container">
          <div className="row justify-content-center mb-50">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <Building2 size={14} /> {isKhmer ? 'ហេដ្ឋារចនាសម្ព័ន្ធបណ្តុះបណ្តាល' : 'Facilities & Labs'}
                </span>
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                  {t('about.campusEnvironment') || 'បរិវេណសិក្សា រោងជាង និងបន្ទប់ពិសោធន៍បច្ចេកវិទ្យា'}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {t('about.campusEnvironmentDesc') || 'ទស្សនាហេដ្ឋារចនាសម្ព័ន្ធបណ្តុះបណ្តាលបច្ចេកទេស បរិក្ខារពិសោធន៍ទំនើប និងបរិយាកាសសិក្សាជាក់ស្តែងនៅ RPITSSR'}
                </p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {facilities.map((facility) => {
              const FacilityIcon = facility.icon;
              return (
                <div key={facility.id} className="col-lg-4 col-md-6">
                  <div className="about-facility-card">
                    <div className="about-facility-img-wrap">
                      <img
                        src={facility.image}
                        alt={isKhmer ? facility.nameKh : facility.nameEn}
                        loading="lazy"
                      />
                      <div className="facility-category-badge">
                        <FacilityIcon size={12} />
                        <span>{isKhmer ? facility.categoryKh : facility.categoryEn}</span>
                      </div>
                    </div>
                    <div className="about-facility-body">
                      <h5>{isKhmer ? facility.nameKh : facility.nameEn}</h5>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Educational Pathways & Action Gateways */}
      <section className="about-pathways-section">
        <div className="container">
          <div className="row justify-content-center mb-50">
            <div className="col-lg-8 text-center">
              <div className="section-title-2">
                <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  <Layers size={14} /> {isKhmer ? 'កម្រិតបណ្តុះបណ្តាល' : 'Academic Levels'}
                </span>
                <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                  {t('about.pathways_title') || 'កម្រិតបណ្តុះបណ្តាល និងច្រកទ្វារអនាគត'}
                </h2>
                <span className="line" style={{ margin: '12px auto' }}></span>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                  {t('about.pathways_desc') || 'វិទ្យាស្ថានផ្តល់ជូននូវកម្មវិធីបណ្តុះបណ្តាលចម្រុះកម្រិត ចាប់ពីវគ្គជំនាញពិសេស TVET រហូតដល់កម្រិតបរិញ្ញាបត្របច្ចេកវិទ្យា'}
                </p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Pathway 1: Bachelor */}
            <div className="col-lg-4 col-md-6">
              <div className="about-pathway-card">
                <div className="pathway-level-tag blue">
                  <GraduationCap size={14} />
                  <span>{isKhmer ? 'កម្មវិធី ៤ ឆ្នាំ' : '4-Year Degree'}</span>
                </div>
                <h4>{t('about.degree_bachelor') || 'កម្រិតបរិញ្ញាបត្របច្ចេកវិទ្យា (B.Tech)'}</h4>
                <p>{t('about.degree_bachelor_desc')}</p>
              </div>
            </div>

            {/* Pathway 2: Higher Diploma */}
            <div className="col-lg-4 col-md-6">
              <div className="about-pathway-card">
                <div className="pathway-level-tag purple">
                  <Award size={14} />
                  <span>{isKhmer ? 'កម្មវិធី ២ ឆ្នាំ (អនុវត្ត ៧០%)' : '2-Year Associate (70% Practical)'}</span>
                </div>
                <h4>{t('about.degree_diploma') || 'កម្រិតសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (Higher Diploma)'}</h4>
                <p>{t('about.degree_diploma_desc')}</p>
              </div>
            </div>

            {/* Pathway 3: TVET 1.5M */}
            <div className="col-lg-4 col-md-6">
              <div className="about-pathway-card">
                <div className="pathway-level-tag amber">
                  <Sparkles size={14} />
                  <span>{isKhmer ? 'អាហារូបករណ៍ ១០០% ឥតគិតថ្លៃ' : '100% Free Scholarship'}</span>
                </div>
                <h4>{t('about.degree_tvet_special') || 'វគ្គបណ្តុះបណ្តាលជំនាញ TVET ១,៥លាននាក់'}</h4>
                <p>{t('about.degree_tvet_special_desc')}</p>
              </div>
            </div>
          </div>

          {/* Action Gateways Row */}
          <div className="about-pathways-actions">
            <Link
              to="/courses"
              onClick={scrollToTop}
              className="about-pathways-btn-primary"
            >
              <BookOpen size={16} />
              <span>{isKhmer ? 'ស្វែងយល់ពីមុខវិជ្ជាទាំងអស់' : 'Explore All Courses'}</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/register"
              onClick={scrollToTop}
              className="about-pathways-btn-secondary"
            >
              <FileCheck2 size={16} />
              <span>{isKhmer ? 'ចុះឈ្មោះចូលរៀនតាមអនឡាញ' : 'Register / Apply Online'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
