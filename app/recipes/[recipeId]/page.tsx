'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectAllRecipes } from '@/store/recipeSlice';
import GenericDetailPage, { DetailFieldConfig } from '@/components/common/GenericDetailPage';
import PageLayout from '@/components/PageLayout';
import PreparationFields from '@/components/common/PreparationFields';
import api from '@/store/api';

// Add interface for auth user
interface AuthUser {
  username: string;
  userId: number;
  role: string;
  dashboardMenuList: Array<{ menuName: string }>;
}

const imageBaseUrl = 'http://212.85.26.46:8082/api/v1/images/view'; 

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const recipeId = params.recipeId as string;
  const isPreparationMode = searchParams.get('mode') === 'preparation';
  const orderId = searchParams.get('orderId');
  const recipes = useSelector(selectAllRecipes);
  const [branchId, setBranchId] = useState<number | undefined>();
  
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Get user role from localStorage
  useEffect(() => {
    const authUserStr = localStorage.getItem('authUser');
    if (authUserStr) {
      try {
        const authUser: AuthUser = JSON.parse(authUserStr);
        setIsAdmin(authUser.role === 'Admin');
      } catch (error) {
        console.error('Error parsing auth user:', error);
      }
    }
  }, []);

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

  useEffect(() => {
    // Fetch order details to get branchId if in preparation mode
    if (isPreparationMode && orderId) {
      const fetchOrderDetails = async () => {
        try {
          const response = await api.get('/orders/my');
          const order = response.data?.assignedOrders?.find(
            (o: any) => o.orderId.toString() === orderId
          );
          if (order) {
            setBranchId(order.branchId);
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      };
      fetchOrderDetails();
    }
  }, [isPreparationMode, orderId]);

  const fieldConfig: DetailFieldConfig[] = [
    { key: 'name', label: 'Recipe Name' },
    { key: 'categoryName', label: 'Category' },
    { 
      key: 'tokenStatus', 
      label: 'Status',
      render: (value: string) => (
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
    // Only show cost-related fields to admin users
    ...(isAdmin ? [
      { 
        key: 'costPerRecipe', 
        label: 'Recipe Cost',
        render: (value: number) => `$${(value / 100).toFixed(2)}`
      },
      { 
        key: 'costPerPortion', 
        label: 'Cost Per Portion',
        render: (value: number | null) => value ? `$${(value / 100).toFixed(2)}` : 'N/A'
      }
    ] : []),
   
    {
      key: 'ingredientsItems',
      label: 'Ingredients',
      render: (ingredients: any[]) => (
        <div className="space-y-2">
          {ingredients?.map((ing: any, index: number) => (
            <div key={ing.id || index} className="text-sm">
              <span className="font-medium">{ing.itemName.split('@')[0]}</span>
              <span className="text-gray-600">
                {' - '}{ing.quantity} {ing.unit}
                {' ('}{ing.yieldPercentage}% yield)
                {isAdmin && ` - $${(ing.recipeCost / 100).toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'procedures',
      label: 'Instructions',
      render: (procedures: any[]) => (
        <div className="space-y-2">
          {procedures?.map((proc: any, index: number) => (
            <div key={proc.id || index} className="text-sm">
              <span className="font-medium">Step {index + 1}:</span>
              <span className="ml-2">{proc.description}</span>
              {proc.criticalPoint && (
                <span className="ml-2 text-red-600 font-medium">
                  (Critical Point: {proc.criticalPoint})
                </span>
              )}
            </div>
          ))}
        </div>
      )
    },
   
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
        imageBaseUrl={imageBaseUrl}
      />
      {isPreparationMode && recipe && (
        <div className="mt-8">
          <PreparationFields 
            type="recipe" 
            id={recipeId} 
            branchId={branchId}
          />
        </div>
      )}
    </PageLayout>
  );
} 