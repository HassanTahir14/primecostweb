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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalMessage, setEditModalMessage] = useState('');

  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const response = await dispatch(fetchRecipes({
          page: currentPage,
          size: pageSize,
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
  }, [dispatch, currentPage]);

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
        size: 1000000,
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil((pagination?.total || 0) / pageSize);

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
        <div className="text-gray-500 text-sm mb-2">Recipe Name</div>
        <div className="space-y-2">
          {filteredRecipes?.length > 0 ? (
            filteredRecipes.map((recipe: any) => (
              <div
                key={recipe.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b py-3"
              >
                <div>
                  <div className="font-medium">{recipe.name}</div>
                  <div>
                    Token Status: {" "}
                    <span className={recipe.tokenStatus === "APPROVED" ? "text-green-500 font-bold" : "text-teal-500 font-bold"}>
                      {recipe.tokenStatus}
                    </span>
                    {recipe.tokenStatus === "PENDING" && (
                      <span
                        className="ml-2 text-red-500 font-bold cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Add approve token logic here
                        }}
                      >
                        Approve the Token
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button 
                    onClick={() => {
                      if (recipe.tokenStatus !== 'APPROVED') {
                        setEditModalMessage('Recipe can only be assigned once it is approved by admin.');
                        setIsEditModalOpen(true);
                      } else {
                        handleAssignClick(recipe);
                      }
                    }}
                  >
                    Assign To
                  </Button>
                  <Button onClick={() => router.push(`/recipes/${recipe.id}`)} variant="secondary">View</Button>
                  <Button onClick={() => {
                    if (recipe.tokenStatus !== 'APPROVED') {
                      setEditModalMessage('Recipe can only be edited once it is approved by admin.');
                      setIsEditModalOpen(true);
                    } else {
                      router.push(`/recipes/edit/${recipe.id}`);
                    }
                  }} variant="secondary">Edit</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 border-t border-gray-200 pt-6">
              No recipes found!
            </div>
          )}
        </div>
        {pagination && pagination.total > 0 && (
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500">
              Showing {pagination.page * pagination.size + 1} to {Math.min((pagination.page + 1) * pagination.size, pagination.total)} of {pagination.total} recipes
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
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

      <ConfirmationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Not Allowed"
        message={editModalMessage}
        isAlert={true}
        okText="OK"
      />
    </PageLayout>
  );
} 