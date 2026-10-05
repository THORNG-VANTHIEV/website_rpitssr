import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, GraduationCap, Edit3 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { language, currentLanguage } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const pathname = location.pathname;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    {
      to: '/',
      icon: Home,
      label: isKhmer ? 'ទំព័រដើម' : 'Home',
      isActive: pathname === '/'
    },
    {
      to: '/courses',
      icon: GraduationCap,
      label: isKhmer ? 'ជំនាញ' : 'Courses',
      isActive: pathname.startsWith('/courses')
    },
    {
      to: '/apply',
      icon: Edit3,
      label: isKhmer ? 'ចុះឈ្មោះ' : 'Apply',
      isActive: pathname.startsWith('/apply') || pathname.startsWith('/register'),
      isSpecial: true
    }
  ];

  const activeIndex = navItems.findIndex((item) => item.isActive);

  return (
    <nav className="mobile-dock-wrapper" aria-label="Mobile Navigation">
      <div className="mobile-dock-container">
        {/* Smooth iOS Sliding Pill Indicator */}
        {activeIndex !== -1 && (
          <div
            className={`mobile-dock-slider-pill ${activeIndex === 2 ? 'is-apply' : ''}`}
            style={{
              transform: `translateX(${activeIndex * 100}%)`
            }}
          />
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const activeClass = item.isActive ? 'active' : '';
          const specialClass = item.isSpecial ? 'special-apply' : '';

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={scrollToTop}
              className={`mobile-dock-item ${activeClass} ${specialClass}`}
            >
              <div className="mobile-dock-icon-wrap">
                <Icon size={20} />
              </div>
              <span className="mobile-dock-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
