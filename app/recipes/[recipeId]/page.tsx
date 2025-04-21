'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectAllRecipes } from '@/store/recipeSlice';
import GenericDetailPage, { DetailFieldConfig } from '@/components/common/GenericDetailPage';
import PageLayout from '@/components/PageLayout';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.recipeId as string;
  const recipes = useSelector(selectAllRecipes);
  
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipes) {
      const foundRecipe = recipes.find(r => r.id.toString() === recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
        setError(null);
      } else {
        setError('Recipe not found');
      }
      setLoading(false);
    }
  }, [recipes, recipeId]);

  const fieldConfig: DetailFieldConfig[] = [
    { key: 'name', label: 'Recipe Name' },
    { key: 'categoryName', label: 'Category' },
    { 
      key: 'tokenStatus', 
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value || 'DRAFT'}
        </span>
      )
    },
    { 
      key: 'numberOfPortions', 
      label: 'Number of Portions'
    },
    { 
      key: 'costPerRecipe', 
      label: 'Recipe Cost',
      render: (value) => `$${(value / 100).toFixed(2)}`
    },
    { 
      key: 'costPerPortion', 
      label: 'Cost Per Portion',
      render: (value) => value ? `$${(value / 100).toFixed(2)}` : 'N/A'
    },
    { key: 'description', label: 'Description' },
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
      key: 'instructions',
      label: 'Instructions',
      render: (instructions) => (
        <div className="space-y-2">
          {instructions?.map((inst: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="font-medium">Step {index + 1}:</span>
              <span className="ml-2">{inst.description}</span>
            </div>
          ))}
        </div>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Created At',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'updatedAt', 
      label: 'Last Updated',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  return (
    <PageLayout title="Recipe Details">
      <GenericDetailPage
        title="Recipe Details"
        data={recipe}
        fieldConfig={fieldConfig}
        onBack={() => router.back()}
        isLoading={loading}
        error={error}
        imageKey="images"
        imageBaseUrl="http://13.61.61.180:8080/"
      />
    </PageLayout>
  );
} 