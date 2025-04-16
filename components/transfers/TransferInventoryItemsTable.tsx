'use client';

import { useState } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';

interface TransferInventoryItemsTableProps {
  items: any[];
  onChange: (items: any[]) => void;
}

// Mock data for item selection - replace with actual data fetching/search
const itemOptions = [
  { value: 'item1', label: 'Flour (Item Code: FLR001)' },
  { value: 'item2', label: 'Sugar (Item Code: SUG002)' },
  { value: 'item3', label: 'Eggs (Item Code: EGG003)' },
];

const uomOptions = [
    { value: 'kg', label: 'KG' },
    { value: 'ltr', label: 'Liter' },
    { value: 'pcs', label: 'Pieces' },
    { value: 'pack', label: 'Pack' },
]

export default function TransferInventoryItemsTable({ items, onChange }: TransferInventoryItemsTableProps) {
  
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // TODO: Add logic to auto-populate source/target codes based on selected item if needed
    if (field === 'sourceItemName') {
        const selectedItem = itemOptions.find(opt => opt.value === value);
        // Example: Extract code from label or fetch details
        newItems[index].sourceItemCode = selectedItem ? selectedItem.label.split(': ')[1]?.replace(')','') : '';
        // Assume target item is the same for now
        newItems[index].targetItemName = value;
        newItems[index].targetItemCode = newItems[index].sourceItemCode;
    }
    
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { 
        sourceItemName: '', 
        sourceItemCode: '', 
        targetItemName: '', 
        targetItemCode: '', 
        quantity: 0, 
        uom: '', 
        costWithVAT: 0 
    }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-0 overflow-hidden"> 
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]"> 
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">Source Item Name</th>
                    <th className="p-3 text-left text-sm font-semibold w-32">Source Item Code</th>
                    <th className="p-3 text-left text-sm font-semibold">Target Item Name</th>
                    <th className="p-3 text-left text-sm font-semibold w-32">Target Item Code</th>
                    <th className="p-3 text-left text-sm font-semibold w-24">Quantity</th>
                    <th className="p-3 text-left text-sm font-semibold w-32">UOM</th>
                    <th className="p-3 text-left text-sm font-semibold w-32">Cost With VAT</th>
                    <th className="p-3 text-left text-sm font-semibold w-16"></th> { /* Action column */}
                </tr>
            </thead>
            <tbody>
            {items.map((item, index) => (
                <tr key={index} className="border-b last:border-none">
                    <td className="p-2 align-top">
                        <Select 
                            value={item.sourceItemName}
                            onChange={(e) => handleItemChange(index, 'sourceItemName', e.target.value)}
                            options={itemOptions}
                            placeholder="Select Item"
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            value={item.sourceItemCode}
                            readOnly 
                            placeholder="Code"
                        />
                    </td>
                    <td className="p-2 align-top">
                         {/* Assuming target is same as source for now, could be a Select too */}
                         <Input 
                            value={item.sourceItemName ? itemOptions.find(opt => opt.value === item.sourceItemName)?.label.split(' (')[0] : ''} 
                            readOnly 
                            placeholder="Target Item"
                        />
                    </td>
                     <td className="p-2 align-top">
                        <Input 
                            value={item.targetItemCode}
                            readOnly 
                            placeholder="Code"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qty"
                        />
                    </td>
                    <td className="p-2 align-top">
                         <Select 
                            value={item.uom}
                            onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                            options={uomOptions}
                            placeholder="Select unit"
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            type="number"
                            value={item.costWithVAT}
                            onChange={(e) => handleItemChange(index, 'costWithVAT', parseFloat(e.target.value) || 0)}
                            placeholder="USD"
                            prefix="USD"
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