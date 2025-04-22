'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';

// Assuming Item structure from a potential itemsSlice
interface Item {
    itemId: number;
    name: string;
    code: string;
    primaryUnitId?: number;
    secondaryUnitId?: number;
    primaryUnitValue?: number;
    secondaryUnitValue?: number;
    purchaseCostWithVat?: number;
    purchaseCostWithoutVat?: number;
    cost?: number;
    branchDetails: {
        branchId: number;
        branchName: string;
        storageLocationId: number;
        storageLocationName: string;
        quantity: number;
    }[];
}

interface TransferInventoryItemsTableProps {
  items: any[];
  allItems: Item[];
  onChange: (items: any[]) => void;
  selectedBranchId: string;
  sourceBranchId: string;
}

// Mock data removed

export default function TransferInventoryItemsTable({ 
  items, 
  allItems, 
  onChange, 
  selectedBranchId,
  sourceBranchId 
}: TransferInventoryItemsTableProps) {
  // Get units from the hook
  const { units, loading: unitsLoading } = useUnits();
  
  // Prepare options for Select component
  const itemOptions = useMemo(() => {
    if (selectedBranchId === sourceBranchId) {
      return [{ 
        value: '', 
        label: 'Cannot transfer to same branch', 
        disabled: true 
      }];
    }

    // Filter items based on selected branch
    const filteredItems = allItems.filter(item => 
      item.branchDetails.some(branch => String(branch.branchId) === sourceBranchId)
    );
    
    const options = filteredItems.map(item => ({ 
        value: String(item.itemId),
        label: `${item.name.split('@')[0]} (${item.code})`,
        disabled: false
    }));
    return [{ value: '', label: 'Select Item...', disabled: true }, ...options];
  }, [allItems, selectedBranchId, sourceBranchId]);

  // Prepare unit options based on selected item
  const getUnitOptions = (selectedItemId: string) => {
    const selectedItem = allItems.find(item => String(item.itemId) === selectedItemId);
    if (!selectedItem) return [{ value: '', label: 'Select Unit...', disabled: true }];

    // Filter units to only include primary and secondary units of the selected item
    const itemUnits = units
      .filter(unit => 
        unit.unitOfMeasurementId === selectedItem.primaryUnitId || 
        unit.unitOfMeasurementId === selectedItem.secondaryUnitId
      )
      .map(unit => ({
        value: String(unit.unitOfMeasurementId),
        label: unit.unitName,
        disabled: false
      }));

    return [ ...itemUnits];
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto-populate fields when item is selected
    if (field === 'itemId') {
        const selectedItemData = allItems.find(opt => String(opt.itemId) === value);
        if (selectedItemData) {
            currentItem.itemId = selectedItemData.itemId;
            currentItem.itemCode = selectedItemData.code;
            // Set primary unit as default
            currentItem.uom = selectedItemData.primaryUnitId?.toString() || '';
            
            // Store the base cost (cost per unit)
            currentItem.baseCost = selectedItemData.purchaseCostWithVat || 0;
            currentItem.cost = currentItem.baseCost * (currentItem.quantity || 1);
        } else {
            currentItem.itemCode = '';
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
        itemId: '',
        itemCode: '',
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
      <h3 className="text-lg font-semibold p-4 border-b">Inventory Items</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]"> 
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">Item</th>
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
                            value={String(item.itemId || '')}
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                            options={itemOptions}
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            value={item.itemCode}
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
                            options={getUnitOptions(String(item.itemId))}
                            className="w-full"
                            disabled={!item.itemId}
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            type="number"
                            value={item.cost}
                            onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                            placeholder="Cost" 
                            className="bg-gray-100"
                            readOnly
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
                <Plus size={16} className="mr-1" /> Add Item
            </Button>
        </div>
    </div>
  );
} 