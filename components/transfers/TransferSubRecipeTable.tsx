'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface TransferSubRecipeTableProps {
  items: any[];
  onChange: (items: any[]) => void;
}

// Mock data - replace with actual data fetching/search
const subRecipeOptions = [
  { value: 'subrec1', label: 'Basic Vinaigrette (SUB001)' },
  { value: 'subrec2', label: 'Pizza Dough (SUB002)' },
  { value: 'subrec3', label: 'Simple Syrup (SUB003)' },
];

const uomOptions = [
    { value: 'liter', label: 'Liter' },
    { value: 'kg', label: 'KG' },
    { value: 'batch', label: 'Batch' },
]

export default function TransferSubRecipeTable({ items, onChange }: TransferSubRecipeTableProps) {
  
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'subRecipeName') {
        const selectedSubRecipe = subRecipeOptions.find(opt => opt.value === value);
        newItems[index].subRecipeCode = selectedSubRecipe ? selectedSubRecipe.label.split(' (')[1]?.replace(')','') : '';
    }
    
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { 
        subRecipeName: '', 
        subRecipeCode: '', 
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
        <table className="w-full min-w-[600px]">
            <thead className="bg-[#00997B] text-white">
                <tr>
                    <th className="p-3 text-left text-sm font-semibold">Sub-Recipe Name</th>
                    <th className="p-3 text-left text-sm font-semibold w-32">Sub-Recipe Code</th>
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
                            value={item.subRecipeName}
                            onChange={(e) => handleItemChange(index, 'subRecipeName', e.target.value)}
                            options={subRecipeOptions}
                            placeholder="Select Sub-Recipe"
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            value={item.subRecipeCode}
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
                <Plus size={16} className="mr-1" /> Add Sub-Recipe
            </Button>
        </div>
    </div>
  );
} 