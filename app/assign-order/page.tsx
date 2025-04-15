'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import AssignOrder from '@/components/AssignOrder';

export default function AssignOrderPage() {
  return (
    <PageLayout title="Assign Order">
      <AssignOrder onClose={() => {}} />
    </PageLayout>
  );
} 