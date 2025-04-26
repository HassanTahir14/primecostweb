'use client';

import { useEffect, useState } from 'react';
import moment from 'moment';
import api from '@/store/api';

interface InventoryLocation {
  inventoryId: number;
  storageLocation: number;
  branchLocation: number;
  storageLocationWithCode: string;
  quantity: number;
  lastUpdated: string;
}

export default function InventoryByRecipe() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);

  // Call API on mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.post('/inventory/view/prepared-main-recipe', {page: 0, size: 1000, sortBy: 'preparedDate', direction: 'desc'});
        const list = response?.data?.preparedMainRecipeList || [];

        const mapped = list.map((item: any) => {
          // Map all inventory locations
          const inventoryLocations = item.inventoryLocations || [];
          const storageLocations = inventoryLocations.map((loc: InventoryLocation) => loc.storageLocationWithCode).join(', ');
          
          return {
            id: item.preparedMainRecipeId,
            date: moment(item.preparedDate).format('DD/MM/YYYY hh:mm A'),
            name: item.mainRecipeNameAndDescription,
            preparedBy: item.preparedByUserId,
            storageAndBranch: storageLocations || 'N/A',
            quantity: `${item.totalQuantityAcrossLocations} ${item.uom}`,
            batchNumber: item.mainRecipeBatchNumber,
            expirationDate: moment(item.expirationDate).format('DD/MM/YYYY'),
            status: item.preparedMainRecipeStatus,
            inventoryLocations: inventoryLocations
          };
        });

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
              <th className="px-6 py-4 text-left">Batch Number</th>
              <th className="px-6 py-4 text-left">Expiration Date</th>
              <th className="px-6 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecipes.map((recipe:any) => (
              <tr key={recipe.id}>
                <td className="px-6 py-4">{recipe.date}</td>
                <td className="px-6 py-4">{recipe.name}</td>
                <td className="px-6 py-4">{recipe.preparedBy}</td>
                <td className="px-6 py-4">{recipe.storageAndBranch}</td>
                <td className="px-6 py-4">{recipe.quantity}</td>
                <td className="px-6 py-4">{recipe.batchNumber}</td>
                <td className="px-6 py-4">{recipe.expirationDate}</td>
                <td className="px-6 py-4">{recipe.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
