import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'saathi.language';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === 'hi' ? 'hi' : 'en';
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    document.documentElement.dir = 'ltr';
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage((prev) => (prev === 'en' ? 'hi' : 'en')),
    isHindi: language === 'hi',
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      isHindi: false,
    };
  }
  return context;
}
