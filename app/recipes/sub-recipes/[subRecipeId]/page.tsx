'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectAllSubRecipes } from '@/store/subRecipeSlice';
import GenericDetailPage, { DetailFieldConfig } from '@/components/common/GenericDetailPage';
import PageLayout from '@/components/PageLayout';

export default function SubRecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subRecipeId = params.subRecipeId as string;
  const subRecipes = useSelector(selectAllSubRecipes);
  
  const [subRecipe, setSubRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subRecipes) {
      const foundRecipe = subRecipes.find(r => r.id.toString() === subRecipeId);
      if (foundRecipe) {
        setSubRecipe(foundRecipe);
        setError(null);
      } else {
        setError('Sub-recipe not found');
      }
      setLoading(false);
    }
  }, [subRecipes, subRecipeId]);

  const fieldConfig: DetailFieldConfig[] = [
    { key: 'name', label: 'Sub-Recipe Name' },
    { key: 'subRecipeCode', label: 'Recipe Code' },
    { key: 'categoryName', label: 'Category' },
    { 
      key: 'tokenStatus', 
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'APPROVED' 
            ? 'bg-green-100 text-green-800' 
            : value === 'PENDING'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value || 'DRAFT'}
        </span>
      )
    },
    { key: 'numberOfPortions', label: 'Number of Portions' },
    { key: 'servingSize', label: 'Serving Size' },
    { 
      key: 'costPerRecipe', 
      label: 'Cost Per Recipe',
      render: (value) => `$${value.toFixed(2)}`
    },
    { 
      key: 'costPerPortion', 
      label: 'Cost Per Portion',
      render: (value) => `$${value.toFixed(2)}`
    },
    { 
      key: 'menuPrice', 
      label: 'Menu Price',
      render: (value) => `$${value.toFixed(2)}`
    },
    { 
      key: 'idealSellingPrice', 
      label: 'Ideal Selling Price',
      render: (value) => `$${value.toFixed(2)}`
    },
    { 
      key: 'marginPerPortion', 
      label: 'Margin Per Portion',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'foodCostBudgetPercentage',
      label: 'Food Cost Budget %',
      render: (value) => `${value}%`
    },
    {
      key: 'foodCostActualPercentage',
      label: 'Food Cost Actual %',
      render: (value) => `${value}%`
    },
    {
      key: 'ingredients',
      label: 'Ingredients',
      render: (ingredients) => (
        <div className="space-y-2">
          {ingredients?.map((ing: any, index: number) => (
            <div key={ing.id || index} className="text-sm">
              <span className="font-medium">{ing.itemName.split('@')[0]}</span>
              <span className="text-gray-600">
                {' - '}{ing.quantity} {ing.unit}
                {' ('}{ing.yieldPercentage}% yield)
                {' - $'}{ing.recipeCost.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'procedures',
      label: 'Procedures',
      render: (procedures) => (
        <div className="space-y-2">
          {procedures?.map((proc: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="font-medium">Step {index + 1}:</span>
              <span className="ml-2">{proc.description}</span>
              {proc.criticalPoint && (
                <div className="mt-1 text-yellow-600">
                  Critical Point: {proc.criticalPoint}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'lastUpdatedByName',
      label: 'Last Updated By',
      render: (value, data) => value ? `${value} (${data.lastUpdatedByDesignation || 'N/A'})` : 'N/A'
    }
  ];

  return (
    <PageLayout title="Sub-Recipe Details">
      <GenericDetailPage
        title="Sub-Recipe Details"
        data={subRecipe}
        fieldConfig={fieldConfig}
        onBack={() => router.back()}
        isLoading={loading}
        error={error}
        imageKey="images"
        imageBaseUrl="http://212.85.26.46:8082/"
      />
    </PageLayout>
  );
} 