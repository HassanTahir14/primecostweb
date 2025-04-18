'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import { Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { 
  fetchSubRecipes, 
  selectAllSubRecipes,
  selectSubRecipeStatus,
  selectSubRecipeError,
  selectSubRecipePagination,
} from '@/store/subRecipeSlice';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface SubRecipe {
  id: number;
  name: string;
  subRecipeCode: string;
  numberOfPortions: number;
  servingSize: number;
  categoryId: number;
  categoryName: string;
  menuPrice: number;
  foodCostBudgetPercentage: number;
  foodCostActualPercentage: number;
  idealSellingPrice: number;
  costPerPortion: number;
  costPerRecipe: number;
  marginPerPortion: number;
  tokenStatus: string;
  lastUpdatedById: number | null;
  lastUpdatedByName: string | null;
  lastUpdatedByDesignation: string | null;
  images: Array<{
    imageId: number;
    path: string;
  }>;
  ingredients: Array<{
    id: number;
    itemName: string;
    quantity: number;
    weight: string;
    volume: string;
    unit: string;
    yieldPercentage: number;
    recipeCost: number;
    epsPerUnit: number;
    apsPerUnit: number;
  }>;
  procedures: Array<{
    id: number;
    description: string;
    criticalPoint: string;
  }>;
}

export default function SubRecipesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const subRecipes = useSelector(selectAllSubRecipes);
  const status = useSelector(selectSubRecipeStatus);
  const error = useSelector(selectSubRecipeError);
  const pagination = useSelector(selectSubRecipePagination);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<SubRecipe | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSubRecipes();
  }, [dispatch]);

  const loadSubRecipes = async () => {
    try {
      await dispatch(fetchSubRecipes({
        page: 0,
        size: 10,
        sortBy: "createdAt",
        direction: "asc"
      })).unwrap();
    } catch (err) {
      console.error('Failed to fetch sub-recipes:', err);
      setErrorMessage('Failed to fetch sub-recipes');
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteClick = (recipe: SubRecipe) => {
    setSelectedRecipe(recipe);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecipe) return;
    
    try {
      // await dispatch(deleteSubRecipe(selectedRecipe.id)).unwrap();
      setIsDeleteModalOpen(false);
      setIsSuccessModalOpen(true);
      loadSubRecipes(); // Refresh the list
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete sub-recipe');
      setIsDeleteModalOpen(false);
      setIsErrorModalOpen(true);
    }
  };

  const filteredSubRecipes = subRecipes.filter((recipe: SubRecipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.subRecipeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

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
              <Link href="/recipes/sub-recipes/create">
                <Button>Create New</Button>
              </Link>
              <Link href="/recipes/sub-recipes/categories">
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
                    <th className="px-6 py-3 text-left">Recipe Code</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Portions</th>
                    <th className="px-6 py-3 text-left">Cost Per Recipe</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubRecipes.map((recipe: SubRecipe) => (
                    <tr key={recipe.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{recipe.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{recipe.subRecipeCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{recipe.categoryName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recipe.tokenStatus === 'APPROVED' 
                            ? 'bg-green-100 text-green-800' 
                            : recipe.tokenStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {recipe.tokenStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{recipe.numberOfPortions}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${recipe.costPerRecipe.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link href={`/recipes/sub-recipes/edit/${recipe.id}`}>
                            <Button variant="ghost" size="sm" className="p-1">
                              <Edit size={16} className="text-gray-500" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1"
                            onClick={() => handleDeleteClick(recipe)}
                          >
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Sub Recipe"
        message={`Are you sure you want to delete ${selectedRecipe?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message="Sub recipe deleted successfully!"
        isAlert={true}
        okText="OK"
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 