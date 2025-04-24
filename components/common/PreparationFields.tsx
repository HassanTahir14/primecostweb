import { useState, useEffect } from 'react';
import Button from './button';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/store/api';
import { toast } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllBranches } from '@/store/branchSlice';
import { selectAllRecipes } from '@/store/recipeSlice';
import { selectAllSubRecipes } from '@/store/subRecipeSlice';

interface PreparationFieldsProps {
  type: 'recipe' | 'sub-recipe';
  id: string | number;
  branchId?: number;
}

export default function PreparationFields({ type, id, branchId }: PreparationFieldsProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [quantity, setQuantity] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [selectedStorageLocation, setSelectedStorageLocation] = useState<string>('');

  // Get data from Redux store
  const branches = useSelector((state: any) => state.branch.branches);
  const recipes = useSelector(selectAllRecipes);
  const subRecipes = useSelector(selectAllSubRecipes);
  const currentBranch = branches.find((branch: any) => branch.branchId === branchId);
  const storageLocations = currentBranch?.storageLocations || [];

  // Get the current recipe/sub-recipe
  const currentItem = type === 'recipe' 
    ? recipes.find(r => r.id.toString() === id.toString())
    : subRecipes.find(sr => sr.id.toString() === id.toString());

  // Get the unit from the first ingredient item (assuming all items use the same unit)
  const unit = currentItem?.ingredientsItems?.[0]?.unit || currentItem?.ingredients?.[0]?.unit || '';

  useEffect(() => {
    // Fetch branches if not already loaded
    if (branches.length === 0) {
      dispatch(fetchAllBranches() as any);
    }
  }, [dispatch, branches.length]);

  const handleFinish = async () => {
    if (!quantity || !expiryDate || !selectedStorageLocation) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await api.post('/orders/finish', { 
        orderId,
        quantity: parseFloat(quantity),
        expiryDate,
        storageLocationId: parseInt(selectedStorageLocation),
        unitOfMeasurement: unit
      });
      toast.success('Order finished successfully');
      // Navigate back to the same page without preparation mode
      router.push(`/${type === 'recipe' ? 'recipes' : 'sub-recipes'}`);
    } catch (error: any) {
      console.error('Error finishing order:', error);
      toast.error(error.response?.data?.description || 'Failed to finish order');
    }
  };

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
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm text-gray-900"
                placeholder={`Enter quantity in ${unit}`}
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
    </div>
  );
} 