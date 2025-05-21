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
import { useTranslation } from '@/context/TranslationContext';

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

interface PreparedSubRecipe {
  preParedSubRecipeId: number;
  preparedByUserId: number;
  subeRecipeCode: string;
  uom: string;
  expirationDate: string;
  preparedDate: string;
  preparedSubRecipeStatus: string;
  inventoryLocations: InventoryLocation[];
  totalQuantityAcrossLocations: number;
  subRecipeBatchNumber: string;
  subRecipeNameAndDescription: string;
}

interface ApiResponse {
  responseCode: string;
  description: string;
  preparedMainRecipeList?: PreparedRecipe[];
  preparedSubRecipeList?: PreparedSubRecipe[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export default function FinishedOrdersPage() {
  const [mainRecipes, setMainRecipes] = useState<PreparedRecipe[]>([]);
  const [subRecipes, setSubRecipes] = useState<PreparedSubRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useSelector(selectCurrentUser);
  const userId = getUserIdFromToken();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPreparedRecipes = async () => {
      if (!userId) {
        setError(t('finishedOrders.userIdNotFound'));
        setLoading(false);
        return;
      }

      try {
        // Fetch main recipes
        const mainResponse = await api.post<ApiResponse>('/inventory/view/prepared-main-recipe', {
          page: 0,
          size: 1000,
          sortBy: "preparedDate",
          direction: "desc"
        });

        // Fetch sub recipes
        const subResponse = await api.post<ApiResponse>('/inventory/view/prepared-sub-recipe', {
          page: 0,
          size: 1000,
          sortBy: "preparedDate",
          direction: "desc"
        });

        if (mainResponse.data.responseCode === "0000" && subResponse.data.responseCode === "0000") {
          const filteredMainRecipes = mainResponse.data.preparedMainRecipeList?.filter(
            recipe => Number(recipe.preparedByUserId) === Number(userId)
          ) || [];
          
          const filteredSubRecipes = subResponse.data.preparedSubRecipeList?.filter(
            recipe => Number(recipe.preparedByUserId) === Number(userId)
          ) || [];

          setMainRecipes(filteredMainRecipes);
          setSubRecipes(filteredSubRecipes);
        } else {
          setError(t('finishedOrders.failedToFetch'));
        }
      } catch (error) {
        console.error('Error fetching prepared recipes:', error);
        setError(t('finishedOrders.errorFetching'));
      } finally {
        setLoading(false);
      }
    };

    fetchPreparedRecipes();
  }, [userId, t]);

  const handlePrintLabel = async (recipe: PreparedRecipe | PreparedSubRecipe) => {
    try {
      const isSubRecipe = 'subeRecipeCode' in recipe;
      const labelData = {
        preparedBy: currentUser?.username || 'Unknown User',
        itemName: isSubRecipe ? recipe.subRecipeNameAndDescription : recipe.mainRecipeNameAndDescription,
        batchNumber: isSubRecipe ? recipe.subRecipeBatchNumber : recipe.mainRecipeBatchNumber,
        quantity: `${recipe.totalQuantityAcrossLocations} ${recipe.uom.split('@')[0]}`,
        producedOn: new Date(recipe.preparedDate).toLocaleString(),
        bestBefore: new Date(recipe.expirationDate).toLocaleString(),
      };

      const doc = await generateRecipeLabel(labelData);
      doc.save(`recipe-label-${isSubRecipe ? recipe.preParedSubRecipeId : recipe.preparedMainRecipeId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <PageLayout title={t('finishedOrders.pageTitle')}>
        <div className="flex justify-center items-center h-64">
          <p>{t('finishedOrders.loading')}</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={t('finishedOrders.pageTitle')}>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('finishedOrders.pageTitle')}>
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('finishedOrders.myPreparedRecipes')}</h2>
          
          {mainRecipes.length === 0 && subRecipes.length === 0 ? (
            <p className="text-gray-500">{t('finishedOrders.noPreparedRecipes')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finishedOrders.recipeName')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finishedOrders.batchNumber')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finishedOrders.quantity')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finishedOrders.storageLocation')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finishedOrders.preparedDate')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finishedOrders.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Main Recipes - flatten by inventory location */}
                  {mainRecipes.flatMap((recipe) =>
                    recipe.inventoryLocations.map((loc: InventoryLocation) => (
                      <tr key={`main-${recipe.preparedMainRecipeId}-loc-${loc.inventoryId}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {recipe.mainRecipeNameAndDescription}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {recipe.mainRecipeBatchNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loc.quantity} {recipe.uom.split('@')[0] === '37' ? 'kg' : recipe.uom.split('@')[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loc.storageLocationWithCode}
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
                            {t('finishedOrders.printLabel')}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Sub Recipes - flatten by inventory location */}
                  {subRecipes.flatMap((recipe) =>
                    recipe.inventoryLocations.map((loc: InventoryLocation) => (
                      <tr key={`sub-${recipe.preParedSubRecipeId}-loc-${loc.inventoryId}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {recipe.subRecipeNameAndDescription}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {recipe.subRecipeBatchNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loc.quantity} {recipe.uom.split('@')[0] === '37' ? 'kg' : recipe.uom.split('@')[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loc.storageLocationWithCode}
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
                            {t('finishedOrders.printLabel')}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}