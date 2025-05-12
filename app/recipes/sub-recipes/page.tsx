'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import { Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/common/SearchInput';
import AssignModal from '@/components/recipes/AssignModal';
import Loader from '@/components/common/Loader';
import { useTranslation } from '@/context/TranslationContext';

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
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const subRecipes = useSelector(selectAllSubRecipes);
  const status = useSelector(selectSubRecipeStatus);
  const error = useSelector(selectSubRecipeError);
  const pagination = useSelector(selectSubRecipePagination);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const router = useRouter();
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<SubRecipe | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // State for modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSubRecipeForAssign, setSelectedSubRecipeForAssign] = useState<any>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalMessage, setEditModalMessage] = useState('');

  const loadSubRecipes = async () => {
    try {
      const response = await dispatch(fetchSubRecipes({
        page: currentPage,
        size: pageSize,
        sortBy: "createdAt",
        direction: "asc"
      })).unwrap();

      console.log('response', response);
    } catch (err) {
      console.error('Failed to fetch sub-recipes:', err);
      setErrorMessage('Failed to fetch sub-recipes');
      setIsErrorModalOpen(true);
    }
  };

  useEffect(() => {
    loadSubRecipes();
  }, [dispatch, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil((pagination?.total || 0) / pageSize);

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

  const handleAssignClick = (subRecipe: any) => {
    if (subRecipe.tokenStatus !== 'APPROVED') {
      setEditModalMessage('Sub-recipe can only be assigned once it is approved by admin.');
      setIsEditModalOpen(true);
      return;
    }
    setSelectedSubRecipeForAssign(subRecipe);
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

  const filteredSubRecipes = subRecipes.filter((recipe: SubRecipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.subRecipeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <PageLayout title={t('recipes.subRecipes.title')}>
        <div className="flex justify-center items-center h-64">
          <Loader size="medium" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('recipes.subRecipes.title')}>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/recipes" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-grow min-w-[200px] max-w-xs">
            <SearchInput 
              placeholder={t('recipes.subRecipes.searchPlaceholder')} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Link href="/recipes/sub-recipes/create">
              <Button>{t('recipes.subRecipes.createNew')}</Button>
            </Link>
            <Link href="/recipes/sub-recipes/categories">
              <Button variant="secondary">{t('recipes.subRecipes.categories.title')}</Button>
            </Link>
          </div>
        </div>
        
        <div className="text-gray-500 text-sm mb-2">{t('recipes.subRecipes.title')}</div>
        <div className="space-y-2">
          {filteredSubRecipes.length > 0 ? (
            filteredSubRecipes.map((recipe: SubRecipe) => (
              <div
                key={recipe.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b py-3"
              >
                <div>
                  <div className="font-medium">{recipe.name}</div>
                  <div>
                    {t('recipes.subRecipes.tokenStatus')}: {" "}
                    <span className={recipe.tokenStatus === "APPROVED" ? "text-green-500 font-bold" : "text-teal-500 font-bold"}>
                      {recipe.tokenStatus === "APPROVED" ? t('recipes.subRecipes.approved') : t('recipes.subRecipes.pending')}
                    </span>
                    {recipe.tokenStatus === "PENDING" && (
                      <span
                        className="ml-2 text-red-500 font-bold cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Add approve token logic here
                        }}
                      >
                        {t('recipes.subRecipes.approveToken')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button onClick={() => handleAssignClick(recipe)}>{t('recipes.subRecipes.assignTo')}</Button>
                  <Button onClick={() => router.push(`/recipes/sub-recipes/${recipe.id}`)} variant="secondary">{t('recipes.subRecipes.view')}</Button>
                  <Button onClick={() => {
                    if (recipe.tokenStatus !== 'APPROVED') {
                      setEditModalMessage(t('recipes.subRecipes.editRestriction'));
                      setIsEditModalOpen(true);
                    } else {
                      router.push(`/recipes/sub-recipes/edit/${recipe.id}`);
                    }
                  }} variant="secondary">{t('recipes.subRecipes.edit.title')}</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 border-t border-gray-200 pt-6">
              {t('recipes.subRecipes.noRecipesFound')}
            </div>
          )}
        </div>

        {pagination && pagination.total > 0 && (
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500">
              {t('recipes.subRecipes.showing')} {pagination.page * pagination.size + 1} {t('recipes.subRecipes.to')} {Math.min((pagination.page + 1) * pagination.size, pagination.total)} {t('recipes.subRecipes.of')} {pagination.total} {t('recipes.subRecipes.recipes')}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                {t('recipes.subRecipes.previous')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                {t('recipes.subRecipes.next')}
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
        title={t('recipes.subRecipes.delete.title')}
        message={t('recipes.subRecipes.delete.confirmMessage', { name: selectedRecipe?.name || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={t('common.success')}
        message={t('recipes.subRecipes.delete.success')}
        isAlert={true}
        okText={t('common.ok')}
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={t('common.error')}
        message={errorMessage}
        isAlert={true}
        okText={t('common.ok')}
      />

      {/* Assign Modal */}
      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedSubRecipeForAssign(null);
        }}
        onSuccess={handleAssignSuccess}
        onError={handleAssignError}
        recipeId={0}
        isSubRecipe={true}
        subRecipeId={selectedSubRecipeForAssign?.id || 0}
      />

      {/* Confirmation/Error Modal */}
      <ConfirmationModal
        isOpen={!!confirmationMessage}
        onClose={() => setConfirmationMessage('')}
        title={isSuccessMessage ? t('common.success') : t('common.error')}
        message={confirmationMessage}
        isAlert={true}
        okText={t('common.ok')}
      />

      <ConfirmationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('common.error')}
        message={editModalMessage}
        isAlert={true}
        okText={t('common.ok')}
      />
    </PageLayout>
  );
} 