'use client';

import { useState } from 'react';

// Mock data for sub recipes
const mockSubRecipes = [
  { 
    id: 1, 
    date: '17/03/2025 10:15 AM',
    name: 'Marinara Sauce', 
    preparedBy: 'Ahmed Khan',
    storage: 'Cold Storage Main Brnach',
    quantity: '35.0 KG',
    batchNumber: '20250317-subrecipe-001'
  }
];

export default function InventoryBySubRecipe() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subRecipes, setSubRecipes] = useState(mockSubRecipes);

  const filteredSubRecipes = subRecipes.filter(subRecipe =>
    subRecipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#00997B] text-white text-sm">
            <tr>
              <th className="px-6 py-4 text-left">Prepared Date</th>
              <th className="px-6 py-4 text-left">Sub Recipe Name & Description</th>
              <th className="px-6 py-4 text-left">Prepared By</th>
              <th className="px-6 py-4 text-left">Storage Location, Branch</th>
              <th className="px-6 py-4 text-left">Total Quantity</th>
              <th className="px-6 py-4 text-left">Prepared Batch Number</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubRecipes.map((subRecipe) => (
              <tr key={subRecipe.id}>
                <td className="px-6 py-4">{subRecipe.date}</td>
                <td className="px-6 py-4">{subRecipe.name}</td>
                <td className="px-6 py-4">{subRecipe.preparedBy}</td>
                <td className="px-6 py-4">{subRecipe.storage}</td>
                <td className="px-6 py-4">{subRecipe.quantity}</td>
                <td className="px-6 py-4">{subRecipe.batchNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 