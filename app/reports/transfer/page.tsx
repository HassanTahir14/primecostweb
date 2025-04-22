'use client';

import React from 'react';
import ReportIndexPage from '@/components/reports/ReportIndexPage'; // Use the previous component

// Define the updated report links for Transfer Reports
const transferReportLinks = [
  {
    name: 'Sub-Recipes Transferred Report',
    path: '/reports/transfer/sub-recipes-transferred'
  },
  {
    name: 'Recipes Transferred Report',
    path: '/reports/transfer/recipes-transferred'
  },
  {
    name: 'Materials Transferred Report',
    path: '/reports/transfer/materials-transferred'
  },
  {
    name: 'Items Transferred Report',
    path: '/reports/transfer/items-transferred'
  },
];

export default function TransferReportsLandingPage() {
  return (
    <ReportIndexPage
      title="Transfer Reports" // Keep the original title
      reportLinks={transferReportLinks} // Use the updated links
    />
  );
} 