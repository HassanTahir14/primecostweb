'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import ServingSize from '@/components/ServingSize';

export default function ServingSizePage() {
  return (
    <PageLayout title="Serving Size">
      <ServingSize onClose={() => {}} />
    </PageLayout>
  );
} 