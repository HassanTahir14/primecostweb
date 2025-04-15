'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Suppliers from '@/components/Suppliers';

export default function SuppliersPage() {
  return (
    <PageLayout title="Suppliers">
      <Suppliers onClose={() => {}} />
    </PageLayout>
  );
} 