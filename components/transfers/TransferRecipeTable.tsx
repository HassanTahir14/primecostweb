'use client';

import { useState } from 'react';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import { Plus, Trash2 } from 'lucide-react';

interface TransferRecipeTableProps {
  items: any[];
  onChange: (items: any[]) => void;
}

// Mock data - replace with actual data fetching/search
const recipeOptions = [
  { value: 'recipe1', label: 'Classic Spaghetti Bolognese (REC001)' },
  { value: 'recipe2', label: 'Chicken Caesar Salad (REC002)' },
  { value: 'recipe3', label: 'Chocolate Lava Cake (REC003)' },
];

const uomOptions = [
    { value: 'portion', label: 'Portion' },
    { value: 'serving', label: 'Serving' },
    { value: 'batch', label: 'Batch' },
]

export default function TransferRecipeTable({ items, onChange }: TransferRecipeTableProps) {
  
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'recipeName') {
        const selectedRecipe = recipeOptions.find(opt => opt.value === value);
        newItems[index].recipeCode = selectedRecipe ? selectedRecipe.label.split(' (')[1]?.replace(')','') : '';
    }
    
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { 
        recipeName: '', 
        recipeCode: '', 
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
                    <th className="p-3 text-left text-sm font-semibold">Recipe Name</th>
                    <th className="p-3 text-left text-sm font-semibold w-32">Recipe Code</th>
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
                            value={item.recipeName}
                            onChange={(e) => handleItemChange(index, 'recipeName', e.target.value)}
                            options={recipeOptions}
                            placeholder="Select Recipe"
                            className="w-full"
                        />
                    </td>
                    <td className="p-2 align-top">
                        <Input 
                            value={item.recipeCode}
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
                <Plus size={16} className="mr-1" /> Add Recipe
            </Button>
        </div>
    </div>
  );
} 