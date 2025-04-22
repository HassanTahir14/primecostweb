'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';

// Assuming SubRecipe structure from a potential subRecipeSlice
interface SubRecipe {
    subRecipeId: number;
    name: string;
    subRecipeCode: string;
    unitName?: string; // Optional UOM from sub-recipe master
    costPerPortion?: number; // Optional cost from sub-recipe master
}

interface TransferSubRecipeTableProps {
  items: any[]; // Current sub-recipes in the transfer
  allSubRecipes: SubRecipe[]; // All available sub-recipes from store
  onChange: (items: any[]) => void;
}

// Mock data removed

const uomOptions = [
    { value: 'liter', label: 'Liter' },
    { value: 'kg', label: 'KG' },
    { value: 'batch', label: 'Batch' },
]

export default function TransferSubRecipeTable({ items, allSubRecipes, onChange }: TransferSubRecipeTableProps) {

  // Prepare options for Select component
  const subRecipeOptions = useMemo(() => {
      const options = allSubRecipes.map(subRecipe => ({
          value: String(subRecipe.subRecipeId), // Use ID as value
          label: `${subRecipe.name} (${subRecipe.subRecipeCode})`
      }));
      return [{ value: '', label: 'Select Sub-Recipe...' }, ...options]; // Add default option
  }, [allSubRecipes]);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto-populate fields when SOURCE sub-recipe is selected
    if (field === 'subRecipeId') {
        const selectedSubRecipeData = allSubRecipes.find(opt => String(opt.subRecipeId) === value);
        if (selectedSubRecipeData) {
            currentItem.subRecipeId = selectedSubRecipeData.subRecipeId; // Ensure ID is stored
            currentItem.subRecipeCode = selectedSubRecipeData.subRecipeCode;
            // Use unitName if available, otherwise keep existing or empty. Default to 'Batch'?
            currentItem.uom = selectedSubRecipeData.unitName || 'Batch';
            currentItem.cost = selectedSubRecipeData.costPerPortion || 0; // Get cost from sub-recipe master
             // Pre-populate target sub-recipe if not already set
             if (!currentItem.targetSubRecipeId) {
                currentItem.targetSubRecipeId = selectedSubRecipeData.subRecipeId;
                currentItem.targetSubRecipeCode = selectedSubRecipeData.subRecipeCode;
            }
        } else {
            currentItem.subRecipeCode = '';
            currentItem.uom = ''; // Clear UOM
            currentItem.cost = 0;
            // Don't clear target if source is cleared
        }
    }

    // Auto-populate TARGET code when TARGET sub-recipe is selected
    if (field === 'targetSubRecipeId') {
        const selectedTargetData = allSubRecipes.find(opt => String(opt.subRecipeId) === value);
        if (selectedTargetData) {
             currentItem.targetSubRecipeId = selectedTargetData.subRecipeId;
             currentItem.targetSubRecipeCode = selectedTargetData.subRecipeCode;
        } else {
            // Clear target code if target sub-recipe selection is invalid
            currentItem.targetSubRecipeCode = '';
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
        subRecipeId: '', // Source Sub-Recipe ID
        subRecipeCode: '',
        targetSubRecipeId: '', // +++ Add Target Sub-Recipe ID +++
        targetSubRecipeCode: '', // +++ Add Target Sub-Recipe Code +++
        quantity: 1,
        uom: 'Batch', // Default UOM
        cost: 0
    }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-0 overflow-hidden">
       <h3 className="text-lg font-semibold p-4 border-b">Sub-Recipes</h3>
       <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">Source Sub-Recipe</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">Source Code</th>
                    <th className="p-3 text-left text-sm font-semibold">Target Sub-Recipe</th>
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
                            value={String(item.subRecipeId || '')} // Source Sub-Recipe ID
                            onChange={(e) => handleItemChange(index, 'subRecipeId', e.target.value)}
                            options={subRecipeOptions} // Use dynamic options
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input
                            value={item.subRecipeCode} // Source Code
                            readOnly
                            className="bg-gray-100"
                            placeholder="Code"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Select
                            value={String(item.targetSubRecipeId || '')} // Target Sub-Recipe ID
                            onChange={(e) => handleItemChange(index, 'targetSubRecipeId', e.target.value)}
                            options={subRecipeOptions} // Use same sub-recipe options
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input
                            value={item.targetSubRecipeCode || ''} // Target Code
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
                <Plus size={16} className="mr-1" /> Add Sub-Recipe
            </Button>
        </div>
    </div>
  );
} 