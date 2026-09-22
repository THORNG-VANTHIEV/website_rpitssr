import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Home,
  GraduationCap,
  Award,
  FileDown,
  Newspaper,
  Bell,
  Calendar,
  Image as ImageIcon,
  Info,
  Users,
  HelpCircle,
  PhoneCall,
  Compass,
  ShieldCheck,
  UserCheck,
  LogIn,
  UserPlus,
  LogOut,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Phone,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { KhmerCalendar } from '../../utils/khmerCalendar';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, currentLanguage, language } = useLanguage();
  const isKhmer = currentLanguage === 'km' || language === 'km';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeDrawerGroup, setActiveDrawerGroup] = useState(() => {
    const path = location.pathname;
    if (['/blog', '/notice', '/events', '/gallery'].some((p) => path.startsWith(p))) {
      return 'media';
    }
    if (['/about-us', '/organization', '/faq', '/contact'].some((p) => path.startsWith(p))) {
      return 'about';
    }
    return 'academic';
  });

  const toggleDrawerGroup = (groupKey) => {
    setActiveDrawerGroup((prev) => (prev === groupKey ? null : groupKey));
  };

  const isUserAdmin = user?.role === 'admin' || user?.role === 'sub_admin';
  const dashboardPath = isUserAdmin ? '/admin-panel' : '/student-dashboard';
  const dashboardLabel = isUserAdmin ? 'Admin Panel' : 'Dashboard';

  // Calculate Khmer Lunar Date
  const khmerDate = useMemo(() => {
    try {
      const now = new Date();
      const parts = KhmerCalendar.getKhmerLunarString(now).split('\n');
      return {
        lunar: parts[0] || '',
        gregorian: parts[1] || ''
      };
    } catch {
      return null;
    }
  }, []);

  // Lock background body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  // Sticky header on scroll with hysteresis and smooth performance to prevent flutter/jitter
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Hysteresis threshold: only stick when scrolling past 130px, unstick when scrolling back above 50px
          if (scrollY > 130) {
            setIsSticky(true);
          } else if (scrollY < 50) {
            setIsSticky(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const isActive = (path) => {
    if (path === '/our-courses' || path === '/courses') {
      return location.pathname === '/our-courses' || location.pathname === '/courses' || location.pathname.startsWith('/courses-details') ? 'active' : '';
    }
    if (path === '/about-us' || path === '/about') {
      return location.pathname === '/about-us' || location.pathname === '/about' ? 'active' : '';
    }
    if (path === '/organization' || path === '/leadership') {
      return location.pathname === '/organization' || location.pathname === '/leadership' || location.pathname === '/org-chart' ? 'active' : '';
    }
    if (path === '/downloads' || path === '/download-center' || path === '/forms') {
      return location.pathname === '/downloads' || location.pathname === '/download-center' || location.pathname === '/forms' ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      closeMobileMenu();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="modern-header">
        {/* Top Header Bar */}
        <div className="modern-header-top">
          <div className="modern-container">
            <div className="modern-top-content">
              {/* Left Contact & Khmer Lunar Calendar */}
              <div className="modern-top-left">
                <i className="fas fa-envelope icon-inline"></i>
                <a href="mailto:info@rpitssr.edu.kh" className="modern-link">
                  info@rpitssr.edu.kh
                </a>
                {khmerDate && (
                  <>
                    <span className="header-separator">|</span>
                    <i className="far fa-calendar-alt icon-inline" style={{ fontSize: '15px', color: '#fff', opacity: 0.9 }}></i>
                    <span className="khmer-lunar-date">
                      <span>{khmerDate.lunar}</span>
                      <span className="khmer-lunar-gregorian">{khmerDate.gregorian}</span>
                    </span>
                  </>
                )}
              </div>

              {/* Right Quick Links & Auth */}
              <div className="modern-top-right">
                <Link
                  className={`modern-top-link ${isActive('/downloads')}`}
                  to="/downloads"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-file-download me-1"></i>
                  {t('nav.downloads') || 'Downloads'}
                </Link>
                <Link
                  className={`modern-top-link ${isActive('/exam-result')}`}
                  to="/exam-result"
                  onClick={closeMobileMenu}
                >
                  {t('nav.examResult') || 'Exam Result'}
                </Link>
                <Link
                  className={`modern-top-link ${isActive('/notice')}`}
                  to="/notice"
                  onClick={closeMobileMenu}
                >
                  {t('nav.notice') || 'Notice'}
                </Link>
                <Link
                  className={`modern-top-link ${isActive('/events')}`}
                  to="/events"
                  onClick={closeMobileMenu}
                >
                  {t('nav.events') || 'Events'}
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      className={`modern-top-link auth-link ${isActive(dashboardPath)}`}
                      to={dashboardPath}
                      onClick={closeMobileMenu}
                    >
                      <i className={`fas ${isUserAdmin ? 'fa-shield-alt' : 'fa-user-circle'} icon-inline me-1`}></i>
                      {dashboardLabel}
                    </Link>
                    <button
                      type="button"
                      className="modern-top-link auth-link"
                      onClick={() => setShowLogoutConfirm(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        font: 'inherit',
                        color: 'inherit',
                        borderRadius: '4px',
                      }}
                      title={isKhmer ? 'ចាកចេញពីគណនី' : 'Logout from account'}
                    >
                      <i className="fas fa-sign-out-alt icon-inline me-1" style={{ transform: 'rotate(180deg)' }}></i>
                      <span>{isKhmer ? 'ចាកចេញ' : 'Logout'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      className={`modern-top-link auth-link ${isActive('/login')}`}
                      to="/login"
                      onClick={closeMobileMenu}
                    >
                      <i className="fas fa-sign-in-alt icon-inline me-1"></i>
                      {t('nav.login') || 'Login'}
                    </Link>
                    <Link
                      className={`modern-top-link auth-link ${isActive('/register')}`}
                      to="/register"
                      onClick={closeMobileMenu}
                    >
                      <i className="fas fa-user-plus icon-inline me-1"></i>
                      {t('nav.register') || 'Register'}
                    </Link>
                  </>
                )}

                {/* Language Switcher */}
                <div className="modern-top-dropdown-container">
                  <LanguageSwitcher variant="simple" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Sticky Navbar with Placeholder to prevent CLS & scroll fluttering */}
        <div className={`modern-nav-wrapper ${isSticky ? 'modern-nav-placeholder' : ''}`}>
          <nav className={`modern-nav ${isSticky ? 'modern-nav-sticky' : ''}`}>
            <div className="modern-container">
              <div className="modern-nav-content">
                {/* Mobile Left Drawer Toggle Button (Option 1 + Option 2) */}
                <button
                  type="button"
                  className={`modern-mobile-toggle-btn ${mobileMenuOpen ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={isKhmer ? 'បើកម៉ឺនុយ' : 'Toggle menu'}
                  title={isKhmer ? 'បើកម៉ឺនុយ' : 'Menu'}
                >
                  <Menu size={22} />
                </button>

                {/* Institute Logo / Branding (Official Full Banner Logo across Desktop and Mobile) */}
                <Link to="/" className="modern-logo" onClick={closeMobileMenu}>
                  <img
                    src="/images/logo.webp"
                    alt="RPITSSR Logo"
                    className="modern-navbar-logo"
                    onError={(e) => { e.target.src = '/images/logo.png'; }}
                  />
                </Link>

                {/* Desktop Menu */}
                <ul className="modern-menu-desktop">
                  <li>
                    <Link className={`modern-menu-link ${isActive('/')}`} to="/" onClick={closeMobileMenu}>
                      {t('nav.home') || 'Home'}
                    </Link>
                  </li>
                  <li>
                    <Link className={`modern-menu-link ${isActive('/our-courses')}`} to="/our-courses" onClick={closeMobileMenu}>
                      {t('nav.courses') || 'Courses'}
                    </Link>
                  </li>
                  <li>
                    <Link className={`modern-menu-link ${isActive('/about-us')}`} to="/about-us" onClick={closeMobileMenu} style={{ whiteSpace: 'nowrap' }}>
                      {t('nav.about') || 'About Us'}
                    </Link>
                  </li>
                  <li>
                    <Link className={`modern-menu-link ${isActive('/organization')}`} to="/organization" onClick={closeMobileMenu} style={{ whiteSpace: 'nowrap' }}>
                      {t('nav.organization') || 'Organization'}
                    </Link>
                  </li>
                  <li>
                    <Link className={`modern-menu-link ${isActive('/blog')}`} to="/blog" onClick={closeMobileMenu}>
                      {t('nav.blog') || 'Blog'}
                    </Link>
                  </li>
                  <li>
                    <Link className={`modern-menu-link ${isActive('/gallery')}`} to="/gallery" onClick={closeMobileMenu}>
                      {t('nav.gallery') || 'Gallery'}
                    </Link>
                  </li>
                  <li>
                    <Link className={`modern-menu-link ${isActive('/faq')}`} to="/faq" onClick={closeMobileMenu}>
                      {t('nav.faq') || 'FAQ'}
                    </Link>
                  </li>
                  <li>
                    <Link className={`modern-menu-link ${isActive('/contact')}`} to="/contact" onClick={closeMobileMenu}>
                      {t('nav.contact') || 'Contact'}
                    </Link>
                  </li>
                </ul>

              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`modern-mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer (Standard Mobile Application Architecture) */}
      <aside
        className={`modern-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}
        aria-label={isKhmer ? 'ម៉ឺនុយទូរស័ព្ទ' : 'Mobile Navigation'}
      >
        {/* Top Header: Official RPITSSR Emblem & Close Button */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <img
              src="/images/logo.webp"
              alt="RPITSSR Logo"
              className="drawer-logo-img"
              onError={(e) => { e.target.src = '/images/logo.png'; }}
            />
          </div>
          <button
            type="button"
            onClick={closeMobileMenu}
            className="drawer-close-btn"
            aria-label={isKhmer ? 'បិទម៉ឺនុយ' : 'Close menu'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="drawer-scroll-body">
          {/* User Profile or Guest Welcome Banner */}
          <div className="drawer-user-section">
            {isAuthenticated ? (
              <div className="drawer-profile-card">
                <div className="drawer-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="drawer-user-meta">
                  <div className="drawer-user-name">{user?.name || 'អ្នកប្រើប្រាស់'}</div>
                  <div className="drawer-user-role">
                    {isUserAdmin ? (
                      <span className="drawer-badge-admin">
                        <ShieldCheck size={12} /> {isKhmer ? 'អ្នកគ្រប់គ្រង (Admin)' : 'Administrator'}
                      </span>
                    ) : (
                      <span className="drawer-badge-student">
                        <UserCheck size={12} /> {isKhmer ? 'និស្សិត (Student)' : 'Student'}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to={dashboardPath}
                  className="drawer-dashboard-btn"
                  onClick={closeMobileMenu}
                  title={dashboardLabel}
                >
                  <ChevronRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="drawer-guest-card">
                <div className="drawer-guest-header">
                  <div className="drawer-guest-title">
                    {isKhmer ? 'សូមស្វាគមន៍មកកាន់ RPITSSR' : 'Welcome to RPITSSR'}
                  </div>
                  <div className="drawer-guest-sub">
                    {isKhmer ? 'បណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈកម្រិតខ្ពស់' : 'Technical & Vocational Education'}
                  </div>
                </div>
                <div className="drawer-guest-actions">
                  <Link
                    to="/login"
                    className="drawer-btn-login"
                    onClick={closeMobileMenu}
                  >
                    <LogIn size={15} />
                    <span>{t('nav.login') || 'ចូលគណនី'}</span>
                  </Link>
                  <Link
                    to="/register"
                    className="drawer-btn-register"
                    onClick={closeMobileMenu}
                  >
                    <UserPlus size={15} />
                    <span>{t('nav.register') || 'ចុះឈ្មោះ'}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>


          {/* Section 1: Academics & Services */}
          <div className={`drawer-menu-group ${activeDrawerGroup === 'academic' ? 'is-open' : 'is-collapsed'}`}>
            <button
              type="button"
              className="drawer-group-header-btn"
              onClick={() => toggleDrawerGroup('academic')}
              aria-expanded={activeDrawerGroup === 'academic'}
            >
              <div className="drawer-group-header-left">
                <div className="drawer-group-icon-badge blue">
                  <GraduationCap size={16} />
                </div>
                <span className="drawer-group-name">
                  {isKhmer ? 'កម្មវិធីសិក្សា & សេវាសិស្ស' : 'Academics & Services'}
                </span>
              </div>
              <div className="drawer-group-header-right">
                <span className="drawer-group-count-pill">{isKhmer ? '៤' : '4'}</span>
                <ChevronDown
                  size={16}
                  className={`drawer-group-chevron ${activeDrawerGroup === 'academic' ? 'rotated' : ''}`}
                />
              </div>
            </button>
            <div className="drawer-group-collapse">
              <div className="drawer-nav-list">
                <Link
                  to="/"
                  className={`drawer-item ${isActive('/')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon blue">
                    <Home size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.home') || 'ទំព័រដើម'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>

                <Link
                  to="/our-courses"
                  className={`drawer-item ${isActive('/our-courses')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon purple">
                    <GraduationCap size={18} />
                  </div>
                  <div className="drawer-item-text-group">
                    <span className="drawer-item-label">{t('nav.courses') || 'វគ្គសិក្សា & ជំនាញ'}</span>
                    <span className="drawer-badge-pill amber">{isKhmer ? 'អាហារូបករណ៍ ១០០%' : '100% Free'}</span>
                  </div>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>

                <Link
                  to="/exam-result"
                  className={`drawer-item ${isActive('/exam-result')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon gold">
                    <Award size={18} />
                  </div>
                  <div className="drawer-item-text-group">
                    <span className="drawer-item-label">{t('nav.examResult') || 'លទ្ធផលប្រឡង'}</span>
                    <span className="drawer-badge-pill blue">TVET MIS</span>
                  </div>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>

                <Link
                  to="/downloads"
                  className={`drawer-item ${isActive('/downloads')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon green">
                    <FileDown size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.downloads') || 'ទាញយកឯកសារ & ពាក្យសុំ'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>
              </div>
            </div>
          </div>

          {/* Section 2: News & Events */}
          <div className={`drawer-menu-group ${activeDrawerGroup === 'media' ? 'is-open' : 'is-collapsed'}`}>
            <button
              type="button"
              className="drawer-group-header-btn"
              onClick={() => toggleDrawerGroup('media')}
              aria-expanded={activeDrawerGroup === 'media'}
            >
              <div className="drawer-group-header-left">
                <div className="drawer-group-icon-badge orange">
                  <Newspaper size={16} />
                </div>
                <span className="drawer-group-name">
                  {isKhmer ? 'ព័ត៌មាន & សកម្មភាព' : 'News & Activities'}
                </span>
              </div>
              <div className="drawer-group-header-right">
                <span className="drawer-group-count-pill">{isKhmer ? '៤' : '4'}</span>
                <ChevronDown
                  size={16}
                  className={`drawer-group-chevron ${activeDrawerGroup === 'media' ? 'rotated' : ''}`}
                />
              </div>
            </button>
            <div className="drawer-group-collapse">
              <div className="drawer-nav-list">
                <Link
                  to="/blog"
                  className={`drawer-item ${isActive('/blog')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon blue">
                    <Newspaper size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.blog') || 'ព័ត៌មាន & អត្ថបទ'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>

                <Link
                  to="/notice"
                  className={`drawer-item ${isActive('/notice')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon orange">
                    <Bell size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.notice') || 'សេចក្តីជូនដំណឹង'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>

                <Link
                  to="/events"
                  className={`drawer-item ${isActive('/events')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon gold">
                    <Calendar size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.events') || 'ព្រឹត្តិការណ៍'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>

                <Link
                  to="/gallery"
                  className={`drawer-item ${isActive('/gallery')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon purple">
                    <ImageIcon size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.gallery') || 'វិចិត្រសាលរូបភាព'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>
              </div>
            </div>
          </div>

          {/* Section 3: About & Support */}
          <div className={`drawer-menu-group ${activeDrawerGroup === 'about' ? 'is-open' : 'is-collapsed'}`}>
            <button
              type="button"
              className="drawer-group-header-btn"
              onClick={() => toggleDrawerGroup('about')}
              aria-expanded={activeDrawerGroup === 'about'}
            >
              <div className="drawer-group-header-left">
                <div className="drawer-group-icon-badge green">
                  <Info size={16} />
                </div>
                <span className="drawer-group-name">
                  {isKhmer ? 'អំពីវិទ្យាស្ថាន & ជំនួយ' : 'About & Support'}
                </span>
              </div>
              <div className="drawer-group-header-right">
                <span className="drawer-group-count-pill">{isKhmer ? '៤' : '4'}</span>
                <ChevronDown
                  size={16}
                  className={`drawer-group-chevron ${activeDrawerGroup === 'about' ? 'rotated' : ''}`}
                />
              </div>
            </button>
            <div className="drawer-group-collapse">
              <div className="drawer-nav-list">
                <Link
                  to="/about-us"
                  className={`drawer-item ${isActive('/about-us')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon blue">
                    <Info size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.about') || 'អំពីយើង'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>

                <Link
                  to="/organization"
                  className={`drawer-item ${isActive('/organization')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon green">
                    <Users size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.organization') || 'រចនាសម្ព័ន្ធគ្រប់គ្រង'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>

                <Link
                  to="/faq"
                  className={`drawer-item ${isActive('/faq')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon orange">
                    <HelpCircle size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.faq') || 'សំណួរញឹកញាប់'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>

                <Link
                  to="/contact"
                  className={`drawer-item ${isActive('/contact')}`}
                  onClick={closeMobileMenu}
                >
                  <div className="drawer-item-icon blue">
                    <PhoneCall size={18} />
                  </div>
                  <span className="drawer-item-label">{t('nav.contact') || 'ទំនាក់ទំនង'}</span>
                  <ChevronRight size={16} className="drawer-item-arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Drawer Footer Utilities (Collapsible / Accordion) */}
        <div className={`drawer-sticky-footer ${isFooterExpanded ? 'is-expanded' : 'is-collapsed'}`}>
          {/* Header Toggle / Collapse Button */}
          <button
            type="button"
            className="drawer-collapse-toggle-btn"
            onClick={() => setIsFooterExpanded(!isFooterExpanded)}
            aria-expanded={isFooterExpanded}
          >
            <div className="drawer-collapse-toggle-left">
              <div className="drawer-collapse-icon-wrap">
                <Globe size={15} />
              </div>
              <div className="drawer-collapse-text-wrap">
                <span className="drawer-collapse-title">
                  {isKhmer ? 'ភាសា & ទំនាក់ទំនង' : 'Language & Support'}
                </span>
                {!isFooterExpanded && (
                  <span className="drawer-collapse-hint">
                    {isKhmer ? '🇰🇭 ខ្មែរ • Hotline • សង្គម' : 'EN • Hotline • Social'}
                  </span>
                )}
              </div>
            </div>
            <div className="drawer-collapse-chevron-wrap">
              <span className="drawer-collapse-badge">
                {isFooterExpanded ? (isKhmer ? 'បង្រួម' : 'Collapse') : (isKhmer ? 'បើកមើល' : 'Expand')}
              </span>
              <ChevronDown
                size={16}
                className={`drawer-collapse-chevron ${isFooterExpanded ? 'rotated' : ''}`}
              />
            </div>
          </button>

          {/* Collapsible Content Body */}
          <div className="drawer-collapse-body">
            {/* Unified Utilities Grouped Card */}
            <div className="drawer-utilities-card">
              {/* Row 1: Language Switcher */}
              <div className="drawer-util-row">
                <div className="drawer-util-left">
                  <div className="drawer-util-icon-badge blue">
                    <Globe size={15} />
                  </div>
                  <div className="drawer-util-text">
                    <span className="drawer-util-title">{isKhmer ? 'ភាសាបង្ហាញ' : 'Language'}</span>
                    <span className="drawer-util-sub">{isKhmer ? 'ជ្រើសរើសភាសា' : 'Select language'}</span>
                  </div>
                </div>
                <div className="drawer-util-action">
                  <LanguageSwitcher variant="pill" />
                </div>
              </div>

              {/* Row 2: Tour Guide */}
              <button
                type="button"
                className="drawer-util-row drawer-util-btn"
                onClick={() => {
                  closeMobileMenu();
                  window.dispatchEvent(new CustomEvent('open-website-guide'));
                }}
              >
                <div className="drawer-util-left">
                  <div className="drawer-util-icon-badge amber">
                    <Compass size={15} />
                  </div>
                  <div className="drawer-util-text">
                    <span className="drawer-util-title">
                      {isKhmer ? 'មគ្គុទ្ទេសក៍គេហទំព័រ' : 'Interactive Site Tour'}
                    </span>
                    <span className="drawer-util-sub">
                      {isKhmer ? 'ស្វែងយល់មុខងារសំខាន់ៗ ៤ ជំហាន' : 'Explore RPITSSR in 4 steps'}
                    </span>
                  </div>
                </div>
                <div className="drawer-util-action">
                  <span className="drawer-util-pill amber">
                    <Sparkles size={11} className="me-1" />
                    {isKhmer ? 'បើកមើល' : 'Tour'}
                  </span>
                  <ChevronRight size={14} className="drawer-util-arrow" />
                </div>
              </button>

              {/* Row 3: Student Hotline */}
              <a href="tel:0966660306" className="drawer-util-row drawer-util-link">
                <div className="drawer-util-left">
                  <div className="drawer-util-icon-badge green">
                    <PhoneCall size={15} />
                  </div>
                  <div className="drawer-util-text">
                    <span className="drawer-util-title">
                      {isKhmer ? 'ទូរស័ព្ទទាន់ហេតុការណ៍' : 'Student Hotline'}
                    </span>
                    <span className="drawer-util-sub">096 666 0306</span>
                  </div>
                </div>
                <div className="drawer-util-action">
                  <span className="drawer-util-pill green">
                    <Phone size={11} className="me-1" />
                    {isKhmer ? 'ហៅចេញ' : 'Call'}
                  </span>
                  <ChevronRight size={14} className="drawer-util-arrow" />
                </div>
              </a>
            </div>

            {/* Social Media Panel */}
            <div className="drawer-social-panel">
              <span className="drawer-social-label">
                {isKhmer ? 'បណ្តាញសង្គមផ្លូវការ' : 'Official Channels'}
              </span>
              <div className="drawer-social-row">
                <a
                  href="https://web.facebook.com/rpitssr.edu.kh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-social-icon fb"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <i className="fab fa-facebook-f" />
                </a>
                <a
                  href="https://t.me/rpitssr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-social-icon tg"
                  aria-label="Telegram"
                  title="Telegram"
                >
                  <i className="fab fa-telegram-plane" />
                </a>
                <a
                  href="https://www.youtube.com/@rpitssr_edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-social-icon yt"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <i className="fab fa-youtube" />
                </a>
                <a
                  href="https://www.tiktok.com/@rpitssr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-social-icon tt"
                  aria-label="TikTok"
                  title="TikTok"
                >
                  <i className="fab fa-tiktok" />
                </a>
              </div>
            </div>

            {/* Logout button (if authenticated) */}
            {isAuthenticated && (
              <button
                type="button"
                className="drawer-logout-btn"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut size={15} />
                <span>{isKhmer ? 'ចាកចេញពីគណនី (Sign Out)' : 'Sign Out'}</span>
              </button>
            )}

            {/* Institute Watermark */}
            <div className="drawer-footer-copyright">
              RPITSSR Siem Reap • Mobile App
            </div>
          </div>
        </div>
      </aside>

      {/* Institutional Logout Confirmation Modal (Premium Redesign) */}
      {showLogoutConfirm && (
        <div
          className="rpitssr-modal-backdrop"
          onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
        >
          <div
            className="rpitssr-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="frontend-logout-title"
          >
            {/* Close Button Top-Right */}
            <button
              type="button"
              className="rpitssr-modal-close-btn"
              onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
              aria-label="Close"
              title={isKhmer ? 'បិទ' : 'Close'}
            >
              <X size={16} />
            </button>

            <div className="rpitssr-modal-body">
              {/* Glowing Icon Badge with Pulse Ring */}
              <div className="rpitssr-modal-icon-wrapper">
                <div className="rpitssr-modal-icon-ring"></div>
                <div className="rpitssr-modal-icon-badge">
                  <LogOut size={26} style={{ strokeWidth: 2.3 }} />
                </div>
              </div>

              <h3 id="frontend-logout-title" className="rpitssr-modal-title">
                {isKhmer ? 'បញ្ជាក់ការចាកចេញ' : 'Confirm Sign Out'}
              </h3>

              <p className="rpitssr-modal-desc">
                {isKhmer ? (
                  <>
                    តើអ្នកពិតជាចង់ចាកចេញពីគណនី RPITSSR របស់អ្នកមែនទេ?
                    <span className="rpitssr-modal-desc-en">
                      Are you sure you want to sign out from your account?
                    </span>
                  </>
                ) : (
                  'Are you sure you want to sign out from your RPITSSR account?'
                )}
              </p>

              {/* Security Reassurance Note */}
              <div className="rpitssr-modal-note">
                <ShieldCheck size={16} className="rpitssr-modal-note-icon" />
                <span>
                  {isKhmer
                    ? 'ទិន្នន័យ និងវគ្គសិក្សារបស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាព'
                    : 'Your session and learning progress are safely preserved.'}
                </span>
              </div>
            </div>

            <div className="rpitssr-modal-footer">
              <button
                type="button"
                className="rpitssr-btn-modal-cancel"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                className="rpitssr-btn-modal-danger"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                <LogOut size={16} style={{ strokeWidth: 2.3 }} />
                <span>
                  {isLoggingOut
                    ? (isKhmer ? 'កំពុងចាកចេញ...' : 'Signing out...')
                    : (isKhmer ? 'ចាកចេញឥឡូវនេះ' : 'Sign Out Now')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
