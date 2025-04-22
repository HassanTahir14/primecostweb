'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';

// Assuming Recipe structure from a potential recipeSlice
interface Recipe {
    id: number;
    name: string;
    recipeCode: string;
    costPerPortion?: number;
    ingredientsItems: {
        unit: string;
    }[];
    status: string;  // Add status field
}

interface TransferRecipeTableProps {
  items: any[];
  allRecipes: Recipe[];
  onChange: (items: any[]) => void;
  selectedBranchId: string;
  sourceBranchId: string;
}

export default function TransferRecipeTable({ 
  items, 
  allRecipes, 
  onChange,
  selectedBranchId,
  sourceBranchId
}: TransferRecipeTableProps) {
  // Get units from the hook
  const { units, loading: unitsLoading } = useUnits();

  // Prepare options for Select component
  const recipeOptions = useMemo(() => {
      if (selectedBranchId === sourceBranchId) {
        return [{ 
          value: '', 
          label: 'Cannot transfer to same branch', 
          disabled: true 
        }];
      }

      const options = allRecipes
        .filter(recipe => recipe.status === 'APPROVED')
        .map(recipe => ({
          value: String(recipe.id),
          label: `${recipe.name} (${recipe.recipeCode})`
        }));
      return [{ value: '', label: 'Select Recipe...', disabled: true }, ...options];
  }, [allRecipes, selectedBranchId, sourceBranchId]);

  // Get unique units from recipe ingredients
  const getUnitOptions = (selectedRecipeId: string) => {
    const selectedRecipe = allRecipes.find(recipe => String(recipe.id) === selectedRecipeId);
    if (!selectedRecipe) return [];

    // Get unique unit names from recipe ingredients
    const recipeUnitNames = Array.from(new Set(selectedRecipe.ingredientsItems.map(item => item.unit)));
    
    // Find matching units from the units list
    const recipeUnits = units
      .filter(unit => recipeUnitNames.includes(unit.unitName))
      .map(unit => ({
        value: String(unit.unitOfMeasurementId),
        label: unit.unitName
      }));

    return [...recipeUnits];
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto-populate fields when recipe is selected
    if (field === 'recipeId') {
        const selectedRecipeData = allRecipes.find(opt => String(opt.id) === value);
        if (selectedRecipeData) {
            currentItem.recipeId = selectedRecipeData.id;
            currentItem.recipeCode = selectedRecipeData.recipeCode;
            
            // Get available units for this recipe
            const availableUnits = getUnitOptions(value);
            
            // Set first available unit as default if exists
            if (availableUnits.length > 0) {
                currentItem.uom = availableUnits[0].value;
            } else {
                currentItem.uom = '';
            }
            
            // Store the base cost (cost per unit/portion)
            currentItem.baseCost = selectedRecipeData.costPerPortion || 0;
            currentItem.cost = currentItem.baseCost * (currentItem.quantity || 1);
        } else {
            currentItem.recipeCode = '';
            currentItem.uom = '';
            currentItem.baseCost = 0;
            currentItem.cost = 0;
        }
    }

    // Update cost when quantity changes
    if (field === 'quantity') {
        const quantity = parseFloat(value) || 0;
        currentItem.quantity = quantity;
        // Calculate new cost based on base cost and quantity
        currentItem.cost = (currentItem.baseCost || 0) * quantity;
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
    return <div>Loading units...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-0 overflow-hidden">
      <h3 className="text-lg font-semibold p-4 border-b">Recipes</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">Recipe</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">Code</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">Quantity</th>
                    <th className="p-3 text-left text-sm font-semibold w-32">UOM</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">Cost</th>
                    <th className="p-3 text-left text-sm font-semibold w-16"></th>
                </tr>
            </thead>
            <tbody>
            {items.map((item, index) => (
                <tr key={index} className="border-b last:border-none">
                    <td className="p-2 align-top">
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
                            placeholder="Code"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            min="0"
                            step="any"
                        />
                    </td>
                    <td className="p-2 align-top">
                         <Select
                            value={item.uom}
                            onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                            options={getUnitOptions(String(item.recipeId))}
                            className="w-full"
                            disabled={!item.recipeId || getUnitOptions(String(item.recipeId)).length === 0}
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input
                            type="number"
                            value={item.cost}
                            onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                            placeholder="Cost"
                            readOnly
                            className="bg-gray-100"
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
                <Plus size={16} className="mr-1" /> Add Recipe
            </Button>
        </div>
    </div>
  );
} 