'use client';

import React from 'react';
import ReportIndexPage from '@/components/reports/ReportIndexPage';

// Define the specific report links for Recipe Reports
const recipeReportLinks = [
  { name: 'Food Cost Report', path: '/reports/recipe/food-cost' },
  { name: 'Profit Margin Report', path: '/reports/recipe/profit-margin' },
  { name: 'Prepared Items Report', path: '/reports/recipe/prepared-items' },
  { name: 'Yield Analysis', path: '/reports/recipe/yield-analysis' },
];

export default function RecipeReportsLandingPage() {
  return (
    <ReportIndexPage 
      title="Recipe Reports"
      reportLinks={recipeReportLinks}
    />
  );
} 