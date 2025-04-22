'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchAllBranches } from '@/store/branchSlice';
import { fetchAllItems } from '@/store/itemsSlice';
import { fetchRecipes } from '@/store/recipeSlice';
import { fetchSubRecipes } from '@/store/subRecipeSlice';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
// import { toast } from 'react-toastify'; // Removed toast
import api from '@/store/api';
import ConfirmationModal from '@/components/common/ConfirmationModal'; // Added ConfirmationModal import

// Import form parts (assuming they will be created)
import TransferHeaderForm from '@/components/transfers/TransferHeaderForm';
import TransferInventoryItemsTable from '@/components/transfers/TransferInventoryItemsTable';
import TransferRecipeTable from '@/components/transfers/TransferRecipeTable';
import TransferSubRecipeTable from '@/components/transfers/TransferSubRecipeTable';
import TransferCostTable from '@/components/transfers/TransferCostTable';

function CreateTransferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const transferTypeParam = searchParams.get('type') || 'inventory'; // Default to inventory

  // --- Selectors --- 
  const { branches, loading: branchesLoading, error: branchesError } = useSelector((state: RootState) => state.branch);
  const { items: itemsData, status: itemsStatus, error: itemsError } = useSelector((state: RootState) => state.items);
  const { recipes: recipesData, status: recipeStatus, error: recipesError } = useSelector((state: RootState) => state.recipe);
  const { subRecipes: subRecipesData, status: subRecipeStatus, error: subRecipesError } = useSelector((state: RootState) => state.subRecipe);

  const [formData, setFormData] = useState<any>({
      transferType: transferTypeParam.charAt(0).toUpperCase() + transferTypeParam.slice(1), // Set initial type from param
      transferDate: new Date().toISOString().split('T')[0], // Default to today
      transferBy: 'current_user_id', // Placeholder - Get from auth state
      sourceBranchId: '', // Changed to sourceBranchId
      targetBranchId: '', // Changed to targetBranchId
      items: [], // To hold items/recipes/sub-recipes
      costs: { // Initial cost structure
          storageCostPercent: 0,
          shippingCostPercent: 0,
          otherLogisticsPercent: 0,
      }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  // --- Fetch Initial Data ---
  useEffect(() => {
    dispatch(fetchAllBranches());
    dispatch(fetchAllItems({}));
    dispatch(fetchRecipes({}));
    dispatch(fetchSubRecipes({}));
  }, [dispatch]);

  // --- Prepare Branch Options with default --- 
  const branchOptionsWithDefault = useMemo(() => {
      const options = branches.map(b => ({ 
          value: String(b.branchId),
          // Use correct property for branch name
          label: b.branchName || `Branch ${b.branchId}` // Changed from b.name
      }));
      // Add a default, disabled option
      return [{ value: '', label: 'Select branch...', disabled: true }, ...options]; 
  }, [branches]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleItemsChange = (items: any[]) => {
      setFormData((prev: any) => ({ ...prev, items }));
  };
  
  const handleCostsChange = (costs: any) => {
      setFormData((prev: any) => ({ ...prev, costs }));
  };

  // --- Calculate Total Item Cost ---
  const totalItemCost = useMemo(() => {
    return formData.items.reduce((sum: number, item: any) => {
        // Assuming 'cost' is populated correctly in handleItemsChange
        const quantity = parseFloat(item.quantity || '0');
        const cost = parseFloat(item.cost || '0');
        return sum + (quantity * cost);
    }, 0);
  }, [formData.items]);

  // Function to show modal
  const showModal = (title: string, message: string, isSuccess: boolean = false) => {
      setModalTitle(title);
      setModalMessage(message);
      setIsSuccessModal(isSuccess);
      setModalOpen(true);
  };

  // Function to close modal (and redirect on success)
  const handleCloseModal = () => {
      setModalOpen(false);
      if (isSuccessModal) {
          router.push('/transfers');
      }
  };

  const handleSubmit = async () => {
    console.log("Attempting to Submit Transfer Data:", formData);
    setIsSubmitting(true);

    // Reset success flag on new submission
    setIsSuccessModal(false);

    // --- Input Validation (Basic) ---
    if (!formData.transferDate || !formData.sourceBranchId || !formData.targetBranchId || formData.items.length === 0) {
        showModal("Validation Error", "Please fill in Transfer Date, Source Branch, Target Branch, and add at least one item.");
        setIsSubmitting(false);
        return;
    }

    // --- Calculate Cost Breakdowns ---
    const calculatedCostBreakdowns = [
        {
            costType: "Storage",
            percentage: parseFloat(formData.costs.storageCostPercent || '0'),
            amount: totalItemCost * (parseFloat(formData.costs.storageCostPercent || '0') / 100),
            grossTotal: 0 // Keep as 0 based on API example
        },
        {
            costType: "Shipping",
            percentage: parseFloat(formData.costs.shippingCostPercent || '0'),
            amount: totalItemCost * (parseFloat(formData.costs.shippingCostPercent || '0') / 100),
            grossTotal: 0 // Keep as 0 based on API example
        },
        {
            costType: "Other Logistics",
            percentage: parseFloat(formData.costs.otherLogisticsPercent || '0'),
            amount: totalItemCost * (parseFloat(formData.costs.otherLogisticsPercent || '0') / 100),
            grossTotal: 0 // Keep as 0 based on API example
        },
    ];

    let endpoint = '';
    let requestBodyBase: any = {
        transferType: formData.transferType,
        transferDate: formData.transferDate,
        costBreakdowns: calculatedCostBreakdowns.map(cost => ({ 
            costType: cost.costType,
            percentage: cost.percentage, // Already a number
            amount: parseFloat(cost.amount.toFixed(2)), // Send calculated amount
            grossTotal: cost.grossTotal // Send 0 as per example
        })),
    };
    let requestBody = { ...requestBodyBase };

    // --- Construct Request Body based on Type ---
    try {
      switch (transferTypeParam) {
        case 'inventory':
          endpoint = '/transfer/items';
          requestBody.itemTransferList = formData.items.map((item: any) => ({
            quantity: parseInt(item.quantity || '0'), 
            uom: item.uom || '',
            cost: parseFloat(item.cost || '0'),
            sourceItemId: parseInt(item.itemId), // Source item ID
            targetItemId: parseInt(item.targetItemId || item.itemId), // Target item ID (fallback to source if not selected)
            sourceBranchId: parseInt(formData.sourceBranchId),
            targetBranchId: parseInt(formData.targetBranchId),
          }));
          break;
        case 'recipe':
          endpoint = '/transfer/main-recipe';
          requestBody.preparedMainRecipeTransferRequestList = formData.items.map((item: any) => ({
            quantity: parseInt(item.quantity || '0'),
            uom: item.uom || '',
            cost: parseFloat(item.cost || '0'),
            sourcePreparedMainRecipeId: parseInt(item.recipeId), // Source recipe ID
            targetPreparedMainRecipeId: parseInt(item.targetRecipeId || item.recipeId), // +++ Add Target recipe ID +++
            sourceBranchId: parseInt(formData.sourceBranchId),
            targetBranchId: parseInt(formData.targetBranchId),
          }));
          break;
        case 'sub-recipe':
          endpoint = '/transfer/prepared-sub-recipe'; // Endpoint from image 3
          requestBody.preparedSubRecipeTransferRequestList = formData.items.map((item: any) => ({
            quantity: parseInt(item.quantity || '0'),
            uom: item.uom || '',
            cost: parseFloat(item.cost || '0'),
            sourcePreparedSubRecipeId: parseInt(item.subRecipeId), // Source sub-recipe ID
            targetPreparedSubRecipeId: parseInt(item.targetSubRecipeId || item.subRecipeId), // +++ Add Target sub-recipe ID +++
            sourceBranchId: parseInt(formData.sourceBranchId),
            targetBranchId: parseInt(formData.targetBranchId),
          }));
          break;
        default:
          showModal("Error", "Invalid transfer type for submission.");
          setIsSubmitting(false);
          return;
      }

      console.log("Sending API Request:", endpoint, JSON.stringify(requestBody, null, 2));

      // --- API Call ---
      const response = await api.post(endpoint, requestBody);

      console.log("API Response:", response);

      // --- Handle Response ---
      if (response.status === 200 || response.status === 201) { // Check for success status
          showModal("Success", `Transfer (${formData.transferType}) submitted successfully!`, true);
      } else {
          // Attempt to get error message from response, fallback to generic message
          const errorMsg = response.data?.description || response.data?.message || 'Submission failed. Please try again.';
          showModal("Error", `Submission Failed: ${errorMsg}`);
      }
    } catch (error: any) { // Catch block for network errors or exceptions
        console.error("API Submission Error:", error);
        const errorMsg = error.response?.data?.description || error.response?.data?.message || error.message || 'An unexpected error occurred.';
        showModal("Error", `Submission Failed: ${errorMsg}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderItemTable = () => {
    switch (transferTypeParam) {
      case 'inventory':
        return <TransferInventoryItemsTable 
          items={formData.items} 
          allItems={itemsData || []} 
          onChange={handleItemsChange} 
          selectedBranchId={formData.sourceBranchId} // Pass selected branch ID
        />;
      case 'recipe':
        return <TransferRecipeTable 
          items={formData.items} 
          allRecipes={recipesData || []} 
          onChange={handleItemsChange} 
        />;
      case 'sub-recipe':
        return <TransferSubRecipeTable 
          items={formData.items} 
          allSubRecipes={subRecipesData || []} 
          onChange={handleItemsChange} 
        />;
      default:
        return <p className="text-red-500">Invalid transfer type.</p>;
    }
  };

  return (
    <PageLayout title={`Create Transfer - ${formData.transferType}`}>
      <div className="space-y-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/transfers" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>Back to Transfers</span>
          </Link>
        </div>

        {/* Header Form */}
        <TransferHeaderForm 
           formData={formData} 
           handleChange={handleChange} 
           branchOptions={branchOptionsWithDefault} // Pass options with default
        />

        {/* Dynamic Item/Recipe Table */}
        {renderItemTable()}
        
        {/* Cost Table */}
        <TransferCostTable 
           costs={formData.costs} 
           onChange={handleCostsChange} 
           totalItemCost={totalItemCost} 
        />

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={
              isSubmitting || 
              branchesLoading || 
              itemsStatus === 'loading' || 
              recipeStatus === 'loading' || 
              subRecipeStatus === 'loading'
            }
          >
            {isSubmitting ? 'Submitting...' : 'Submit Transfer'}
          </Button>
        </div>
      </div>

      {/* Confirmation Modal for feedback */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={handleCloseModal} // Use the combined close/redirect handler
        title={modalTitle}
        message={modalMessage}
        isAlert={true} // Use alert mode for simple OK button
        okText="OK"
      />
    </PageLayout>
  );
}

export default function CreateTransferPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}> 
            <CreateTransferContent />
        </Suspense>
    );
} 