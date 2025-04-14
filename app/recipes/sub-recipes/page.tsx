'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/ui/button';
import { Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Mock data for sub-recipes
const mockSubRecipes = [
  { id: 1, name: 'Basic Vinaigrette', category: 'Dressings', status: 'Active', portions: 10, cost: 3.50 },
  { id: 2, name: 'Pizza Dough', category: 'Bases', status: 'Active', portions: 5, cost: 4.20 },
  { id: 3, name: 'Simple Syrup', category: 'Syrups', status: 'Active', portions: 20, cost: 1.80 },
];

export default function SubRecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  // Initially empty, replace with mockSubRecipes if needed
  const [subRecipes, setSubRecipes] = useState(mockSubRecipes);

  const filteredSubRecipes = subRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout title="All Sub Recipes">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-semibold text-gray-900">All Sub Recipes</h1>
          
          <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
            {/* Search Input */}
            <div className="relative flex-grow min-w-[200px]">
              <input
                type="text"
                placeholder="Search Sub Recipe"
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
              {/* TODO: Link to actual sub-recipe creation page/modal if different from main recipe */}
              <Link href="/recipes/create?type=sub-recipe">
                <Button>Create New</Button>
              </Link>
              <Link href="/recipes/categories">
                 <Button variant="secondary">Categories</Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Sub-Recipe List or Empty State */}
        <div>
          {filteredSubRecipes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Sub-Recipe Name</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Portions</th>
                    <th className="px-6 py-3 text-left">Recipe Cost</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubRecipes.map((recipe) => (
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
                          {/* TODO: Implement Edit/Delete functionality */}
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
              No sub recipes found!
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
} 