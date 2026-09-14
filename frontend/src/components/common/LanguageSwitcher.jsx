import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSwitcher = ({ className = '', variant = 'simple', size = 'sm', theme = 'auto' }) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  if (variant === 'admin' || variant === 'pill') {
    return (
      <div
        className={`admin-language-toggle ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '3px',
          gap: '3px',
          height: '40px',
          boxSizing: 'border-box',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        <button
          type="button"
          onClick={() => changeLanguage('km')}
          title="ភាសាខ្មែរ (Khmer)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            borderRadius: '7px',
            height: '32px',
            padding: '0 12px',
            fontSize: '0.80rem',
            fontWeight: currentLanguage === 'km' ? '700' : '600',
            cursor: 'pointer',
            backgroundColor: currentLanguage === 'km' ? '#07294D' : 'transparent',
            backgroundImage: currentLanguage === 'km' ? 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)' : 'none',
            color: currentLanguage === 'km' ? '#ffffff' : '#64748b',
            boxShadow: currentLanguage === 'km' ? '0 2px 5px rgba(7, 41, 77, 0.22)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>🇰🇭</span>
          <span>ខ្មែរ</span>
        </button>

        <button
          type="button"
          onClick={() => changeLanguage('en')}
          title="English"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            borderRadius: '7px',
            height: '32px',
            padding: '0 12px',
            fontSize: '0.80rem',
            fontWeight: currentLanguage === 'en' ? '700' : '600',
            cursor: 'pointer',
            backgroundColor: currentLanguage === 'en' ? '#07294D' : 'transparent',
            backgroundImage: currentLanguage === 'en' ? 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)' : 'none',
            color: currentLanguage === 'en' ? '#ffffff' : '#64748b',
            boxShadow: currentLanguage === 'en' ? '0 2px 5px rgba(7, 41, 77, 0.22)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  // Simple navbar variant
  const textColor = theme === 'light' ? '#07294D' : 'white';
  const activeBg = theme === 'light' ? 'rgba(7, 41, 77, 0.1)' : 'rgba(255, 255, 255, 0.25)';
  const dividerColor = theme === 'light' ? 'rgba(7, 41, 77, 0.25)' : 'rgba(255, 255, 255, 0.5)';

  return (
    <div
      className={`language-switcher-simple ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
    >
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        style={{
          background: currentLanguage === 'en' ? activeBg : 'none',
          border: 'none',
          color: textColor,
          cursor: 'pointer',
          fontWeight: currentLanguage === 'en' ? '700' : '500',
          padding: '3px 8px',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
        }}
      >
        EN
      </button>
      <span style={{ color: dividerColor, userSelect: 'none' }}>|</span>
      <button
        type="button"
        onClick={() => changeLanguage('km')}
        style={{
          background: currentLanguage === 'km' ? activeBg : 'none',
          border: 'none',
          color: textColor,
          cursor: 'pointer',
          fontWeight: currentLanguage === 'km' ? '700' : '500',
          padding: '3px 8px',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
        }}
      >
        ខ្មែរ
      </button>
    </div>
  );
};
