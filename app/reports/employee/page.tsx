'use client';

import React from 'react';
import ReportIndexPage from '@/components/reports/ReportIndexPage';

// Define the specific report links for Employee Reports 
// Note: Image 8 shows the same links as Purchase Reports, which might be an error in the images.
// Using distinct paths assuming they are different reports logically.
const employeeReportLinks = [
  { name: 'Items Expiry Date', path: '/reports/employee/items-expiry' }, // Path differs from purchase
  { name: 'Items By Supplier', path: '/reports/employee/items-supplier' }, // Path differs
  { name: 'Purchase Report', path: '/reports/employee/purchase-summary' }, // Path differs
  { name: 'Stock Summary Report', path: '/reports/employee/stock-summary' }, // Path differs
  { name: 'Purchase By Supplier', path: '/reports/employee/purchase-supplier' }, // Path differs
  { name: 'Purchase By Category', path: '/reports/employee/purchase-category' }, // Path differs
  // Add specific employee reports if needed based on actual requirements, e.g.:
  // { name: 'Employee Iqama Expiry', path: '/reports/employee/iqama-expiry' }, 
];

export default function EmployeeReportsLandingPage() {
  return (
    <ReportIndexPage 
      title="Employee Data Reports" 
      reportLinks={employeeReportLinks}
    />
  );
} 