'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';

// Define interfaces for better type safety
interface UnitOfMeasurement {
  unitOfMeasurementId: number;
  unitName: string;
  unitDescription: string;
}

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
  targetBranchId: string;
  units: UnitOfMeasurement[];
}

export default function TransferInventoryItemsTable({ 
  items, 
  allItems, 
  onChange, 
  selectedBranchId,
  sourceBranchId,
  targetBranchId,
  units
}: TransferInventoryItemsTableProps) {
  
  // Prepare options for Select component
  const itemOptions = useMemo(() => {
    // Check if source and target branches are the same
    if (sourceBranchId === targetBranchId && sourceBranchId !== '') {
      return [{ 
        value: '', 
        label: 'Select an item', 
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
    return [ ...options];
  }, [allItems, sourceBranchId, targetBranchId]);

  // Prepare unit options based on selected item
  const getUnitOptions = (selectedItemId: string) => {
    const selectedItem = allItems.find(item => String(item.itemId) === selectedItemId);
    if (!selectedItem) return [{ value: '', label: 'Select Unit...', disabled: true }];

    // Get all available units for this item
    const availableUnits = units.filter(unit => {
      // Include primary unit
      if (selectedItem.primaryUnitId === unit.unitOfMeasurementId) return true;
      // Include secondary unit if it exists
      if (selectedItem.secondaryUnitId === unit.unitOfMeasurementId) return true;
      return false;
    });

    // Map units to options format
    const unitOptions = availableUnits.map(unit => ({
      value: String(unit.unitOfMeasurementId),
      label: unit.unitName,
      disabled: false
    }));

    // If no units found, return default option
    if (unitOptions.length === 0) {
      return [{ value: '', label: 'No units available', disabled: true }];
    }

    return unitOptions;
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
            
            // Store the base cost and unit values
            currentItem.baseCost = selectedItemData.purchaseCostWithVat || 0;
            currentItem.primaryUnitValue = selectedItemData.primaryUnitValue || 1;
            currentItem.secondaryUnitValue = selectedItemData.secondaryUnitValue || 1;
            currentItem.primaryUnitId = selectedItemData.primaryUnitId;
            currentItem.secondaryUnitId = selectedItemData.secondaryUnitId;
            
            // Calculate initial cost based on primary unit
            currentItem.cost = currentItem.baseCost * (currentItem.quantity || 1);
        } else {
            currentItem.itemCode = '';
            currentItem.uom = '';
            currentItem.baseCost = 0;
            currentItem.cost = 0;
            currentItem.primaryUnitValue = 1;
            currentItem.secondaryUnitValue = 1;
        }
    }
    
    // Update cost when quantity or unit changes
    if (field === 'quantity' || field === 'uom') {
        const quantity = parseFloat(currentItem.quantity) || 0;
        const selectedUnitId = parseInt(currentItem.uom);
        
        // Calculate cost based on selected unit
        if (selectedUnitId === currentItem.primaryUnitId) {
            // If primary unit is selected, use base cost directly
            currentItem.cost = currentItem.baseCost * quantity;
        } else if (selectedUnitId === currentItem.secondaryUnitId) {
            // If secondary unit is selected, adjust cost based on unit value ratio
            const unitRatio = currentItem.secondaryUnitValue / currentItem.primaryUnitValue;
            currentItem.cost = (currentItem.baseCost / unitRatio) * quantity;
        }
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold p-4 border-b">Inventory Items</h3>
      {sourceBranchId === targetBranchId && sourceBranchId !== '' && (
        <div className="px-4 py-2 text-red-600 text-sm font-medium">
          Cannot transfer items to the same branch
        </div>
      )}
      <div className="w-full">
        <table className="w-full"> 
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
                            step="0.01"
                            min="0"
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