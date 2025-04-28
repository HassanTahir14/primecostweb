'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectAllRecipes } from '@/store/recipeSlice';
import PageLayout from '@/components/PageLayout';
import PreparationFields from '@/components/common/PreparationFields';
import api from '@/store/api';
import Button from '@/components/common/button';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

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
  const [currentStep, setCurrentStep] = useState(0);

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

  const handleNextStep = () => {
    if (recipe && recipe.procedures && currentStep < recipe.procedures.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Recipe Details">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading recipe details...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !recipe) {
    return (
      <PageLayout title="Recipe Details">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || 'Recipe not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Recipe Details">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mr-2 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{recipe.name}</h1>
        </div>

        {/* Recipe images */}
        {recipe.images && recipe.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipe.images.map((image: any, index: number) => (
              <div key={image.imageId || index} className="relative h-64 w-full rounded-lg overflow-hidden">
                <Image 
                  src={`${imageBaseUrl}/${image.path}`} 
                  alt={`${recipe.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Recipe details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p className="mt-1">{recipe.categoryName || 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                recipe.tokenStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {recipe.tokenStatus || 'DRAFT'}
              </span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Number of Portions</h3>
            <p className="mt-1">{recipe.numberOfPortions || 'N/A'}</p>
          </div>
        </div>

        {/* Cost information for admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Recipe Cost</h3>
              <p className="mt-1">${(recipe.costPerRecipe / 100).toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Cost Per Portion</h3>
              <p className="mt-1">
                {recipe.costPerPortion ? `$${(recipe.costPerPortion / 100).toFixed(2)}` : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Ingredients table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Ingredients</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield %</th>
                  {isAdmin && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recipe.ingredientsItems?.map((ing: any, index: number) => (
                  <tr key={ing.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ing.itemName.split('@')[0]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ing.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ing.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ing.yieldPercentage}%</td>
                    {isAdmin && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(ing.recipeCost / 100).toFixed(2)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Instructions</h2>
          </div>
          <div className="p-6">
            {recipe.procedures && recipe.procedures.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Step {currentStep + 1} of {recipe.procedures.length}</h3>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-800">{recipe.procedures[currentStep].description}</p>
                    {recipe.procedures[currentStep].criticalPoint && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 font-medium">Critical Point: {recipe.procedures[currentStep].criticalPoint}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      onClick={handlePrevStep} 
                      disabled={currentStep === 0}
                      variant="outline"
                      className="flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button 
                      onClick={handleNextStep} 
                      disabled={currentStep === recipe.procedures.length - 1}
                      className="flex items-center"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No instructions available</p>
            )}
          </div>
        </div>

        {/* Preparation fields if in preparation mode */}
        {isPreparationMode && (
          <div className="mt-8">
            <PreparationFields 
              type="recipe" 
              id={recipeId} 
              branchId={branchId}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
} 