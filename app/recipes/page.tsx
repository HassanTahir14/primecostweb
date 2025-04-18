'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes, selectAllRecipes, selectRecipeStatus, selectRecipeError, selectRecipePagination } from '@/store/recipeSlice';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import { Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AppDispatch } from '@/store/store';
import Loader from '@/components/common/Loader';
import Image from 'next/image';

export default function RecipesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const recipes = useSelector(selectAllRecipes);
  const status = useSelector(selectRecipeStatus);
  const error = useSelector(selectRecipeError);
  const pagination = useSelector(selectRecipePagination);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const response = await dispatch(fetchRecipes({
          page: 0,
          size: 10,
          sortBy: "createdAt",
          direction: "asc"
        })).unwrap();

        console.log('response', response);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      }
    };

    loadRecipes();
  }, [dispatch]);

  const filteredRecipes = recipes?.filter((recipe: any) =>
    recipe.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('recipes', recipes);

  if (status === 'loading') {
    return (
      <PageLayout title="All Recipes">
        <div className="flex justify-center items-center h-64">
          <Loader size="large" />
        </div>
      </PageLayout>
    );
  }

  if (status === 'failed') {
    return (
      <PageLayout title="All Recipes">
        <div className="text-center py-10 text-red-500">
          Error loading recipes: {typeof error === 'object' && error !== null ? (error as { description?: string }).description || JSON.stringify(error) : error}
        </div>
      </PageLayout>
    );
  }

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
          {filteredRecipes?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Image</th>
                    <th className="px-6 py-3 text-left">Recipe Name</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Portions</th>
                    <th className="px-6 py-3 text-left">Recipe Cost</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecipes.map((recipe: any) => (
                    <tr key={recipe.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {recipe.images && recipe.images.length > 0 ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden relative">
                            <Image 
                              src={`http://13.61.61.180:8080/${recipe.images[0].path}`}
                              alt={recipe.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{recipe.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{recipe.categoryName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recipe.tokenStatus === 'APPROVED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {recipe.tokenStatus || 'DRAFT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{recipe.numberOfPortions}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${(recipe.costPerRecipe / 100).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link href={`/recipes/edit/${recipe.id}`}>
                            <Button variant="ghost" size="sm" className="p-1">
                              <Edit size={16} className="text-gray-500" />
                            </Button>
                          </Link>
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
        {pagination && pagination.total > 0 && (
          <div className="flex justify-end pt-4">
            <div className="text-sm text-gray-500">
              Showing {pagination.page * pagination.size + 1} to {Math.min((pagination.page + 1) * pagination.size, pagination.total)} of {pagination.total} recipes
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
} 