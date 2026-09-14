import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = () => {
  const { t, language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer-area">
      {/* Top CTA Banner */}
      <div className="footer-top-cta-banner">
        <div className="container">
          <div className="footer-cta-card">
            <div className="row align-items-center">
              <div className="col-lg-8 col-md-7">
                <div className="footer-cta-content">
                  <span className="footer-cta-badge">
                    <i className="fas fa-graduation-cap me-2"></i>
                    {language === 'km' ? 'ចាប់ផ្តើមអនាគតរបស់អ្នក' : 'Shape Your Future'}
                  </span>
                  <h3 className="footer-cta-title">
                    {language === 'km'
                      ? 'ត្រៀមខ្លួនរួចរាល់ដើម្បីក្លាយជាអ្នកជំនាញបច្ចេកវិទ្យាហើយឬនៅ?'
                      : 'Ready to Become a Certified Technical Professional?'}
                  </h3>
                  <p className="footer-cta-desc">
                    {language === 'km'
                      ? 'ចុះឈ្មោះចូលរៀនវគ្គបណ្តុះបណ្តាល TVET 1.5M ឥតគិតថ្លៃ និងអាហារូបករណ៍ ១០០% ជាមួយ RPITSSR ថ្ងៃនេះ!'
                      : 'Enroll in high-demand TVET skills and 100% scholarship programs with RPITSSR today!'}
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-5 text-md-end text-center mt-3 mt-md-0">
                <div className="footer-cta-actions">
                  <Link to="/register" onClick={scrollToTop} className="footer-btn-primary">
                    <i className="fas fa-edit me-2"></i>
                    <span>{language === 'km' ? 'ចុះឈ្មោះចូលរៀន' : 'Apply Online'}</span>
                  </Link>
                  <Link to="/contact" onClick={scrollToTop} className="footer-btn-outline">
                    <i className="fas fa-comment-dots me-2"></i>
                    <span>{language === 'km' ? 'ទំនាក់ទំនង' : 'Contact Us'}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Widget Area */}
      <div className="footer-main-widget">
        <div className="container">
          <div className="row g-4">
            {/* Column 1: School Identity & Brand (Clean, Minimal & Modern) */}
            <div className="col-lg-4 col-md-6 footer-col-brand">
              <div className="footer-brand-wrap">
                <Link to="/" onClick={scrollToTop} className="footer-logo-link">
                  <img
                    src="/images/logo.webp"
                    alt="RPITSSR Logo"
                    className="footer-logo-img"
                    onError={(e) => { e.target.src = '/images/logo.png'; }}
                  />
                </Link>

                <p className="footer-brand-desc">
                  {language === 'km'
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប — ជំនាញពិត ជីវិតប្រសើរ! បណ្តុះបណ្តាលជំនាញបច្ចេកទេស និងវិជ្ជាជីវៈ (TVET) ស្របតាមស្តង់ដារគុណភាព ISO 9001:2015។'
                    : 'Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR) — Real Skills, Better Life! Leading TVET technical education certified under ISO 9001:2015.'}
                </p>

                {/* Social Media Icons */}
                <div className="footer-social-icons">
                  <a
                    href="https://web.facebook.com/rpitssr.edu.kh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn facebook"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a
                    href="https://t.me/rpitssr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn telegram"
                    aria-label="Telegram"
                    title="Telegram"
                  >
                    <i className="fab fa-telegram-plane"></i>
                  </a>
                  <a
                    href="https://www.youtube.com/@rpitssr_edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn youtube"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a
                    href="https://www.tiktok.com/@rpitssr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn tiktok"
                    aria-label="TikTok"
                    title="TikTok"
                  >
                    <i className="fab fa-tiktok"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Our Campus */}
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="footer-nav-widget">
                <h5 className="footer-widget-heading">
                  <span>{t('footer.ourCampus') || 'បរិវេណរបស់យើង'}</span>
                  <span className="heading-line"></span>
                </h5>
                <ul className="footer-menu-list">
                  <li>
                    <Link to="/about-us" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.aboutUs') || 'អំពីយើង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/organization" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('organization.pageTitle') || 'រចនាសម្ព័ន្ធគ្រប់គ្រង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/gallery" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.campusMap') || 'ផែនទីបរិវេណ'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/gallery" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.view360') || 'ទស្សនាលម្អិត ៣៦០°'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/notice" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.noticeBoard') || 'ក្តារព័ត៌មានជូនដំណឹង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/gallery" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{language === 'km' ? 'វិចិត្រសាលរូបភាព' : 'Campus Gallery'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.contact') || 'ទំនាក់ទំនង'}</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3: Academic & Training Links */}
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="footer-nav-widget">
                <h5 className="footer-widget-heading">
                  <span>{t('footer.information') || 'ព័ត៌មានសិក្សា'}</span>
                  <span className="heading-line"></span>
                </h5>
                <ul className="footer-menu-list">
                  <li>
                    <Link to="/our-courses" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.allCourses') || 'វគ្គសិក្សាទាំងអស់'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.admission') || 'ការចូលរៀន'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/about-us" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.scholarship') || 'អាហារូបករណ៍ ១០០%'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/teachers" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.ourTeachers') || 'គ្រូបង្រៀនរបស់យើង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/events" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.ourEvents') || 'ព្រឹត្តិការណ៍របស់យើង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.blogPost') || 'ប្រកាសប្លុក'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('footer.faqs') || 'សំណួរញឹកញាប់'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/downloads" onClick={scrollToTop}>
                      <i className="fas fa-chevron-right link-arrow"></i>
                      <span>{t('downloads.pageTitle') || 'ទាញយកឯកសារ'}</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 4: Contact & Working Hours */}
            <div className="col-lg-4 col-md-4 col-sm-12">
              <div className="footer-nav-widget footer-contact-widget">
                <h5 className="footer-widget-heading">
                  <span>{t('footer.contactInfo') || 'ព័ត៌មានទំនាក់ទំនង'}</span>
                  <span className="heading-line"></span>
                </h5>

                <div className="footer-contact-items">
                  {/* Address */}
                  <div className="footer-contact-item address-item">
                    <div className="contact-icon-box">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="contact-text-box">
                      <span className="contact-label">
                        {language === 'km' ? 'ទីតាំងវិទ្យាស្ថាន' : 'Campus Location'}
                      </span>
                      <p className="contact-value">
                        {t('footer.address') || 'ភូមិបន្ទាយចាស់ សង្កាត់ស្លក្រាម ក្រុងសៀមរាប ខេត្តសៀមរាប'}
                      </p>
                    </div>
                  </div>

                  {/* Phone Numbers Grid */}
                  <div className="footer-contact-item phone-item">
                    <div className="contact-icon-box">
                      <i className="fas fa-phone-alt"></i>
                    </div>
                    <div className="contact-text-box">
                      <span className="contact-label">
                        {language === 'km' ? 'លេខទូរស័ព្ទទំនាក់ទំនង' : 'Hotline & Telephone'}
                      </span>
                      <div className="phone-pills-wrap">
                        <a href="tel:0966660306" className="phone-chip">
                          <i className="fas fa-phone-volume me-1"></i> 096 666 0306
                        </a>
                        <a href="tel:089483623" className="phone-chip">
                          <i className="fas fa-phone-volume me-1"></i> 089 483 623
                        </a>
                        <a href="tel:086924448" className="phone-chip">
                          <i className="fas fa-phone-volume me-1"></i> 086 924 448
                        </a>
                        <a href="tel:0887585693" className="phone-chip">
                          <i className="fas fa-phone-volume me-1"></i> 088 7585 693
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email & Website */}
                  <div className="footer-contact-item email-item">
                    <div className="contact-icon-box">
                      <i className="fas fa-envelope-open-text"></i>
                    </div>
                    <div className="contact-text-box">
                      <span className="contact-label">
                        {language === 'km' ? 'អ៊ីមែល និងគេហទំព័រផ្លូវការ' : 'Email & Website'}
                      </span>
                      <div className="d-flex flex-column gap-1 mt-1">
                        <a href="mailto:info@rpitssr.edu.kh" className="footer-link-highlight">
                          <i className="fas fa-paper-plane me-2 text-primary"></i> info@rpitssr.edu.kh
                        </a>
                        <a
                          href="https://www.rpitssr.edu.kh"
                          target="_blank"
                          rel="noreferrer"
                          className="footer-link-highlight"
                        >
                          <i className="fas fa-globe me-2 text-info"></i> www.rpitssr.edu.kh
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours Card */}
                  <div className="footer-working-hours-card">
                    <div className="working-hours-icon">
                      <i className="far fa-clock"></i>
                    </div>
                    <div className="working-hours-text">
                      <span className="working-title">
                        {language === 'km' ? 'ម៉ោងបម្រើការងារសិក្សាធិការ' : 'Office Working Hours'}
                      </span>
                      <p className="working-desc mb-0">
                        {language === 'km'
                          ? 'ច័ន្ទ - សុក្រ: 07:30 ព្រឹក - 05:00 ល្ងាច | សៅរ៍: 07:30 - 11:30 ព្រឹក'
                          : 'Mon - Fri: 07:30 AM - 05:00 PM | Sat: 07:30 - 11:30 AM'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Secondary Links */}
      <div className="footer-bottom-bar">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7 col-md-12 text-lg-start text-center mb-2 mb-lg-0">
              <p className="footer-copyright-text mb-0">
                {language === 'km' ? (
                  <>
                    © {currentYear}{' '}
                    <strong>វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)</strong> ។ រក្សាសិទ្ធិគ្រប់យ៉ាង ។
                    ធ្វើឡើងដោយ <span className="heart-icon">❤️</span> ជាមួយក្រុមព័ត៌មានវិទ្យា RPITSSR
                  </>
                ) : (
                  <>
                    © {currentYear}{' '}
                    <strong>Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR)</strong>. All Rights Reserved.
                    Crafted with <span className="heart-icon">❤️</span> by RPITSSR ICT Team
                  </>
                )}
              </p>
            </div>
            <div className="col-lg-5 col-md-12 text-lg-end text-center">
              <ul className="footer-bottom-links">
                <li>
                  <Link to="/about-us" onClick={scrollToTop}>
                    {language === 'km' ? 'អំពីវិទ្យាស្ថាន' : 'About Us'}
                  </Link>
                </li>
                <li>
                  <Link to="/faq" onClick={scrollToTop}>
                    {language === 'km' ? 'លក្ខខណ្ឌ' : 'Terms'}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" onClick={scrollToTop}>
                    {language === 'km' ? 'ជំនួយ & គាំទ្រ' : 'Support'}
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="footer-scroll-top-btn"
                    title={language === 'km' ? 'ឡើងទៅលើ' : 'Scroll to top'}
                  >
                    <i className="fas fa-arrow-up"></i>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
