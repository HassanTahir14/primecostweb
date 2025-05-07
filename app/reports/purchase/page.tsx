'use client';

import React from 'react';
import ReportIndexPage from '@/components/reports/ReportIndexPage';

// Define the specific report links for Purchase Reports
const purchaseReportLinks = [
  { name: 'Rejected Purchase Orders', path: '/reports/purchase/rejected-po' },
  { name: 'Item Expiry Report', path: '/reports/purchase/item-expiry' },
  { name: 'Items Purchased', path: '/reports/purchase/item-by-supplier' },
  { name: 'Purchase by Category', path: '/reports/purchase/by-category' },
  // Add more purchase reports here as needed
];

export default function PurchaseReportsLandingPage() {
  return (
    <ReportIndexPage 
      title="Purchase Reports"
      reportLinks={purchaseReportLinks}
    />
  );
} 