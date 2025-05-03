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
      <PageLayout title="All Sub Recipes">
        <div className="flex justify-center items-center h-64">
          <Loader size="medium" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="All Sub Recipes">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/recipes" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-grow min-w-[200px] max-w-xs">
            <SearchInput 
              placeholder="Search Sub Recipe" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Link href="/recipes/sub-recipes/create">
              <Button>Create New</Button>
            </Link>
            <Link href="/recipes/sub-recipes/categories">
              <Button variant="secondary">Categories</Button>
            </Link>
          </div>
        </div>
        
        <div className="text-gray-500 text-sm mb-2">Sub Recipe Name</div>
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
                  <Button onClick={() => handleAssignClick(recipe)}>Assign To</Button>
                  <Button onClick={() => router.push(`/recipes/sub-recipes/${recipe.id}`)} variant="secondary">View</Button>
                  <Button onClick={() => {
                    if (recipe.tokenStatus !== 'APPROVED') {
                      setEditModalMessage('Subrecipe can only be edited once it is approved by admin.');
                      setIsEditModalOpen(true);
                    } else {
                      router.push(`/recipes/sub-recipes/edit/${recipe.id}`);
                    }
                  }} variant="secondary">Edit</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 border-t border-gray-200 pt-6">
              No sub recipes found!
            </div>
          )}
        </div>

        {pagination && pagination.total > 0 && (
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500">
              Showing {pagination.page * pagination.size + 1} to {Math.min((pagination.page + 1) * pagination.size, pagination.total)} of {pagination.total} sub-recipes
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
        message="Sub Recipe deleted successfully!"
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
        title={isSuccessMessage ? 'Success' : 'Error'}
        message={confirmationMessage}
        isAlert={true}
        okText="OK"
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