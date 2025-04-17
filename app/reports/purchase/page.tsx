 'use client';

import React from 'react';
import ReportIndexPage from '@/components/reports/ReportIndexPage';

// Define the specific report links for Recipe Reports
const recipeReportLinks = [
  { name: 'Food Cost Report', path: '/reports/recipe/food-cost' },
  { name: 'Prepared Items by Report', path: '/reports/recipe/prepared-items-report' },
  { name: 'Prepared Items by Category', path: '/reports/recipe/prepared-items-category' },
  { name: 'Prepared Items by Person in charge', path: '/reports/recipe/prepared-items-person' },
  { name: 'Yield Analysis', path: '/reports/recipe/yield-analysis' },
  { name: 'Recipe by category', path: '/reports/recipe/recipe-category' },
];

export default function RecipeReportsLandingPage() {
  return (
    <ReportIndexPage 
      title="Purchase Reports"
      reportLinks={recipeReportLinks}
    />
  );
} 