'use client';

import { useEffect, useState } from 'react';
import api from '@/store/api';
import moment from 'moment';

export default function InventoryBySubRecipe() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subRecipes, setSubRecipes] = useState([]);

  useEffect(() => {
    const fetchSubRecipes = async () => {
      try {
        const response = await api.post('/inventory/view/prepared-sub-recipe', {page: 0, size: 1000, sortBy: 'preparedDate', direction: 'desc'});
        const list = response?.data?.preparedSubRecipeList || [];

        const mapped = list.map((item: any) => ({
          id: item.preparedSubRecipeId,
          date: moment(item.preparedDate).format('DD/MM/YYYY hh:mm A'),
          name: item.subRecipeNameAndDescription,
          preparedBy: item.preparedByUserId,
          storage: item.storageLocationWithCode,
          quantity: `${item.totalQuantity} ${item.uom}`,
          batchNumber: item.subRecipeBatchNumber
        }));

        setSubRecipes(mapped);
      } catch (error) {
        console.error('Error fetching sub-recipes:', error);
      }
    };

    fetchSubRecipes();
  }, []);

  const filteredSubRecipes = subRecipes.filter((subRecipe: any) =>
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
            {filteredSubRecipes.map((subRecipe:any) => (
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
