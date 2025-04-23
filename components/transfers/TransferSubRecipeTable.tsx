'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';

// Assuming SubRecipe structure from a potential subRecipeSlice
interface SubRecipe {
    id: number;
    name: string;
    subRecipeCode: string;
    costPerPortion?: number;
    ingredientsItems: {
        unit: string;
    }[];
    tokenStatus: string;
}

interface TransferSubRecipeTableProps {
  items: any[];
  allSubRecipes: SubRecipe[];
  onChange: (items: any[]) => void;
  selectedBranchId: string;
  sourceBranchId: string;
  targetBranchId: string;
  units: UnitOfMeasurement[];
}

export default function TransferSubRecipeTable({ 
  items, 
  allSubRecipes, 
  onChange,
  selectedBranchId,
  sourceBranchId,
  targetBranchId,
  units
}: TransferSubRecipeTableProps) {
  // Get units from the hook
  const { units: hookUnits, loading: unitsLoading } = useUnits();

  // Prepare options for Select component
  const subRecipeOptions = useMemo(() => {
      if (sourceBranchId === targetBranchId) {
        return [{ 
          value: '', 
          label: 'Cannot transfer to same branch', 
          disabled: true 
        }];
      }

      const options = allSubRecipes
        .filter(subRecipe => subRecipe.tokenStatus === 'APPROVED')
        .map(subRecipe => ({
          value: String(subRecipe.id),
          label: `${subRecipe.name} (${subRecipe.subRecipeCode})`
        }));
      return [{ value: '', label: 'Select Sub-Recipe...', disabled: true }, ...options];
  }, [allSubRecipes, sourceBranchId, targetBranchId]);

  // Get unique units from sub-recipe ingredients
  const getUnitOptions = (selectedSubRecipeId: string) => {
    const selectedSubRecipe = allSubRecipes.find(subRecipe => String(subRecipe.id) === selectedSubRecipeId);
    if (!selectedSubRecipe) return [];

    // Get unique unit names from sub-recipe ingredients
    const subRecipeUnitNames = Array.from(new Set(selectedSubRecipe.ingredientsItems.map(item => item.unit)));
    
    // Find matching units from the units list
    const subRecipeUnits = units
      .filter(unit => subRecipeUnitNames.includes(unit.unitName))
      .map(unit => ({
        value: unit.unitName,
        label: unit.unitName
      }));

    return [...subRecipeUnits];
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto-populate fields when sub-recipe is selected
    if (field === 'subRecipeId') {
        const selectedSubRecipeData = allSubRecipes.find(opt => String(opt.id) === value);
        if (selectedSubRecipeData) {
            currentItem.subRecipeId = selectedSubRecipeData.id;
            currentItem.subRecipeCode = selectedSubRecipeData.subRecipeCode;
            
            // Get available units for this sub-recipe
            const availableUnits = getUnitOptions(String(selectedSubRecipeData.id));
            
            // Set first available unit as default if exists
            if (availableUnits.length > 0) {
                currentItem.uom = availableUnits[0].value;
            } else {
                currentItem.uom = '';
            }
            
            // Store the base cost (cost per unit/portion)
            currentItem.baseCost = selectedSubRecipeData.costPerPortion || 0;
            currentItem.cost = currentItem.baseCost * (currentItem.quantity || 1);
        } else {
            currentItem.subRecipeCode = '';
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
        subRecipeId: '',
        subRecipeCode: '',
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
       <h3 className="text-lg font-semibold p-4 border-b">Sub-Recipes</h3>
       <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">Sub-Recipe</th>
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
                            value={String(item.subRecipeId || '')}
                            onChange={(e) => handleItemChange(index, 'subRecipeId', e.target.value)}
                            options={subRecipeOptions}
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input
                            value={item.subRecipeCode}
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
                            options={getUnitOptions(String(item.subRecipeId))}
                            className="w-full"
                            disabled={!item.subRecipeId || getUnitOptions(String(item.subRecipeId)).length === 0}
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
                <Plus size={16} className="mr-1" /> Add Sub-Recipe
            </Button>
        </div>
    </div>
  );
} 