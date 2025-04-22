'use client';

import React from 'react';
import ReportIndexPage from '@/components/reports/ReportIndexPage';

// Define the specific report links for Employee Reports 
// Note: Image 8 shows the same links as Purchase Reports, which might be an error in the images.
// Using distinct paths assuming they are different reports logically.
const employeeReportLinks = [
  { name: 'Salary Breakdown Report', path: '/reports/employee/salary-breakdown' }, // Path differs from purchase
  { name: 'Performance Report', path: '/reports/employee/performance-report' }, // Path differs
  { name: 'Iqama Expiry Report', path: '/reports/employee/iqama-expiry' }, // Path differs
  { name: 'General Employee Report', path: '/reports/employee/general' }, // Path differs
  { name: 'Health Card Expiry Report', path: '/reports/employee/health-card-expiry' }, // Path differs
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