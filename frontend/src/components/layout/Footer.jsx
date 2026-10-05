import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Edit3,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowUp,
  ChevronRight,
  ChevronDown,
  Compass,
  Award,
  FileText,
  Bell,
  Download,
  PhoneCall,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// SVG Brand Icons for 100% reliable rendering without icon font dependencies
const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TelegramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const YouTubeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TikTokIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.83c-.02 2.06-.7 4.13-2.02 5.72-1.64 2.01-4.21 3.12-6.78 2.94-2.54-.15-4.9-1.47-6.26-3.61-1.37-2.12-1.52-4.88-.41-7.14 1.1-2.28 3.38-3.83 5.91-4.04v4.06c-1.28.16-2.48.9-3.05 2.06-.58 1.13-.48 2.56.25 3.6 1.01 1.44 2.98 1.94 4.54 1.16.89-.43 1.47-1.33 1.54-2.31.04-2.73.02-5.46.02-8.19V0z"/>
  </svg>
);

export const Footer = () => {
  const { t, language } = useLanguage();
  const [expandedAccordions, setExpandedAccordions] = useState({
    campus: false,
    info: false,
    quickLinks: false,
    mobilePrograms: false,
    mobileCampus: false,
  });

  const toggleAccordion = (key) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer-area">

      {/* Main Footer Widget Area */}
      <div className="footer-main-widget">
        <div className="container">
          {/* Desktop Full Widget Grid (Shown on screens >= 768px) */}
          <div className="footer-desktop-view">
            <div className="row g-4">
            {/* Column 1: School Identity & Brand with Crisp White Logo Badge */}
            <div className="col-lg-4 col-md-6 footer-col-brand">
              <div className="footer-brand-wrap">
                <Link to="/" onClick={scrollToTop} className="footer-logo-link">
                  <div className="footer-logo-badge">
                    <img
                      src="/images/logo.webp"
                      alt="RPITSSR Logo"
                      className="footer-logo-img"
                      onError={(e) => { e.target.src = '/images/logo.png'; }}
                    />
                  </div>
                </Link>

                <p className="footer-brand-desc">
                  {language === 'km'
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប — ជំនាញពិត ជីវិតប្រសើរ! បណ្តុះបណ្តាលជំនាញបច្ចេកទេស និងវិជ្ជាជីវៈ (TVET) ស្របតាមស្តង់ដារគុណភាព ISO 9001:2015។'
                    : 'Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR) — Real Skills, Better Life! Leading TVET technical education certified under ISO 9001:2015.'}
                </p>

                {/* Social Media Icons */}
                <div className="footer-social-icons">
                  <a
                    href="https://web.facebook.com/rpitssr.page"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn facebook"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <FacebookIcon size={18} />
                  </a>
                  <a
                    href="https://qrcode.rpitssr.edu.kh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn telegram"
                    aria-label="Telegram"
                    title="Telegram"
                  >
                    <TelegramIcon size={18} />
                  </a>
                  <a
                    href="https://www.youtube.com/@rpitssr_edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn youtube"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <YouTubeIcon size={18} />
                  </a>
                  <a
                    href="https://tiktok.com/@rpitssr_edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn tiktok"
                    aria-label="TikTok"
                    title="TikTok"
                  >
                    <TikTokIcon size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Our Campus */}
            <div className="col-lg-2 col-md-4 col-sm-6 footer-accordion-col">
              <div className={`footer-nav-widget ${expandedAccordions.campus ? 'is-expanded' : ''}`}>
                <button
                  type="button"
                  className="footer-widget-heading footer-accordion-toggle"
                  onClick={() => toggleAccordion('campus')}
                  aria-expanded={expandedAccordions.campus}
                >
                  <div className="footer-heading-text-wrap">
                    <span>{t('footer.ourCampus') || 'បរិវេណរបស់យើង'}</span>
                    <span className="heading-line"></span>
                  </div>
                  <ChevronDown size={18} className="footer-accordion-icon" />
                </button>
                <ul className="footer-menu-list">
                  <li>
                    <Link to="/about-us" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.aboutUs') || 'អំពីយើង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/organization" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('organization.pageTitle') || 'រចនាសម្ព័ន្ធគ្រប់គ្រង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/gallery" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.campusMap') || 'ផែនទីបរិវេណ'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/gallery" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.view360') || 'ទស្សនាលម្អិត ៣៦០°'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/notice" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.noticeBoard') || 'ក្តារព័ត៌មានជូនដំណឹង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/gallery" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{language === 'km' ? 'វិចិត្រសាលរូបភាព' : 'Campus Gallery'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/library" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{language === 'km' ? 'បណ្ណាល័យអេឡិចត្រូនិក' : 'E-Library Catalog'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.contact') || 'ទំនាក់ទំនង'}</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3: Academic & Training Links */}
            <div className="col-lg-2 col-md-4 col-sm-6 footer-accordion-col">
              <div className={`footer-nav-widget ${expandedAccordions.info ? 'is-expanded' : ''}`}>
                <button
                  type="button"
                  className="footer-widget-heading footer-accordion-toggle"
                  onClick={() => toggleAccordion('info')}
                  aria-expanded={expandedAccordions.info}
                >
                  <div className="footer-heading-text-wrap">
                    <span>{t('footer.information') || 'ព័ត៌មាន'}</span>
                    <span className="heading-line"></span>
                  </div>
                  <ChevronDown size={18} className="footer-accordion-icon" />
                </button>
                <ul className="footer-menu-list">
                  <li>
                    <Link to="/our-courses" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.allCourses') || 'វគ្គសិក្សាទាំងអស់'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/apply" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.admission') || 'ការចូលរៀន'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/about-us" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.scholarship') || 'អាហារូបករណ៍ ១០០%'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/teachers" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.ourTeachers') || 'គ្រូបង្រៀនរបស់យើង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/events" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.ourEvents') || 'ព្រឹត្តិការណ៍របស់យើង'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.blogPost') || 'ប្រកាសប្លុក'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('footer.faqs') || 'សំណួរញឹកញាប់'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/downloads" onClick={scrollToTop}>
                      <ChevronRight size={14} className="link-arrow" />
                      <span>{t('downloads.pageTitle') || 'មជ្ឈមណ្ឌលទាញយកឯកសារ'}</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 4: Contact & Working Hours */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="footer-nav-widget footer-contact-widget">
                <h5 className="footer-widget-heading">
                  <span>{t('footer.contactInfo') || 'ព័ត៌មានទំនាក់ទំនង'}</span>
                  <span className="heading-line"></span>
                </h5>

                <div className="footer-contact-items">
                  {/* Address */}
                  <div className="footer-contact-item address-item">
                    <div className="contact-icon-box">
                      <MapPin size={18} />
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
                      <Phone size={18} />
                    </div>
                    <div className="contact-text-box">
                      <span className="contact-label">
                        {language === 'km' ? 'លេខទូរស័ព្ទទំនាក់ទំនង' : 'Hotline & Telephone'}
                      </span>
                      <div className="phone-pills-wrap">
                        <a href="tel:0966660306" className="phone-chip">
                          <Phone size={12} className="me-1" /> 096 666 0306
                        </a>
                        <a href="tel:089483623" className="phone-chip">
                          <Phone size={12} className="me-1" /> 089 483 623
                        </a>
                        <a href="tel:086924448" className="phone-chip">
                          <Phone size={12} className="me-1" /> 086 924 448
                        </a>
                        <a href="tel:0887585693" className="phone-chip">
                          <Phone size={12} className="me-1" /> 088 7585 693
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email & Website */}
                  <div className="footer-contact-item email-item">
                    <div className="contact-icon-box">
                      <Mail size={18} />
                    </div>
                    <div className="contact-text-box">
                      <span className="contact-label">
                        {language === 'km' ? 'អ៊ីមែល និងគេហទំព័រផ្លូវការ' : 'Email & Website'}
                      </span>
                      <div className="d-flex flex-column gap-2 mt-1">
                        <a href="mailto:info@rpitssr.edu.kh" className="footer-link-highlight">
                          <Mail size={14} className="me-2" style={{ color: '#ffaf00' }} /> info@rpitssr.edu.kh
                        </a>
                        <a
                          href="https://www.rpitssr.edu.kh"
                          target="_blank"
                          rel="noreferrer"
                          className="footer-link-highlight"
                        >
                          <Globe size={14} className="me-2" style={{ color: '#60a5fa' }} /> www.rpitssr.edu.kh
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours Card */}
                  <div className="footer-working-hours-card">
                    <div className="working-hours-icon">
                      <Clock size={20} />
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

        {/* Mobile Modern Institutional View (Screens < 768px) */}
        <div className="footer-mobile-minimal-view">
          <div className="container">
            {/* 1. Institutional Brand Identity Header */}
            <div className="footer-mobile-brand-hub">
              <Link to="/" onClick={scrollToTop} className="footer-mobile-brand-link">
                <div className="footer-mobile-emblem-wrap">
                  <img
                    src="/images/rpitssr-seal.png"
                    alt="RPITSSR Seal"
                    className="footer-mobile-seal-img"
                  />
                </div>
                <h4 className="footer-mobile-inst-name">
                  {language === 'km'
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                    : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                </h4>
                <div className="footer-mobile-inst-sub">
                  <span>RPITSSR • SIEM REAP, CAMBODIA</span>
                </div>
              </Link>

              <div className="footer-mobile-motto-tag">
                <GraduationCap size={13} className="text-warning" />
                <span>{language === 'km' ? 'ជំនាញពិត ជីវិតប្រសើរ • ISO 9001:2015' : 'Real Skills, Better Life • ISO Certified'}</span>
              </div>

              {/* Social Media Row */}
              <div className="footer-mobile-social-row">
                <a
                  href="https://web.facebook.com/rpitssr.page"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn facebook"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <FacebookIcon size={18} />
                </a>
                <a
                  href="https://qrcode.rpitssr.edu.kh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn telegram"
                  aria-label="Telegram"
                  title="Telegram"
                >
                  <TelegramIcon size={18} />
                </a>
                <a
                  href="https://www.youtube.com/@rpitssr_edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn youtube"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <YouTubeIcon size={18} />
                </a>
                <a
                  href="https://tiktok.com/@rpitssr_edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn tiktok"
                  aria-label="TikTok"
                  title="TikTok"
                >
                  <TikTokIcon size={18} />
                </a>
              </div>
            </div>

            {/* 2. Unified Institutional Direct Contact Hub Card */}
            <div className="footer-mobile-contact-card">
              {/* Direct Hotline Row */}
              <div className="footer-mobile-hotline-row">
                <div className="footer-mobile-contact-icon phone">
                  <PhoneCall size={18} />
                </div>
                <div className="footer-mobile-contact-info">
                  <span className="contact-sub-label">
                    {language === 'km' ? 'ទូរស័ព្ទប្រឹក្សាយោបល់ (Hotline)' : 'Student Advisory Hotline'}
                  </span>
                  <div className="contact-numbers-wrap">
                    <a href="tel:0966660306" className="contact-phone-link">096 666 0306</a>
                    <span className="contact-phone-divider">/</span>
                    <a href="tel:089483623" className="contact-phone-link">089 483 623</a>
                  </div>
                </div>
                <a href="tel:0966660306" className="footer-mobile-call-btn">
                  <Phone size={12} />
                  <span>{language === 'km' ? 'ហៅចេញ' : 'Call'}</span>
                </a>
              </div>

              <div className="footer-mobile-card-divider"></div>

              {/* 2-Column Quick Gateways */}
              <div className="footer-mobile-gateways-grid">
                <a
                  href="https://qrcode.rpitssr.edu.kh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-mobile-gateway-item"
                >
                  <div className="gateway-icon-circle telegram">
                    <TelegramIcon size={16} />
                  </div>
                  <div className="gateway-text-col">
                    <span className="gateway-lbl">{language === 'km' ? 'តេឡេក្រាមផ្លូវការ' : 'Telegram'}</span>
                    <span className="gateway-val">qrcode.rpitssr.edu.kh</span>
                  </div>
                </a>

                <Link
                  to="/contact"
                  onClick={scrollToTop}
                  className="footer-mobile-gateway-item"
                >
                  <div className="gateway-icon-circle location">
                    <MapPin size={15} />
                  </div>
                  <div className="gateway-text-col">
                    <span className="gateway-lbl">{language === 'km' ? 'ទីតាំងវិទ្យាស្ថាន' : 'Campus Location'}</span>
                    <span className="gateway-val">{language === 'km' ? 'ក្រុងសៀមរាប' : 'Siem Reap'}</span>
                  </div>
                </Link>
              </div>

              <div className="footer-mobile-card-divider"></div>

              {/* Working Hours Row */}
              <div className="footer-mobile-hours-row">
                <Clock size={14} className="hours-gold-icon" />
                <span>
                  {language === 'km'
                    ? 'ម៉ោងធ្វើការ៖ ច័ន្ទ - សុក្រ 07:30 - 17:00 | សៅរ៍ 07:30 - 11:30'
                    : 'Hours: Mon - Fri 07:30 - 17:00 | Sat 07:30 - 11:30'}
                </span>
              </div>
            </div>

            {/* 3. Mobile Navigation Drawers (Interactive Accordions) */}
            <div className="footer-mobile-accordions-group">
              {/* Drawer 1: Programs & TVET */}
              <div className={`footer-mobile-accordion ${expandedAccordions.mobilePrograms ? 'open' : ''}`}>
                <button
                  type="button"
                  className="footer-mobile-acc-btn"
                  onClick={() => toggleAccordion('mobilePrograms')}
                  aria-expanded={expandedAccordions.mobilePrograms}
                >
                  <div className="d-flex align-items-center gap-2">
                    <GraduationCap size={16} className="acc-icon-programs" />
                    <span className="footer-mobile-acc-title">
                      {language === 'km' ? 'កម្មវិធីបណ្តុះបណ្តាល & TVET' : 'Academic & TVET Programs'}
                    </span>
                  </div>
                  <ChevronDown size={16} className="footer-mobile-acc-chevron" />
                </button>
                {expandedAccordions.mobilePrograms && (
                  <div className="footer-mobile-acc-content">
                    <ul className="footer-mobile-links-list">
                      <li>
                        <Link to="/our-courses" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'វគ្គសិក្សា និងជំនាញទាំងអស់' : 'All Training Courses'}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/apply" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'ការចុះឈ្មោះចូលរៀន TVET' : 'Admissions & Enrollment'}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/about-us" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'អាហារូបករណ៍ ១.៥ លាននាក់' : 'Govt 1.5M TVET Scholarships'}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/exam-results" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'ពិនិត្យលទ្ធផលប្រឡង' : 'Check Exam Results'}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/teachers" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'គ្រូបង្រៀន & អ្នកជំនាញ' : 'Faculty & Instructors'}</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Drawer 2: Campus & Services */}
              <div className={`footer-mobile-accordion ${expandedAccordions.mobileCampus ? 'open' : ''}`}>
                <button
                  type="button"
                  className="footer-mobile-acc-btn"
                  onClick={() => toggleAccordion('mobileCampus')}
                  aria-expanded={expandedAccordions.mobileCampus}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Compass size={16} className="acc-icon-campus" />
                    <span className="footer-mobile-acc-title">
                      {language === 'km' ? 'ស្ថាប័ន & សេវាកម្មសិស្ស' : 'Campus & Student Services'}
                    </span>
                  </div>
                  <ChevronDown size={16} className="footer-mobile-acc-chevron" />
                </button>
                {expandedAccordions.mobileCampus && (
                  <div className="footer-mobile-acc-content">
                    <ul className="footer-mobile-links-list">
                      <li>
                        <Link to="/about-us" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'អំពីវិទ្យាស្ថាន RPITSSR' : 'About RPITSSR'}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/organization" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'រចនាសម្ព័ន្ធគ្រប់គ្រងស្ថាប័ន' : 'Management & Structure'}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/downloads" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'មជ្ឈមណ្ឌលទាញយកឯកសារ' : 'Document Download Center'}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/library" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'បណ្ណាល័យអេឡិចត្រូនិក' : 'E-Library Catalog'}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/faq" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'សំណួរញឹកញាប់ (FAQ)' : 'Frequently Asked Questions'}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/events" onClick={scrollToTop}>
                          <ChevronRight size={13} />
                          <span>{language === 'km' ? 'ព្រឹត្តិការណ៍ & សកម្មភាព' : 'Events & Campus Life'}</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Dedicated Non-Overlapping Back to Top Button on Mobile */}
            <div className="footer-mobile-scroll-top-area">
              <button
                type="button"
                onClick={scrollToTop}
                className="footer-mobile-scroll-btn"
                aria-label="Scroll to top"
              >
                <ArrowUp size={15} />
                <span>{language === 'km' ? 'ត្រឡប់ទៅលើវិញ' : 'Back to Top'}</span>
              </button>
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
                    <span className="footer-copy-desktop">
                      © {currentYear}{' '}
                      <strong>វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)</strong> ។ រក្សាសិទ្ធិគ្រប់យ៉ាង ។
                      ធ្វើឡើងដោយ <span className="heart-icon">❤️</span> ជាមួយក្រុមព័ត៌មានវិទ្យា RPITSSR
                    </span>
                    <span className="footer-copy-mobile">
                      © {currentYear} <strong>RPITSSR</strong> • រក្សាសិទ្ធិគ្រប់យ៉ាង
                    </span>
                  </>
                ) : (
                  <>
                    <span className="footer-copy-desktop">
                      © {currentYear}{' '}
                      <strong>Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR)</strong>. All Rights Reserved.
                      Crafted with <span className="heart-icon">❤️</span> by RPITSSR ICT Team
                    </span>
                    <span className="footer-copy-mobile">
                      © {currentYear} <strong>RPITSSR</strong> • All Rights Reserved
                    </span>
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
                    {language === 'km' ? 'សំណួរញឹកញាប់' : 'FAQ'}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" onClick={scrollToTop}>
                    {language === 'km' ? 'ជំនួយ & គាំទ្រ' : 'Support'}
                  </Link>
                </li>
                <li className="d-none d-md-inline-block">
                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="footer-scroll-top-btn"
                    title={language === 'km' ? 'ឡើងទៅលើ' : 'Scroll to top'}
                  >
                    <ArrowUp size={16} />
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
