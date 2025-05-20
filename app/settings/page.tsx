'use client';

import { useTranslation } from '@/context/TranslationContext';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { ArrowLeft, Globe, DollarSign } from 'lucide-react';
import CurrencySelector from '@/components/settings/CurrencySelector';
import Button from '@/components/common/button';

export default function Settings() {
  const { language, setLanguage, t } = useTranslation();

  const handleLanguageChange = (newLang: 'en' | 'ar') => {
    setLanguage(newLang);
  };

  return (
    <PageLayout title={t('settings.title')}>
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Arrow */}
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
        </div>

        {/* Settings Options */}
        <div className="space-y-4">
          {/* Language Setting */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">{t('settings.language.title')}</span>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'ar')}
                  className="text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <option value="en" className="flex items-center gap-2">
                    🇺🇸 {t('settings.language.english')}
                  </option>
                  <option value="ar" className="flex items-center gap-2">
                    🇸🇦 {t('settings.language.arabic')}
                  </option>
                </select>
                <Globe size={20} className="text-gray-600" />
              </div>
            </div>
          </div>

          {/* Currency Setting */}
          {/* <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center border border-gray-200">
            <span className="text-gray-700 font-medium">Currency</span>
            <div className="flex items-center gap-2 text-gray-600">
              <span>USD</span>
              <DollarSign size={20} />
            </div>
          </div> */}
        </div>

        <CurrencySelector />
      </div>
    </PageLayout>
  );
} 