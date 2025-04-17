'use client';

import React from 'react';
import ReportIndexPage from '@/components/reports/ReportIndexPage';

// Define the specific report links for Transfer Reports
const transferReportLinks = [
  { name: 'Items Transferred By Branch', path: '/reports/transfer/items-branch' },
  { name: 'Items Transferred By Category (Meat Poultry)', path: '/reports/transfer/items-category' }, // Add params if needed
  { name: 'Items Transferred By Item Name & Description', path: '/reports/transfer/items-name' },
  { name: 'Prepared Recipe Transferred Report', path: '/reports/transfer/prepared-recipe' },
  { name: 'Prepared Recipe Transferred Report By Category', path: '/reports/transfer/prepared-recipe-category' },
];

export default function TransferReportsLandingPage() {
  return (
    <ReportIndexPage 
      title="Transfer Reports"
      reportLinks={transferReportLinks}
    />
  );
} 