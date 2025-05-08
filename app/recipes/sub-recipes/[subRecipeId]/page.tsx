'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectAllSubRecipes } from '@/store/subRecipeSlice';
import PageLayout from '@/components/PageLayout';
import PreparationFields from '@/components/common/PreparationFields';
import api from '@/store/api';
import Button from '@/components/common/button';
import { ChevronLeft, ChevronRight, ArrowLeft, Download, Loader } from 'lucide-react';
import Image from 'next/image';
import { getImageUrlWithAuth } from '@/utils/imageUtils';
import AuthImage from '@/components/common/AuthImage';
import { generateDetailPDF } from '@/app/utils/pdfGenerator';
import { DetailFieldConfig } from '@/components/common/GenericDetailPage';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';

// Add interface for auth user
interface AuthUser {
  username: string;
  userId: number;
  role: string;
  dashboardMenuList: Array<{ menuName: string }>;
}

const imageBaseUrl = 'http://212.85.26.46:8082/api/v1/images/view'; 

export default function SubRecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const subRecipeId = params.subRecipeId as string;
  const isPreparationMode = searchParams.get('mode') === 'preparation';
  const orderId = searchParams.get('orderId');
  const subRecipes = useSelector(selectAllSubRecipes);
  const [branchId, setBranchId] = useState<number | undefined>();
  const { currency } = useCurrency();
  
  const [subRecipe, setSubRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [formattedCosts, setFormattedCosts] = useState<any>({});
  const [formattedIngredientCosts, setFormattedIngredientCosts] = useState<any>({});

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
    const fetchSubRecipe = async () => {
      try {
        if (subRecipes) {
          const foundSubRecipe = subRecipes.find(r => r.id.toString() === subRecipeId);
          if (foundSubRecipe) {
            setSubRecipe(foundSubRecipe);
            setError(null);
          } else {
            // If sub-recipe not found in store, fetch it directly
            const response = await api.get(`/sub-recipe/${subRecipeId}`);
            if (response.data && response.data.responseCode === "0000") {
              setSubRecipe(response.data.subRecipe);
              setError(null);
            } else {
              setError('Sub-recipe not found');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching sub-recipe:', error);
        setError('Failed to load sub-recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchSubRecipe();
  }, [subRecipes, subRecipeId, setSubRecipe, setError, setLoading]);

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

  useEffect(() => {
    if (subRecipe && isAdmin && currency) {
      const formatCosts = async () => {
        try {
          // Format main costs
          const costs = {
            menuPrice: await formatCurrencyValue(subRecipe.menuPrice || 0, currency),
            idealSellingPrice: await formatCurrencyValue(subRecipe.idealSellingPrice || 0, currency),
            costPerPortion: await formatCurrencyValue(subRecipe.costPerPortion || 0, currency),
            costPerRecipe: await formatCurrencyValue(subRecipe.costPerRecipe || 0, currency),
            marginPerPortion: await formatCurrencyValue(subRecipe.marginPerPortion || 0, currency)
          };
          setFormattedCosts(costs);

          // Format ingredient costs
          if (subRecipe.ingredients) {
            const ingredientCosts: {[key: string]: string} = {};
            for (const ing of subRecipe.ingredients) {
              ingredientCosts[ing.id] = await formatCurrencyValue(ing.recipeCost || 0, currency);
            }
            setFormattedIngredientCosts(ingredientCosts);
          }
        } catch (error) {
          console.error('Error formatting costs:', error);
          setFormattedCosts({});
          setFormattedIngredientCosts({});
        }
      };
      formatCosts();
    }
  }, [subRecipe, currency, isAdmin]);

  const handleNextStep = () => {
    if (subRecipe && subRecipe.procedures && currentStep < subRecipe.procedures.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDownloadPDF = () => {
    if (subRecipe) {
      setIsGeneratingPDF(true);
      
      // Create field configuration for PDF
      const fieldConfig: DetailFieldConfig[] = [
        { key: 'name', label: 'Sub-Recipe Name' },
        { key: 'subRecipeCode', label: 'Recipe Code' },
        { key: 'categoryName', label: 'Category' },
        { key: 'tokenStatus', label: 'Status' },
        { key: 'numberOfPortions', label: 'Number of Portions' },
        { key: 'servingSize', label: 'Serving Size' },
      ];
      
      // Add cost information for admin
      if (isAdmin) {
        fieldConfig.push(
          { key: 'menuPrice', label: 'Menu Price', render: (v) => v ? `$${Number(v).toFixed(2)}` : 'N/A' },
          { key: 'foodCostBudgetPercentage', label: 'Food Cost Budget %', render: (v) => v ? `${Number(v).toFixed(2)}%` : 'N/A' },
          { key: 'foodCostActualPercentage', label: 'Food Cost Actual %', render: (v) => v ? `${Number(v).toFixed(2)}%` : 'N/A' },
          { key: 'idealSellingPrice', label: 'Ideal Selling Price', render: (v) => v ? `$${Number(v).toFixed(2)}` : 'N/A' },
          { key: 'costPerPortion', label: 'Cost Per Portion', render: (v) => v ? `$${Number(v).toFixed(2)}` : 'N/A' },
          { key: 'costPerRecipe', label: 'Cost Per Recipe', render: (v) => v ? `$${Number(v).toFixed(2)}` : 'N/A' },
          { key: 'marginPerPortion', label: 'Margin Per Portion', render: (v) => v ? `$${Number(v).toFixed(2)}` : 'N/A' }
        );
      }
      
      // Small delay to allow state update before the intensive PDF generation
      setTimeout(() => {
        try {
          generateDetailPDF(
            `Sub-Recipe: ${subRecipe.name}`,
            subRecipe,
            fieldConfig,
            '/assets/images/logo.png',
            'images',
            undefined, // Remove imageBaseUrl since we're using the proxy
            undefined, // branchDetails
            undefined, // purchaseOrders
            subRecipe.ingredients ?? [],
            subRecipe.procedures ?? [],
            isAdmin
          );
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          setIsGeneratingPDF(false);
        }
      }, 100);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Sub-Recipe Details">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading sub-recipe details...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !subRecipe) {
    return (
      <PageLayout title="Sub-Recipe Details">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || 'Sub-recipe not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Sub-Recipe Details">
      <div className="space-y-6">
        {/* Header with back button and download PDF button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="mr-2 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{subRecipe.name}</h1>
          </div>
          
          {/* Download PDF Button */}
          <Button 
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-gray-100"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </Button>
        </div>

        {/* Sub-recipe images */}
        {subRecipe.images && subRecipe.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subRecipe.images.map((image: any, index: number) => (
              <div key={image.imageId || index} className="relative h-64 w-full rounded-lg overflow-hidden">
                <AuthImage 
                  src={getImageUrlWithAuth(image.path, imageBaseUrl)}
                  alt={`${subRecipe.name} - Image ${index + 1}`}
                  className="object-cover w-full h-full"
                  fallbackSrc="/placeholder-image.svg"
                />
              </div>
            ))}
          </div>
        )}

        {/* Basic details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Recipe Code</h3>
            <p className="mt-1">{subRecipe.subRecipeCode || 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p className="mt-1">{subRecipe.categoryName || 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                subRecipe.tokenStatus === 'APPROVED' 
                  ? 'bg-green-100 text-green-800' 
                  : subRecipe.tokenStatus === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {subRecipe.tokenStatus || 'DRAFT'}
              </span>
            </p>
          </div>
        </div>

        {/* Portion details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Number of Portions</h3>
            <p className="mt-1">{subRecipe.numberOfPortions || 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Serving Size</h3>
            <p className="mt-1">{subRecipe.servingSize || 'N/A'}</p>
          </div>
        </div>

        {/* Cost information for admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Menu Price</h3>
              <p className="mt-1">{formattedCosts.menuPrice || 'N/A'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Food Cost Budget %</h3>
              <p className="mt-1">{Number(subRecipe.foodCostBudgetPercentage).toFixed(2)}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Food Cost Actual %</h3>
              <p className="mt-1">{Number(subRecipe.foodCostActualPercentage).toFixed(2)}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Ideal Selling Price</h3>
              <p className="mt-1">{formattedCosts.idealSellingPrice || 'N/A'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Cost Per Portion</h3>
              <p className="mt-1">{formattedCosts.costPerPortion || 'N/A'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Cost Per Recipe</h3>
              <p className="mt-1">{formattedCosts.costPerRecipe || 'N/A'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Margin Per Portion</h3>
              <p className="mt-1">{formattedCosts.marginPerPortion || 'N/A'}</p>
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
                  {subRecipe.ingredients?.length === 1 ? (
                    subRecipe.ingredients[0].itemName.includes('@Solid Item') ? (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                    ) : (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                    )
                  ) : (
                    <>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                    </>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield %</th>
                  {isAdmin && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe Cost</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subRecipe.ingredients?.map((ing: any, index: number) => {
                  const isSolidItem = ing.itemName.includes('@Solid Item');
                  const isLiquidItem = ing.itemName.includes('@Liquid Item');
                  const itemName = ing.itemName.split('@')[0];
                  const isSingleIngredient = subRecipe.ingredients?.length === 1;
                  
                  return (
                    <tr key={ing.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{itemName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ing.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ing.unit}</td>
                      {isSingleIngredient ? (
                        isSolidItem ? (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {ing.weight}
                          </td>
                        ) : (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {`${ing.volume}`}
                          </td>
                        )
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {isSolidItem ? `${ing.weight}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {isLiquidItem ? `${ing.volume}` : '-'}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ing.yieldPercentage}%</td>
                      {isAdmin && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formattedIngredientCosts[ing.id] || 'N/A'}
                      </td>}
                    </tr>
                  );
                })}
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
            {subRecipe.procedures && subRecipe.procedures.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Step {currentStep + 1} of {subRecipe.procedures.length}</h3>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-800">{subRecipe.procedures[currentStep].description}</p>
                    {subRecipe.procedures[currentStep].criticalPoint && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 font-medium">Critical Point: {subRecipe.procedures[currentStep].criticalPoint}</p>
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
                      disabled={currentStep === subRecipe.procedures.length - 1}
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
              type="sub-recipe" 
              id={subRecipeId} 
              branchId={branchId}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
} 