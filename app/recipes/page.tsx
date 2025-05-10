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
import { useTranslation } from '@/context/TranslationContext';

export default function RecipesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const recipes = useSelector(selectAllRecipes);
  const status = useSelector(selectRecipeStatus);
  const error = useSelector(selectRecipeError);
  const pagination = useSelector(selectRecipePagination);
  const [searchQuery, setSearchQuery] = useState('');
  const { t, isRTL } = useTranslation();
  
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
      <PageLayout title={t('recipes.title')}>
        <div className="flex justify-center items-center h-64">
          <Loader size="medium" />
        </div>
      </PageLayout>
    );
  }

  if (status === 'failed') {
    return (
      <PageLayout title={t('recipes.title')}>
        <div className="text-center py-10 text-red-500">
          {t('common.error')}: {typeof error === 'object' && error !== null ? (error as { description?: string }).description || JSON.stringify(error) : error}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('recipes.title')}>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <SearchInput 
            placeholder={t('recipes.searchPlaceholder')} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <div className="flex gap-2 flex-shrink-0">
            <Link href="/recipes/create">
              <Button>{t('recipes.createNew')}</Button>
            </Link>
            <Link href="/recipes/sub-recipes">
              <Button variant="secondary">{t('recipes.subRecipesList')}</Button>
            </Link>
            <Link href="/recipes/categories">
              <Button variant="secondary">{t('recipes.categories')}</Button>
            </Link>
          </div>
        </div>
        
        {/* Recipe List or Empty State */}
        <div className="text-gray-500 text-sm mb-2">{t('recipes.recipeName')}</div>
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
                    {t('recipes.tokenStatus')}: {" "}
                    <span className={recipe.tokenStatus === "APPROVED" ? "text-green-500 font-bold" : "text-teal-500 font-bold"}>
                      {recipe.tokenStatus === "APPROVED" ? t('recipes.approved') : t('recipes.pending')}
                    </span>
                    {recipe.tokenStatus === "PENDING" && (
                      <span
                        className="ml-2 text-red-500 font-bold cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Add approve token logic here
                        }}
                      >
                        {t('recipes.approveToken')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button 
                    onClick={() => {
                      if (recipe.tokenStatus !== 'APPROVED') {
                        setEditModalMessage(t('recipes.assignRestriction'));
                        setIsEditModalOpen(true);
                      } else {
                        handleAssignClick(recipe);
                      }
                    }}
                  >
                    {t('recipes.assignTo')}
                  </Button>
                  <Button onClick={() => router.push(`/recipes/${recipe.id}`)} variant="secondary">{t('recipes.view')}</Button>
                  <Button onClick={() => {
                    if (recipe.tokenStatus !== 'APPROVED') {
                      setEditModalMessage(t('recipes.editRestriction'));
                      setIsEditModalOpen(true);
                    } else {
                      router.push(`/recipes/edit/${recipe.id}`);
                    }
                  }} variant="secondary">{t('recipes.edit')}</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 border-t border-gray-200 pt-6">
              {t('recipes.noRecipesFound')}
            </div>
          )}
        </div>
        {pagination && pagination.total > 0 && (
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500">
              {t('recipes.showing')} {pagination.page * pagination.size + 1} {t('recipes.to')} {Math.min((pagination.page + 1) * pagination.size, pagination.total)} {t('recipes.of')} {pagination.total} {t('recipes.recipes')}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                {t('recipes.previous')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                {t('recipes.next')}
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title={t('common.delete')}
          message={t('recipes.delete.confirmMessage', { name: selectedRecipe?.name })}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
        />

        <ConfirmationModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          onConfirm={() => setIsSuccessModalOpen(false)}
          title={t('common.success')}
          message={t('recipes.delete.success')}
          confirmText={t('common.ok')}
        />

        <ConfirmationModal
          isOpen={isErrorModalOpen}
          onClose={() => setIsErrorModalOpen(false)}
          onConfirm={() => setIsErrorModalOpen(false)}
          title={t('common.error')}
          message={errorMessage}
          confirmText={t('common.ok')}
        />

        <ConfirmationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onConfirm={() => setIsEditModalOpen(false)}
          title={t('common.error')}
          message={editModalMessage}
          confirmText={t('common.ok')}
        />

        <AssignModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          recipeId={selectedRecipeForAssign?.id || 0}
          isSubRecipe={false}
          onSuccess={handleAssignSuccess}
          onError={handleAssignError}
        />
      </div>
    </PageLayout>
  );
} 