'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';
import { useTranslation } from '@/context/TranslationContext';

// Assuming Recipe structure from a potential recipeSlice
interface Recipe {
    preparedMainRecipeId: number;
    preparedByUserId: number;
    uom: string;
    expirationDate: string;
    preparedDate: string;
    preparedMainRecipeStatus: string;
    inventoryLocations: Array<{
        inventoryId: number;
        storageLocation: number;
        branchLocation: number;
        storageLocationWithCode: string;
        quantity: number;
        lastUpdated: string;
    }>;
    totalQuantityAcrossLocations: number;
    recipeCode: string;
    mainRecipeBatchNumber: string;
    mainRecipeNameAndDescription: string;
    totalCost?: number | null;
}

interface TransferRecipeTableProps {
  items: any[];
  allRecipes: Recipe[];
  onChange: (items: any[]) => void;
  selectedBranchId: string;
  sourceBranchId: string;
  targetBranchId: string;
  units: any[];
}

export default function TransferRecipeTable({ 
  items, 
  allRecipes, 
  onChange,
  selectedBranchId,
  sourceBranchId,
  targetBranchId,
  units
}: TransferRecipeTableProps) {
  const { t } = useTranslation();
  // Get units from the hook
  const { units: hookUnits, loading: unitsLoading } = useUnits();

  // Prepare options for Select component
  const recipeOptions = useMemo(() => {
    // Check if source and target branches are the same
    if (sourceBranchId === targetBranchId && sourceBranchId !== '') {
      return [{ 
        value: '', 
        label: t('transfers.selectRecipe'), 
        disabled: true 
      }];
    }

    // Filter recipes based on selected branch
    const filteredRecipes = allRecipes.filter(recipe => 
      recipe.inventoryLocations.some(loc => 
        loc.branchLocation === parseInt(sourceBranchId) && 
        loc.quantity > 0
      )
    );
    
    const options = filteredRecipes.map(recipe => ({ 
        value: String(recipe.preparedMainRecipeId),
        label: `${recipe.mainRecipeNameAndDescription} (${recipe.inventoryLocations[0].storageLocationWithCode})`,
        disabled: false
    }));
    return [ ...options];
  }, [allRecipes, sourceBranchId, targetBranchId, t]);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto-populate fields when recipe is selected
    if (field === 'recipeId') {
        const selectedRecipeData = allRecipes.find(opt => String(opt.preparedMainRecipeId) === value);
        if (selectedRecipeData) {
            currentItem.recipeId = selectedRecipeData.preparedMainRecipeId;
            currentItem.recipeCode = selectedRecipeData.recipeCode;
            // Get available quantity for selected branch
            const branchLocation = selectedRecipeData.inventoryLocations.find(
              loc => loc.branchLocation === parseInt(sourceBranchId)
            );
            currentItem.availableQuantity = branchLocation?.quantity || 0;
            // Always set uom to '37' and display 'KG'
            currentItem.uom = '37';
            // Set cost directly from totalCost in API response
            currentItem.baseCost = selectedRecipeData.totalCost ?? 0;
            currentItem.cost = selectedRecipeData.totalCost ?? 0;
        } else {
            currentItem.recipeCode = '';
            currentItem.uom = '37';
            currentItem.baseCost = 0;
            currentItem.cost = 0;
            currentItem.availableQuantity = 0;
        }
    }

    // Update cost when quantity changes
    if (field === 'quantity') {
        const quantity = parseFloat(value) || 0;
        if (quantity > currentItem.availableQuantity) {
            currentItem.quantity = currentItem.availableQuantity;
        } else {
            currentItem.quantity = quantity;
        }
        // Keep cost as unit cost from totalCost, do not multiply by quantity
        // (no change needed here)
    }

    newItems[index] = currentItem;
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, {
        recipeId: '',
        recipeCode: '',
        quantity: 1,
        uom: '',
        cost: 0
    }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  if (unitsLoading) {
    return <div>{t('transfers.loadingUnits')}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm relative">
      {/* Show available quantity in the top right, outside the table, as in the screenshot */}
      {items && items[0] && items[0].availableQuantity !== undefined && (
        <div className="absolute right-4 top-2 text-base font-semibold text-black">
          {t('transfers.availableQuantity')}: <span className="font-bold">{items[0].availableQuantity} Portion(s)</span>
        </div>
      )}
      <h3 className="text-lg font-semibold p-4 border-b">{t('transfers.recipes')}</h3>
      {sourceBranchId === targetBranchId && sourceBranchId !== '' && (
        <div className="px-4 py-2 text-red-600 text-sm font-medium">
          {t('transfers.cannotTransferSameBranchRecipes')}
        </div>
      )}
      <div className="w-full">
        <table className="w-full">
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">{t('transfers.recipe')}</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">{t('transfers.code')}</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">{t('transfers.quantity')}</th>
                    {/* <th className="p-3 text-left text-sm font-semibold w-32">{t('transfers.uom')}</th> */}
                    <th className="p-3 text-left text-sm font-semibold w-24">{t('transfers.cost')}</th>
                    <th className="p-3 text-left text-sm font-semibold w-16"></th>
                </tr>
            </thead>
            <tbody>
            {items.map((item, index) => (
                <tr key={index} className="border-b last:border-none">
                    <td className="p-2 align-top min-w-[200px] w-2/5 md:w-auto">
                        <Select
                            value={String(item.recipeId || '')}
                            onChange={(e) => handleItemChange(index, 'recipeId', e.target.value)}
                            options={recipeOptions}
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input
                            value={item.recipeCode}
                            readOnly
                            className="bg-gray-100"
                            placeholder={t('transfers.code')}
                        />
                    </td>
                    {/* <td className="p-2 align-top">
                        <Input
                            value={item.availableQuantity || 0}
                            readOnly
                            className="bg-gray-100"
                            placeholder="Available"
                        />
                    </td> */}
                    <td className="p-2 align-top">
                        {/* Show available quantity above the input */}
                        {/* {item.availableQuantity !== undefined && (
                            <div className="text-xs text-gray-500 mb-1">
                                Available: <span className="font-semibold">{item.availableQuantity}</span>
                            </div>
                        )} */}
                        <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder={t('transfers.qty')}
                            min="1"
                            max={item.availableQuantity || 0}
                            step="any"
                        />
                    </td>
                    {/* <td className="p-2 align-top">
                         <Input
                            value="KG"
                            readOnly
                            className="bg-gray-100"
                            disabled
                         />
                    </td> */}
                    <td className="p-2 align-top">
                        <Input
                            type="number"
                            value={item.cost ?? 0}
                            placeholder={t('transfers.cost')}
                            readOnly
                            className="bg-gray-100"
                            step="0.01"
                        />
                    </td>
                    <td className="p-2 align-top text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
        <div className="p-3 bg-gray-50 border-t">
            <Button variant="outline" size="sm" onClick={addItem} className="text-[#00997B] border-[#00997B] hover:bg-[#E8FFFE]">
                <Plus size={16} className="mr-1" /> {t('transfers.addRecipe')}
            </Button>
        </div>
    </div>
  );
}