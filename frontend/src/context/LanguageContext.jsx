import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.js';
import kmTranslations from '../locales/km.js';

const LanguageContext = createContext();

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭' }
];

const translationMap = {
  en: enTranslations,
  km: kmTranslations
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('km');
  const [translations, setTranslations] = useState(kmTranslations);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('selectedLanguage');
    if (saved && languages.find(l => l.code === saved)) {
      setCurrentLanguage(saved);
      setTranslations(translationMap[saved] || kmTranslations);
      document.documentElement.lang = saved;
    } else {
      setCurrentLanguage('km');
      setTranslations(kmTranslations);
      document.documentElement.lang = 'km';
    }
  }, []);

  const changeLanguage = (code) => {
    if (languages.find(l => l.code === code)) {
      setCurrentLanguage(code);
      setTranslations(translationMap[code] || kmTranslations);
      localStorage.setItem('selectedLanguage', code);
      document.documentElement.lang = code;
    }
  };

  const t = (key, params = {}) => {
    if (!key || typeof key !== 'string') return key;
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
      if (!result || typeof result !== 'object' || result[k] === undefined) {
        // Fallback to English if missing in current language
        let fallback = translationMap.en;
        for (const fk of keys) {
          if (!fallback || typeof fallback !== 'object' || fallback[fk] === undefined) {
            return key;
          }
          fallback = fallback[fk];
        }
        if (typeof fallback === 'string') {
          let output = fallback;
          Object.keys(params).forEach(p => {
            output = output.replace(new RegExp(`{{${p}}}`, 'g'), params[p]);
          });
          return output;
        }
        return key;
      }
      result = result[k];
    }
    if (typeof result !== 'string') return key;
    let output = result;
    Object.keys(params).forEach(p => {
      output = output.replace(new RegExp(`{{${p}}}`, 'g'), params[p]);
    });
    return output;
  };

  const formatNumber = (num) => {
    return currentLanguage === 'km'
      ? new Intl.NumberFormat('km-KH').format(num)
      : new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (date, options = {}) => {
    const d = date instanceof Date ? date : new Date(date);
    return currentLanguage === 'km'
      ? new Intl.DateTimeFormat('km-KH', { year: 'numeric', month: 'long', day: 'numeric', ...options }).format(d)
      : new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', ...options }).format(d);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return currentLanguage === 'km' && currency === 'KHR'
      ? new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR' }).format(amount)
      : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        language: currentLanguage,
        isKhmer: currentLanguage === 'km',
        languages,
        translations,
        isLoading,
        changeLanguage,
        t,
        formatNumber,
        formatDate,
        formatCurrency,
        getCurrentLanguage: () => currentLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
