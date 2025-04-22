'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';

// Assuming Recipe structure from a potential recipeSlice
interface Recipe {
    recipeId: number;
    name: string;
    recipeCode: string;
    unitName?: string; // Optional UOM from recipe master
    costPerPortion?: number; // Optional cost from recipe master
}

interface TransferRecipeTableProps {
  items: any[]; // Current recipes in the transfer
  allRecipes: Recipe[]; // All available recipes from store
  onChange: (items: any[]) => void;
}

// Mock data removed

const uomOptions = [
    { value: 'portion', label: 'Portion' },
    { value: 'serving', label: 'Serving' },
    { value: 'batch', label: 'Batch' },
]

export default function TransferRecipeTable({ items, allRecipes, onChange }: TransferRecipeTableProps) {

  // Prepare options for Select component
  const recipeOptions = useMemo(() => {
      const options = allRecipes.map(recipe => ({
          value: String(recipe.recipeId), // Use ID as value
          label: `${recipe.name} (${recipe.recipeCode})`
      }));
      return [{ value: '', label: 'Select Recipe...' }, ...options]; // Add default option
  }, [allRecipes]);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto-populate fields when SOURCE recipe is selected
    if (field === 'recipeId') {
        const selectedRecipeData = allRecipes.find(opt => String(opt.recipeId) === value);
        if (selectedRecipeData) {
            currentItem.recipeId = selectedRecipeData.recipeId; // Ensure ID is stored
            currentItem.recipeCode = selectedRecipeData.recipeCode;
            // Use unitName if available, otherwise keep existing or empty. Default to 'Portion'?
            currentItem.uom = selectedRecipeData.unitName || 'Portion';
            currentItem.cost = selectedRecipeData.costPerPortion || 0; // Get cost from recipe master
            // Pre-populate target recipe if not already set
            if (!currentItem.targetRecipeId) {
                currentItem.targetRecipeId = selectedRecipeData.recipeId;
                currentItem.targetRecipeCode = selectedRecipeData.recipeCode;
            }
        } else {
            currentItem.recipeCode = '';
            currentItem.uom = ''; // Clear UOM
            currentItem.cost = 0;
            // Don't clear target if source is cleared
        }
    }

    // Auto-populate TARGET code when TARGET recipe is selected
    if (field === 'targetRecipeId') {
        const selectedTargetData = allRecipes.find(opt => String(opt.recipeId) === value);
        if (selectedTargetData) {
             currentItem.targetRecipeId = selectedTargetData.recipeId;
             currentItem.targetRecipeCode = selectedTargetData.recipeCode;
        } else {
            // Clear target code if target recipe selection is invalid
            currentItem.targetRecipeCode = '';
        }
    }

    // Ensure quantity and cost are numbers
    if (field === 'quantity' || field === 'cost') {
        currentItem[field] = parseFloat(value) || 0;
    }

    newItems[index] = currentItem;
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, {
        recipeId: '', // Source Recipe ID
        recipeCode: '',
        targetRecipeId: '', // +++ Add Target Recipe ID +++
        targetRecipeCode: '', // +++ Add Target Recipe Code +++
        quantity: 1,
        uom: 'Portion', // Default UOM
        cost: 0
    }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-0 overflow-hidden">
      <h3 className="text-lg font-semibold p-4 border-b">Recipes</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">Source Recipe</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">Source Code</th>
                    <th className="p-3 text-left text-sm font-semibold">Target Recipe</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">Target Code</th>
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
                            value={String(item.recipeId || '')} // Source Recipe ID
                            onChange={(e) => handleItemChange(index, 'recipeId', e.target.value)}
                            options={recipeOptions} // Use dynamic options
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input
                            value={item.recipeCode} // Source Code
                            readOnly
                            className="bg-gray-100"
                            placeholder="Code"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Select
                            value={String(item.targetRecipeId || '')} // Target Recipe ID
                            onChange={(e) => handleItemChange(index, 'targetRecipeId', e.target.value)}
                            options={recipeOptions} // Use same recipe options
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input
                            value={item.targetRecipeCode || ''} // Target Code
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
                        />
                    </td>
                    <td className="p-2 align-top">
                         <Select
                            value={item.uom}
                            onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                            options={[{ value: '', label: 'Select Unit...' }, ...uomOptions]} // Add default
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input
                            type="number"
                            value={item.cost} // Use cost
                            onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                            placeholder="Cost"
                            readOnly // Cost from master
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