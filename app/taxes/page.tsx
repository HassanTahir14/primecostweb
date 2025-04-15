'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Taxes from '@/components/Taxes';

export default function TaxesPage() {
  return (
    <PageLayout title="Taxes">
      <Taxes onClose={() => {}} />
    </PageLayout>
  );
} 