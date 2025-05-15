'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import AssignOrder from '@/components/AssignOrder';
import { useTranslation } from '@/context/TranslationContext';

export default function AssignOrderPage() {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('assignOrder.title')}>
      <AssignOrder onClose={() => {}} />
    </PageLayout>
  );
}