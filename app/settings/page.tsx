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
          <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center border border-gray-200 mb-4">
            <span className="text-gray-700 font-medium">{t('settings.language.title')}</span>
            <div className="flex items-center gap-2 text-gray-600">
              <span>{t('settings.language.selected', { language })}</span>
              <Globe size={20} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">{t('settings.language.title')}</h2>
            <p className="text-gray-600">{t('settings.language.description')}</p>
            
            <div className="flex gap-4 mt-4">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('en')}
                className="flex items-center gap-2"
              >
                <span className="text-lg">🇺🇸</span>
                {t('settings.language.english')}
              </Button>
              
              <Button
                variant={language === 'ar' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('ar')}
                className="flex items-center gap-2"
              >
                <span className="text-lg">🇸🇦</span>
                {t('settings.language.arabic')}
              </Button>
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