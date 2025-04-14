'use client';

import { useState } from 'react';

// Mock data for recipes
const mockRecipes = [
  { 
    id: 1, 
    date: '16/03/2025 08:49 PM',
    name: 'Test Recipe', 
    preparedBy: 'Muhammad J Junaid',
    storage: 'Dry Stock Room Main Brnach',
    quantity: '500.0 KG',
    batchNumber: '20250316-recipe code-B001'
  }
];

export default function InventoryByRecipe() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState(mockRecipes);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#00997B] text-white text-sm">
            <tr>
              <th className="px-6 py-4 text-left">Prepared Date</th>
              <th className="px-6 py-4 text-left">Recipe Name & Description</th>
              <th className="px-6 py-4 text-left">Prepared By</th>
              <th className="px-6 py-4 text-left">Storage Location, Branch</th>
              <th className="px-6 py-4 text-left">Total Quantity</th>
              <th className="px-6 py-4 text-left">Prepared Batch Number</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecipes.map((recipe) => (
              <tr key={recipe.id}>
                <td className="px-6 py-4">{recipe.date}</td>
                <td className="px-6 py-4">{recipe.name}</td>
                <td className="px-6 py-4">{recipe.preparedBy}</td>
                <td className="px-6 py-4">{recipe.storage}</td>
                <td className="px-6 py-4">{recipe.quantity}</td>
                <td className="px-6 py-4">{recipe.batchNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 