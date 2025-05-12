'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '@/translations/en.json';
import arTranslations from '@/translations/ar.json';

type Language = 'en' | 'ar';
type Translations = typeof enTranslations;

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get language from localStorage, default to 'en'
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || 'en';
    }
    return 'en';
  });
  const [translations, setTranslations] = useState<Translations>(enTranslations);
  const isRTL = language === 'ar';

  useEffect(() => {
    setTranslations(language === 'en' ? enTranslations : arTranslations);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    // Save language preference to localStorage whenever it changes
    localStorage.setItem('language', language);
  }, [language, isRTL]);

  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((str, [key, val]) => {
        return str.replace(`{${key}}`, val);
      }, value);
    }

    return value;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
} 