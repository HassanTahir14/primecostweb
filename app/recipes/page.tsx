'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes, selectAllRecipes, selectRecipeStatus, selectRecipeError, selectRecipePagination, deleteRecipeThunk } from '@/store/recipeSlice';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import { Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AppDispatch } from '@/store/store';
import Loader from '@/components/common/Loader';
import Image from 'next/image';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/common/SearchInput';
import AssignModal from '@/components/recipes/AssignModal';
import { getImageUrlWithAuth } from '@/utils/imageUtils';
import AuthImage from '@/components/common/AuthImage';

export default function RecipesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const recipes = useSelector(selectAllRecipes);
  const status = useSelector(selectRecipeStatus);
  const error = useSelector(selectRecipeError);
  const pagination = useSelector(selectRecipePagination);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRecipeForAssign, setSelectedRecipeForAssign] = useState<any>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  const router = useRouter();

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
        setErrorMessage('Failed to fetch recipes');
        setIsErrorModalOpen(true);
      }
    };

    loadRecipes();
  }, [dispatch]);

  const handleDeleteClick = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecipe) return;
    
    try {
      setIsDeleting(true);
      await dispatch(deleteRecipeThunk(selectedRecipe.id)).unwrap();
      setIsDeleteModalOpen(false);
      setIsSuccessModalOpen(true);
      
      // Refresh the list
      dispatch(fetchRecipes({
        page: 0,
        size: 10,
        sortBy: "createdAt",
        direction: "asc"
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete recipe');
      setIsDeleteModalOpen(false);
      setIsErrorModalOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignClick = (recipe: any) => {
    setSelectedRecipeForAssign(recipe);
    setIsAssignModalOpen(true);
  };

  const handleAssignSuccess = (message: string) => {
    setConfirmationMessage(message);
    setIsSuccessMessage(true);
  };

  const handleAssignError = (message: string) => {
    setConfirmationMessage(message);
    setIsSuccessMessage(false);
  };

  const filteredRecipes = recipes?.filter((recipe: any) =>
    recipe.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('recipes', recipes);

  if (status === 'loading') {
    return (
      <PageLayout title="All Recipes">
        <div className="flex justify-center items-center h-64">
          <Loader size="medium" />
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
          <SearchInput 
            placeholder="Search Recipe" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
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
                    <tr 
                      key={recipe.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        // Prevent navigation if clicking on action buttons
                        if ((e.target as HTMLElement).closest('.action-buttons')) {
                          return;
                        }
                        router.push(`/recipes/${recipe.id}`);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {recipe.images && recipe.images.length > 0 ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden relative">
                            <AuthImage 
                              src={getImageUrlWithAuth(recipe.images[0].path)}
                              alt={recipe.name}
                              className="object-cover w-full h-full"
                              fallbackSrc="/placeholder-image.svg"
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
                        <div className="flex items-center space-x-2 action-buttons">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className={`rounded-full text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5 ${
                              recipe.tokenStatus === 'APPROVED' 
                                ? 'bg-[#28addb] hover:bg-[#2299c2]' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (recipe.tokenStatus === 'APPROVED') {
                                handleAssignClick(recipe);
                              }
                            }}
                            disabled={recipe.tokenStatus !== 'APPROVED'}
                          >
                            Assign to?
                          </Button>
                          <Link href={`/recipes/edit/${recipe.id}`}>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                            >
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="rounded-full bg-red-500 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(recipe);
                            }}
                          >
                            Delete
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recipe"
        message={`Are you sure you want to delete ${selectedRecipe?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message="Recipe deleted successfully!"
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

      {/* Add the AssignModal */}
      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedRecipeForAssign(null);
        }}
        onSuccess={handleAssignSuccess}
        onError={handleAssignError}
        recipeId={selectedRecipeForAssign?.id || 0}
        isSubRecipe={false}
      />
    </PageLayout>
  );
} 