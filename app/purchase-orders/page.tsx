'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import PurchaseOrders from '@/components/PurchaseOrders';

export default function PurchaseOrdersPage() {
  return (
    <PageLayout title="Purchase Orders">
      <PurchaseOrders onClose={() => {}} />
    </PageLayout>
  );
} 