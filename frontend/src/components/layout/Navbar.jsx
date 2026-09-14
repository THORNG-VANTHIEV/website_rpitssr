import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { KhmerCalendar } from '../../utils/khmerCalendar';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    if (!window.confirm('តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ? / Are you sure you want to sign out?')) {
      return;
    }
    await logout();
    closeMobileMenu();
    navigate('/');
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
                    <Link
                      className="modern-top-link auth-link"
                      to="/"
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                    >
                      <i className="fas fa-sign-out-alt icon-inline me-1" style={{ transform: 'rotate(180deg)' }}></i>
                      Logout
                    </Link>
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
                {/* Official Institute Logo */}
                <Link to="/" className="modern-logo" onClick={closeMobileMenu}>
                  <img
                    src="/images/logo.webp"
                    alt="RPITSSR Logo"
                    style={{ height: '55px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
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

                {/* Mobile Toggle Button */}
                <button
                  className={`modern-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '20px' }}></i>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`modern-mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Mobile Menu Drawer */}
      <div className={`modern-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="modern-mobile-header">
          <img
            src="/images/logo.webp"
            alt="RPITSSR Logo"
            className="modern-mobile-logo"
            style={{ height: '48px', width: 'auto', maxWidth: '280px', objectFit: 'contain' }}
          />
          <button onClick={closeMobileMenu} className="modern-close-btn" aria-label="Close menu">
            <i className="fas fa-times" style={{ fontSize: '20px' }}></i>
          </button>
        </div>
        <ul className="modern-mobile-links">
          <li>
            <Link className={`modern-mobile-link ${isActive('/')}`} to="/" onClick={closeMobileMenu}>
              {t('nav.home') || 'Home'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/our-courses')}`} to="/our-courses" onClick={closeMobileMenu}>
              {t('nav.courses') || 'Courses'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/about-us')}`} to="/about-us" onClick={closeMobileMenu}>
              {t('nav.about') || 'About Us'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/organization')}`} to="/organization" onClick={closeMobileMenu}>
              {t('nav.organization') || 'Organization'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/downloads')}`} to="/downloads" onClick={closeMobileMenu}>
              <i className="fas fa-file-download me-2 text-primary"></i>
              {t('nav.downloads') || 'Downloads'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/blog')}`} to="/blog" onClick={closeMobileMenu}>
              {t('nav.blog') || 'Blog'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/gallery')}`} to="/gallery" onClick={closeMobileMenu}>
              {t('nav.gallery') || 'Gallery'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/faq')}`} to="/faq" onClick={closeMobileMenu}>
              {t('nav.faq') || 'FAQ'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/contact')}`} to="/contact" onClick={closeMobileMenu}>
              {t('nav.contact') || 'Contact'}
            </Link>
          </li>
          <li className="modern-mobile-divider"></li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/exam-result')}`} to="/exam-result" onClick={closeMobileMenu}>
              {t('nav.examResult') || 'Exam Result'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/notice')}`} to="/notice" onClick={closeMobileMenu}>
              {t('nav.notice') || 'Notice'}
            </Link>
          </li>
          <li>
            <Link className={`modern-mobile-link ${isActive('/events')}`} to="/events" onClick={closeMobileMenu}>
              {t('nav.events') || 'Events'}
            </Link>
          </li>
          <li className="modern-mobile-divider"></li>
          {isAuthenticated ? (
            <>
              <li>
                <Link className={`modern-mobile-link auth-link ${isActive(dashboardPath)}`} to={dashboardPath} onClick={closeMobileMenu}>
                  <i className={`fas ${isUserAdmin ? 'fa-shield-alt' : 'fa-user-circle'}`}></i> {dashboardLabel}
                </Link>
              </li>
              <li>
                <Link
                  className="modern-mobile-link auth-link"
                  to="/"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                >
                  <i className="fas fa-sign-out-alt" style={{ transform: 'rotate(180deg)' }}></i> Logout
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link className="modern-mobile-link auth-link" to="/login" onClick={closeMobileMenu}>
                  {t('nav.login') || 'Login'}
                </Link>
              </li>
              <li>
                <Link className="modern-mobile-link auth-link" to="/register" onClick={closeMobileMenu}>
                  {t('nav.register') || 'Register'}
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
};
