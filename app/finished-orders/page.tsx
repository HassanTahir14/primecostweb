'use client';

import { useState, useEffect, useRef } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import { Printer } from 'lucide-react';
import api from '@/store/api';
import { generateRecipeLabel, drawRecipeLabelOnDoc } from '@/utils/pdfUtils';
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
  const [copiesModalOpen, setCopiesModalOpen] = useState(false);
  const [copiesCount, setCopiesCount] = useState(1);
  const [pendingPrintRecipe, setPendingPrintRecipe] = useState<PreparedRecipe | PreparedSubRecipe | null>(null);
  const [pendingPrintLocation, setPendingPrintLocation] = useState<InventoryLocation | null>(null);
  const currentUser = useSelector(selectCurrentUser);
  const userId = getUserIdFromToken();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handlePrintLabel = (recipe: PreparedRecipe | PreparedSubRecipe, location: InventoryLocation) => {
    setPendingPrintRecipe(recipe);
    setPendingPrintLocation(location);
    setCopiesCount(location.quantity || 1);
    setCopiesModalOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const doPrintLabel = async () => {
    if (!pendingPrintRecipe || !pendingPrintLocation) return;
    try {
      const recipe = pendingPrintRecipe;
      const location = pendingPrintLocation;
      const isSubRecipe = 'subeRecipeCode' in recipe;
      const labelData = {
        preparedBy: currentUser?.username || 'Unknown User',
        itemName: isSubRecipe ? recipe.subRecipeNameAndDescription : recipe.mainRecipeNameAndDescription,
        batchNumber: isSubRecipe ? recipe.subRecipeBatchNumber : recipe.mainRecipeBatchNumber,
        quantity: `${location.quantity} Portion(s)`,
        producedOn: new Date(recipe.preparedDate).toLocaleString(),
        bestBefore: new Date(recipe.expirationDate).toLocaleString(),
        storageLocation: location.storageLocationWithCode,
      };
      const { jsPDF } = await import('jspdf');
      const labelWidth = 50; // mm (thermal label width)
      const labelHeight = 30; // mm (thermal label height)
      const contentScale = 0.55; // Reduce content size to fit 90x60mm design into 50x30mm
      const doc = new jsPDF({ unit: 'mm', format: [labelWidth, labelHeight], orientation: 'landscape' });
      for (let i = 0; i < copiesCount; i++) {
        if (i > 0) doc.addPage([labelWidth, labelHeight], 'landscape');
        // Reduce content size by adjusting margins and font size in drawRecipeLabelOnDoc
        drawRecipeLabelOnDoc(doc, labelData, { marginX: 0, marginY: 0, labelWidth, labelHeight, visualOffset: 0, scale: contentScale });
      }
      doc.save(`recipe-label-${isSubRecipe ? recipe.preParedSubRecipeId : recipe.preparedMainRecipeId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setCopiesModalOpen(false);
      setPendingPrintRecipe(null);
      setPendingPrintLocation(null);
    }
  };

  const handlePrintAllLabels = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const allLabels = [
        ...mainRecipes.flatMap(r =>
          r.inventoryLocations.map(loc => ({
            id: r.preparedMainRecipeId,
            itemName: r.mainRecipeNameAndDescription,
            batchNumber: r.mainRecipeBatchNumber,
            quantity: `${loc.quantity} Portion(s)`,
            producedOn: new Date(r.preparedDate).toLocaleString(),
            bestBefore: new Date(r.expirationDate).toLocaleString(),
            storageLocation: loc.storageLocationWithCode,
          }))
        ),
        ...subRecipes.flatMap(r =>
          r.inventoryLocations.map(loc => ({
            id: r.preParedSubRecipeId,
            itemName: r.subRecipeNameAndDescription,
            batchNumber: r.subRecipeBatchNumber,
            quantity: `${loc.quantity} Portion(s)`,
            producedOn: new Date(r.preparedDate).toLocaleString(),
            bestBefore: new Date(r.expirationDate).toLocaleString(),
            storageLocation: loc.storageLocationWithCode,
          }))
        ),
      ];
      if (allLabels.length === 0) return;
      const labelWidth = 50; // mm (thermal label width)
      const labelHeight = 30; // mm (thermal label height)
      const contentScale = 0.55; // Reduce content size to fit 90x60mm design into 50x30mm
      const doc = new jsPDF({ unit: 'mm', format: [labelWidth, labelHeight], orientation: 'landscape' });
      for (let i = 0; i < allLabels.length; i++) {
        if (i > 0) doc.addPage([labelWidth, labelHeight], 'landscape');
        drawRecipeLabelOnDoc(doc, {
          preparedBy: currentUser?.username || 'Unknown User',
          ...allLabels[i],
        }, { marginX: 0, marginY: 0, labelWidth, labelHeight, visualOffset: 0, scale: contentScale });
      }
      doc.save('all-recipe-labels.pdf');
    } catch (error) {
      console.error('Error generating all labels PDF:', error);
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
      <div className="container mx-auto px-4 md:px-2">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('finishedOrders.myPreparedRecipes')}</h2>
            <Button
              variant="default"
              size="sm"
              className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
              onClick={handlePrintAllLabels}
            >
              <Printer size={16} className="mr-1" />
              {t('finishedOrders.printAllLabels')}
            </Button>
          </div>
          
          {mainRecipes.length === 0 && subRecipes.length === 0 ? (
            <p className="text-gray-500">{t('finishedOrders.noPreparedRecipes')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">{t('finishedOrders.recipeName')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">{t('finishedOrders.batchNumber')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">{t('finishedOrders.quantity')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">{t('finishedOrders.storageLocation')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">{t('finishedOrders.preparedDate')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">{t('finishedOrders.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Main Recipes - flatten by inventory location */}
                  {mainRecipes.flatMap((recipe) =>
                    recipe.inventoryLocations.map((loc: InventoryLocation) => (
                      <tr key={`main-${recipe.preparedMainRecipeId}-loc-${loc.inventoryId}`}>
                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {recipe.mainRecipeNameAndDescription}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {recipe.mainRecipeBatchNumber}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {loc.quantity} Portion(s)
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {loc.storageLocationWithCode}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(recipe.preparedDate).toLocaleString()}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                            onClick={() => handlePrintLabel(recipe, loc)}
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
                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {recipe.subRecipeNameAndDescription}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {recipe.subRecipeBatchNumber}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {loc.quantity} Portion(s)
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {loc.storageLocationWithCode}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(recipe.preparedDate).toLocaleString()}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                            onClick={() => handlePrintLabel(recipe, loc)}
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

      {/* Copies Modal */}
      {copiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">{t('finishedOrders.howManyCopies') || 'How many copies do you want?'}</h3>
            <input
              ref={inputRef}
              type="number"
              min={1}
              value={copiesCount}
              onChange={e => setCopiesCount(Math.max(1, Number(e.target.value)))}
              className="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-[#00997B]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setCopiesModalOpen(false); setPendingPrintRecipe(null); }}>{t('common.cancel')}</Button>
              <Button onClick={doPrintLabel}>{t('common.ok')}</Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}