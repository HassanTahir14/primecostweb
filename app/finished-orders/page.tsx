'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import { Printer } from 'lucide-react';
import api from '@/store/api';
import { generateRecipeLabel } from '@/utils/pdfUtils';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/authSlice';
import { getUserIdFromToken } from '@/utils/authUtils';

interface InventoryLocation {
  inventoryId: number;
  storageLocation: number;
  branchLocation: number;
  storageLocationWithCode: string;
  quantity: number;
  lastUpdated: string;
}

interface PreparedRecipe {
  preparedMainRecipeId: number;
  preparedByUserId: number;
  uom: string;
  expirationDate: string;
  preparedDate: string;
  preparedMainRecipeStatus: string;
  inventoryLocations: InventoryLocation[];
  totalQuantityAcrossLocations: number;
  recipeCode: string;
  mainRecipeBatchNumber: string;
  mainRecipeNameAndDescription: string;
}

interface ApiResponse {
  responseCode: string;
  description: string;
  preparedMainRecipeList: PreparedRecipe[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export default function FinishedOrdersPage() {
  const [recipes, setRecipes] = useState<PreparedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useSelector(selectCurrentUser);
  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchPreparedRecipes = async () => {
      if (!userId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await api.post<ApiResponse>('/inventory/view/prepared-main-recipe', {
          page: 0,
          size: 1000,
          sortBy: "preparedDate",
          direction: "desc"
        });

        if (response.data.responseCode === "0000") {
          const filteredRecipes = response.data.preparedMainRecipeList.filter(
            recipe => Number(recipe.preparedByUserId) === Number(userId)
          );
          console.log('Filtered Recipes:', filteredRecipes);
          setRecipes(filteredRecipes);
        } else {
          setError('Failed to fetch recipes');
        }
      } catch (error) {
        console.error('Error fetching prepared recipes:', error);
        setError('Error fetching recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchPreparedRecipes();
  }, [userId]);

  const handlePrintLabel = async (recipe: PreparedRecipe) => {
    try {
      const labelData = {
        preparedBy: currentUser?.username || 'Unknown User',
        itemName: recipe.mainRecipeNameAndDescription,
        batchNumber: recipe.mainRecipeBatchNumber,
        quantity: `${recipe.totalQuantityAcrossLocations} ${recipe.uom.split('@')[0]}`,
        producedOn: new Date(recipe.preparedDate).toLocaleString(),
        bestBefore: new Date(recipe.expirationDate).toLocaleString(),
      };

      const doc = await generateRecipeLabel(labelData);
      doc.save(`recipe-label-${recipe.preparedMainRecipeId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Prepared Recipes">
        <div className="flex justify-center items-center h-64">
          <p>Loading recipes...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Prepared Recipes">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Prepared Recipes">
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Prepared Recipes</h2>
          
          {recipes.length === 0 ? (
            <p className="text-gray-500">No prepared recipes found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage Location, Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prepared Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recipes.map((recipe) => (
                    <tr key={recipe.preparedMainRecipeId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {recipe.mainRecipeNameAndDescription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {recipe.mainRecipeBatchNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {recipe.totalQuantityAcrossLocations} {recipe.uom.split('@')[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {recipe.inventoryLocations.map((loc: InventoryLocation) => loc.storageLocationWithCode).join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(recipe.preparedDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                          onClick={() => handlePrintLabel(recipe)}
                        >
                          <Printer size={16} className="mr-1" />
                          Print Label
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
} 