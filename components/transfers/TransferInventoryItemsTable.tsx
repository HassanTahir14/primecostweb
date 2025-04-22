'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';

// Assuming Item structure from a potential itemsSlice
interface Item {
    itemId: number;
    name: string;
    code: string;
    primaryUnitName?: string; // Optional UOM from item master
    purchaseCostWithVat?: number;
    purchaseCostWithoutVat?: number;
    cost?: number; // Keep original cost field for internal state if needed
}

interface TransferInventoryItemsTableProps {
  items: any[]; // Current items in the transfer
  allItems: Item[]; // All available items from store
  onChange: (items: any[]) => void;
}

// Mock data removed

const uomOptions = [
    { value: 'kg', label: 'KG' },
    { value: 'ltr', label: 'Liter' },
    { value: 'pcs', label: 'Pieces' },
    { value: 'pack', label: 'Pack' },
    // Add more standard UOMs if needed
]

export default function TransferInventoryItemsTable({ items, allItems, onChange }: TransferInventoryItemsTableProps) {
  
  // Prepare options for Select component (used for both source and target)
  const itemOptions = useMemo(() => {
    const options = allItems.map(item => ({ 
        value: String(item.itemId), // Use ID as value
        label: `${item.name} (${item.code})` 
    }));
    return [{ value: '', label: 'Select Item...', disabled: true }, ...options];
  }, [allItems]);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto-populate fields when SOURCE item is selected
    if (field === 'itemId') {
        const selectedItemData = allItems.find(opt => String(opt.itemId) === value);
        if (selectedItemData) {
            currentItem.itemId = selectedItemData.itemId; // Ensure ID is stored
            currentItem.sourceItemCode = selectedItemData.code;
            // Set default UOM and Cost based on SOURCE item
            currentItem.uom = selectedItemData.primaryUnitName || currentItem.uom || ''; 
            // Use purchaseCostWithVat for cost (adjust if needed)
            currentItem.cost = selectedItemData.purchaseCostWithVat || 0;
            // Pre-populate target item if not already set?
            if (!currentItem.targetItemId) {
                currentItem.targetItemId = selectedItemData.itemId;
                currentItem.targetItemCode = selectedItemData.code;
            }
        } else {
             // Clear fields if selection is invalid
            currentItem.sourceItemCode = '';
            // Don't clear target if source is cleared, maybe user wants to keep it?
            // currentItem.targetItemId = ''; 
            // currentItem.targetItemCode = ''; 
            currentItem.uom = '';
            currentItem.cost = 0;
        }
    }

    // Auto-populate TARGET code when TARGET item is selected
    if (field === 'targetItemId') {
        const selectedTargetItemData = allItems.find(opt => String(opt.itemId) === value);
        if (selectedTargetItemData) {
             currentItem.targetItemId = selectedTargetItemData.itemId;
             currentItem.targetItemCode = selectedTargetItemData.code;
        } else {
            // Clear target code if target item selection is invalid
            currentItem.targetItemCode = '';
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
        itemId: '', // Source Item ID
        sourceItemCode: '', 
        targetItemId: '', // +++ Add Target Item ID +++
        targetItemCode: '', 
        quantity: 1, // Default quantity to 1?
        uom: '', 
        cost: 0 
    }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index); 
    onChange(newItems);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-0 overflow-hidden">
      <h3 className="text-lg font-semibold p-4 border-b">Inventory Items</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]"> 
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">Source Item</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">Source Code</th>
                    <th className="p-3 text-left text-sm font-semibold">Target Item</th>
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
                            value={String(item.itemId || '')} // Source Item ID
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                            options={itemOptions} // Use dynamic options
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            value={item.sourceItemCode}
                            readOnly 
                            className="bg-gray-100"
                            placeholder="Code"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Select 
                            value={String(item.targetItemId || '')} // Target Item ID
                            onChange={(e) => handleItemChange(index, 'targetItemId', e.target.value)}
                            options={itemOptions} // Use same options
                            className="w-full"
                        />
                    </td>
                     <td className="p-2 align-top">
                        <Input 
                            value={item.targetItemCode} // Populated by targetItemId change
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
                            options={[{ value: '', label: 'Select Unit...' }, ...uomOptions]} // Removed disabled prop
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            type="number"
                            value={item.cost} // Use cost field
                            onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                            placeholder="Cost" 
                            className="bg-gray-100" // Make cost read-only from master?
                            readOnly // Assuming cost comes from selected item
                            // prefix="USD" - Add manually if needed
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