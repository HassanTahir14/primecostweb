'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import { Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Mock data for recipes
const mockRecipes = [
  { id: 1, name: 'Classic Spaghetti Bolognese', category: 'Main Course', status: 'Active', portions: 4, cost: 12.50 },
  { id: 2, name: 'Chicken Caesar Salad', category: 'Appetizer', status: 'Active', portions: 2, cost: 8.75 },
  { id: 3, name: 'Chocolate Lava Cake', category: 'Dessert', status: 'Draft', portions: 6, cost: 15.20 },
  { id: 4, name: 'Vegetable Stir-Fry', category: 'Main Course', status: 'Active', portions: 4, cost: 10.30 },
];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState(mockRecipes);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout title="All Recipes">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* <h1 className="text-3xl font-semibold text-gray-900">All Recipes</h1> */}
          <div className="flex items-center gap-4 w-full md:w-auto flex-wrap justify-end">
            {/* Search Input */}
            <div className="relative flex-grow min-w-[200px] max-w-xs">
              <input
                type="text"
                placeholder="Search Recipe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00997B] pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/recipes/create">
                <Button>Create New</Button>
              </Link>
              <Link href="/recipes/sub-recipes">
                <Button variant="secondary">Sub-Recipes List</Button>
              </Link>
              <Link href="/recipes/categories">
                <Button variant="secondary">Categories</Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Recipe List or Empty State */}
        <div>
          {filteredRecipes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Recipe Name</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Portions</th>
                    <th className="px-6 py-3 text-left">Recipe Cost</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{recipe.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{recipe.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recipe.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {recipe.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{recipe.portions}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${recipe.cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="p-1">
                            <Edit size={16} className="text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1">
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 border-t border-gray-200 pt-6">
              No recipes found!
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
} 