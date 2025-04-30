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
  const router = useRouter();
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<SubRecipe | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // State for modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSubRecipeForAssign, setSelectedSubRecipeForAssign] = useState<any>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

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

  const handleAssignClick = (subRecipe: any) => {
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
    return <div>Loading...</div>;
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
                    <tr 
                      key={recipe.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        // Prevent navigation if clicking on action buttons
                        if ((e.target as HTMLElement).closest('.action-buttons')) {
                          return;
                        }
                        router.push(`/recipes/sub-recipes/${recipe.id}`);
                      }}
                    >
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
                          {/* <Link href={`/recipes/sub-recipes/edit/${recipe.id}`}>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="rounded-full bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5"
                            >
                              Edit
                            </Button>
                          </Link> */}
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
    </PageLayout>
  );
} 