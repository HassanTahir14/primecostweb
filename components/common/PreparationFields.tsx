import { useState, useEffect } from 'react';
import Button from './button';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/store/api';
import { toast } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllBranches } from '@/store/branchSlice';
import { selectAllRecipes, fetchRecipes } from '@/store/recipeSlice';
import { selectAllSubRecipes, fetchSubRecipes } from '@/store/subRecipeSlice';
import { AppDispatch } from '@/store/store';
import ConfirmationModal from './ConfirmationModal';

interface PreparationFieldsProps {
  type: 'recipe' | 'sub-recipe';
  id: string | number;
  branchId?: number;
  onFinishPreparation?: () => void;
}

export default function PreparationFields({ type, id, branchId, onFinishPreparation }: PreparationFieldsProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const unitFromUrl = searchParams.get('unit') || '';
  const [quantity, setQuantity] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [selectedStorageLocation, setSelectedStorageLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Get data from Redux store
  const branches = useSelector((state: any) => state.branch.branches);
  const recipes = useSelector(selectAllRecipes);
  const subRecipes = useSelector(selectAllSubRecipes);
  const currentBranch = branches.find((branch: any) => branch.branchId === branchId);
  const storageLocations = currentBranch?.storageLocations || [];

  // Get the current recipe/sub-recipe
  console.log('All recipe IDs:', recipes.map(r => r.id));
  console.log('All subRecipe IDs:', subRecipes.map(sr => sr.id));
  console.log('Looking for ID:', id, 'Type:', type);
  const currentItem = type === 'recipe' 
    ? recipes.find(r => String(r.id).trim() === String(id).trim())
    : subRecipes.find(sr => String(sr.id).trim() === String(id).trim());

  // Get the unit and quantity from the first ingredient item
  const firstIngredient = currentItem?.ingredientsItems?.[0] || currentItem?.ingredients?.[0];
  
  const unit = unitFromUrl || (firstIngredient?.unit || '');
  const firstIngredientQuantity = firstIngredient?.quantity || '';

  // Calculate sum of all ingredient recipeCost values
  let sumOfIngredientRecipeCost = 0;
  if (currentItem) {
    if (Array.isArray(currentItem.ingredientsItems) && currentItem.ingredientsItems.length > 0) {
      sumOfIngredientRecipeCost = currentItem.ingredientsItems.reduce((sum: number, ing: any) => {
        const val = parseFloat(ing.recipeCost);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    } else if (Array.isArray(currentItem.ingredients) && currentItem.ingredients.length > 0) {
      sumOfIngredientRecipeCost = currentItem.ingredients.reduce((sum: number, ing: any) => {
        const val = parseFloat(ing.recipeCost);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    }
    // Fallback for sub-recipe: use cost property if sum is zero or not available
    if (type === 'sub-recipe' && (!sumOfIngredientRecipeCost || sumOfIngredientRecipeCost === 0)) {
      const fallbackCost = parseFloat(currentItem.cost);
      if (!isNaN(fallbackCost)) {
        sumOfIngredientRecipeCost = fallbackCost;
      }
    }
    // Fallback for recipe: use recipeCost property if sum is zero or not available
    if (type === 'recipe' && (!sumOfIngredientRecipeCost || sumOfIngredientRecipeCost === 0)) {
      const fallbackRecipeCost = parseFloat(currentItem.recipeCost);
      if (!isNaN(fallbackRecipeCost)) {
        sumOfIngredientRecipeCost = fallbackRecipeCost;
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch branches if not already loaded
        if (branches.length === 0) {
          await dispatch(fetchAllBranches() as any);
        }

        // Fetch recipe/sub-recipe data
        if (type === 'recipe') {
          await dispatch(fetchRecipes({
            page: 0,
            size: 1000, // Fetch more recipes to ensure all IDs are included
            sortBy: "createdAt",
            direction: "asc"
          }));
        } else {
          await dispatch(fetchSubRecipes({
            page: 0,
            size: 1000, // Fetch more sub-recipes
            sortBy: "createdAt",
            direction: "asc"
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setModalMessage('Failed to load data');
        setIsSuccess(false);
        setIsModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, type, branches.length]);

  useEffect(() => {
    // Set the quantity from the first ingredient when we have the data
    if (firstIngredientQuantity) {
      setQuantity(firstIngredientQuantity.toString());
    }
  }, [firstIngredientQuantity]);

  const handleFinish = async () => {
    if (!quantity || !expiryDate || !selectedStorageLocation) {
      setModalMessage('Please fill in all fields');
      setIsSuccess(false);
      setIsModalOpen(true);
      return;
    }

    try {
      await api.post('/orders/finish', { 
        orderId,
        quantity: parseFloat(quantity),
        expiryDate,
        storageLocationId: parseInt(selectedStorageLocation),
        unitOfMeasurement: `37@recipecost${sumOfIngredientRecipeCost.toFixed(4)}`
      });
      setModalMessage('Order finished successfully');
      setIsSuccess(true);
      setIsModalOpen(true);
      if (onFinishPreparation) onFinishPreparation();
      // Navigate back to the same page without preparation mode after a short delay
      setTimeout(() => {
        router.push(`/finished-orders`);
      }, 1500);
    } catch (error: any) {
      console.error('Error finishing order:', error);
      setModalMessage(error.response?.data?.description || 'Failed to finish order');
      setIsSuccess(false);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading preparation details...</p>
        </div>
      </div>
    );
  }

  // Move the early return here, after all hooks
  if (!currentItem) {
    return (
      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading recipe/sub-recipe details... (ID: {id})</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-gray-50">
      {/* Branch Info */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Branch Information</h3>
          <p className="text-gray-600">
            {currentBranch?.branchName || 'Loading branch information...'}
          </p>
        </div>
      </div>

      {/* Preparation Fields */}
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Preparation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Total Prepared Quantity ({unit})
              </label>
              <input
                type="number"
                value={quantity}
                readOnly
                className="w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-gray-100"
                placeholder={`Quantity in ${unit}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm text-gray-900"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Storage Location
              </label>
              <select 
                value={selectedStorageLocation}
                onChange={(e) => setSelectedStorageLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm text-gray-900"
                required
              >
                <option value="">Select storage location</option>
                {storageLocations.map((location: any) => (
                  <option 
                    key={location.storageLocationId} 
                    value={location.storageLocationId}
                  >
                    {location.storageLocationName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Finish Button */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleFinish}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
            >
              Finish Preparation
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isSuccess ? 'Success' : 'Error'}
        message={modalMessage}
        isAlert={true}
        okText="OK"
      />
    </div>
  );
}