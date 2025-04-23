'use client';

import { useEffect, useState } from 'react';
import moment from 'moment';
import api from '@/store/api';
export default function InventoryByRecipe() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);

  // Call API on mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.post('/inventory/view/prepared-main-recipe', {page: 0, size: 1000, sortBy: 'preparedDate', direction: 'desc'});
        const list = response?.data?.preparedMainRecipeList || [];

        const mapped = list.map((item: any) => ({
          id: item.preparedMainRecipeId,
          date: moment(item.preparedDate).format('DD/MM/YYYY hh:mm A'),
          name: item.mainRecipeNameAndDescription,
          preparedBy: item.preparedByUserId,
          storage: item.storageLocationWithCode,
          quantity: `${item.totalQuantity} ${item.uom}`,
          batchNumber: item.mainRecipeBatchNumber
        }));

        setRecipes(mapped);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe: any) =>
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
            {filteredRecipes.map((recipe:any) => (
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
