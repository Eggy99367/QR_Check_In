import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default to 'en'
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const savedLanguage = localStorage.getItem('qr-checkin-language');
      return savedLanguage || 'en';
    } catch (error) {
      return 'en';
    }
  });

  const switchLanguage = (language) => {
    setCurrentLanguage(language);
    // Save to localStorage
    try {
      localStorage.setItem('qr-checkin-language', language);
    } catch (error) {
      console.warn('Failed to save language preference to localStorage:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}; 