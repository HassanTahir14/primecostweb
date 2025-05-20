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
import { useTranslation } from '@/context/TranslationContext';

// Import form parts (assuming they will be created)
import TransferHeaderForm from '@/components/transfers/TransferHeaderForm';
import TransferInventoryItemsTable from '@/components/transfers/TransferInventoryItemsTable';
import TransferRecipeTable from '@/components/transfers/TransferRecipeTable';
import TransferSubRecipeTable from '@/components/transfers/TransferSubRecipeTable';
import TransferCostTable from '@/components/transfers/TransferCostTable';
import Loader from '@/components/common/Loader';

// Define interfaces for better type safety
interface UnitOfMeasurement {
  unitOfMeasurementId: number;
  unitName: string;
  unitDescription: string;
}

interface Branch {
  branchId: number;
  branchName: string;
  storageLocations: Array<{
    storageLocationId: number;
    storageLocationName: string;
  }>;
}

interface InventoryItem {
  itemId: number;
  itemName: string;
  itemCode: string;
  storageLocationId: number;
  storageLocation: string;
  branchId: number;
  totalQuantity: number;
  primaryUnitId: number;
  primaryUnitValue: number;
  secondaryUnitId: number;
  secondaryUnitValue: number;
  branchLocation: string;
}

interface PreparedMainRecipe {
  preparedMainRecipeId: number;
  preparedByUserId: number;
  uom: string;
  expirationDate: string;
  preparedDate: string;
  preparedMainRecipeStatus: string;
  inventoryLocations: Array<{
    inventoryId: number;
    storageLocation: number;
    branchLocation: number;
    storageLocationWithCode: string;
    quantity: number;
    lastUpdated: string;
  }>;
  totalQuantityAcrossLocations: number;
  recipeCode: string;
  mainRecipeBatchNumber: string;
  mainRecipeNameAndDescription: string;
}

interface PreparedSubRecipe {
  preParedSubRecipeId: number;
  preparedByUserId: number;
  subeRecipeCode: string;
  uom: string;
  expirationDate: string;
  preparedDate: string;
  preparedSubRecipeStatus: string;
  inventoryLocations: Array<{
    inventoryId: number;
    storageLocation: number;
    branchLocation: number;
    storageLocationWithCode: string;
    quantity: number;
    lastUpdated: string;
  }>;
  totalQuantityAcrossLocations: number;
  subRecipeBatchNumber: string;
  subRecipeNameAndDescription: string;
}

function CreateTransferContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const transferTypeParam = searchParams.get('type') || 'inventory'; // Default to inventory

  // Get auth user from localStorage
  const [authUser, setAuthUser] = useState<any>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [preparedMainRecipes, setPreparedMainRecipes] = useState<PreparedMainRecipe[]>([]);
  const [preparedSubRecipes, setPreparedSubRecipes] = useState<PreparedSubRecipe[]>([]);
  const [loading, setLoading] = useState({
    inventory: false,
    mainRecipes: false,
    subRecipes: false
  });
  const [allItems, setAllItems] = useState<any[]>([]);

  useEffect(() => {
    const storedAuthUser = localStorage.getItem('authUser');
    if (storedAuthUser) {
      setAuthUser(JSON.parse(storedAuthUser));
    }
  }, []);

  // --- Selectors --- 
  const { branches, loading: branchesLoading, error: branchesError } = useSelector((state: RootState) => state.branch);
  const { items: itemsData, status: itemsStatus, error: itemsError } = useSelector((state: RootState) => state.items);
  const { recipes: recipesData, status: recipeStatus, error: recipesError } = useSelector((state: RootState) => state.recipe);
  const { subRecipes: subRecipesData, status: subRecipeStatus, error: subRecipesError } = useSelector((state: RootState) => state.subRecipe);
  
  // State for units of measurement
  const [units, setUnits] = useState<UnitOfMeasurement[]>([]);

  // Fetch units of measurement
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await api.get('/units-of-measurement/all');
        if (response.data && response.data.unitsOfMeasurement) {
          setUnits(response.data.unitsOfMeasurement);
        }
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };
    
    fetchUnits();
  }, []);

  const [formData, setFormData] = useState<any>({
      transferType: transferTypeParam.charAt(0).toUpperCase() + transferTypeParam.slice(1), // Set initial type from param
      transferDate: new Date().toISOString().split('T')[0], // Default to today
      transferBy: authUser?.username || '', // Get username from auth user
      sourceBranchId: '', // Changed to sourceBranchId
      targetBranchId: '', // Changed to targetBranchId
      items: [], // To hold items/recipes/sub-recipes
      costs: { // Initial cost structure
          storageCostPercent: 0,
          shippingCostPercent: 0,
          otherLogisticsPercent: 0,
      }
  });

  // Update formData when authUser is loaded
  useEffect(() => {
    if (authUser?.username) {
      setFormData((prev: any) => ({
        ...prev,
        transferBy: authUser.username
      }));
    }
  }, [authUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  // --- Fetch Initial Data ---
  useEffect(() => {
    dispatch(fetchAllBranches());
  }, [dispatch]);

  // Fetch inventory data when source branch changes
  useEffect(() => {
    if (formData.sourceBranchId) {
      switch (transferTypeParam) {
        case 'inventory':
          fetchInventoryData();
          break;
        case 'recipe':
          fetchMainRecipes();
          break;
        case 'sub-recipe':
          fetchSubRecipes();
          break;
      }
    }
  }, [formData.sourceBranchId, transferTypeParam]);

  // Fetch all items for cost info
  useEffect(() => {
    const fetchAllItemsData = async () => {
      try {
        const response = await api.post('/items/all', { page: 0, size: 200000 });
        if (response.data && response.data.itemList) {
          setAllItems(response.data.itemList);
        }
      } catch (error) {
        console.error('Error fetching all items:', error);
      }
    };
    fetchAllItemsData();
  }, []);

  // --- Prepare Branch Options with default --- 
  const branchOptionsWithDefault = useMemo(() => {
      const options = branches.map(b => ({ 
          value: String(b.branchId),
          // Use correct property for branch name
          label: b.branchName || `Branch ${b.branchId}` // Changed from b.name
      }));
      // Add a default, disabled option
      return [ ...options]; 
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
        // cost is now unit cost, so multiply by quantity
        const quantity = parseFloat(item.quantity || '0');
        const cost = parseFloat(item.cost || '0');
        return sum + (quantity * cost);
    }, 0);
  }, [formData.items]);

  // --- Calculate Grand Total (including taxes) ---
  const totalTransferTaxes = useMemo(() => {
    const storage = totalItemCost * (parseFloat(formData.costs.storageCostPercent || '0') / 100);
    const shipping = totalItemCost * (parseFloat(formData.costs.shippingCostPercent || '0') / 100);
    const other = totalItemCost * (parseFloat(formData.costs.otherLogisticsPercent || '0') / 100);
    return storage + shipping + other;
  }, [totalItemCost, formData.costs]);

  const grandTotal = useMemo(() => {
    return totalItemCost + totalTransferTaxes;
  }, [totalItemCost, totalTransferTaxes]);

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

  // Function to get unit name by ID
  const getUnitName = (unitId: number) => {
    const unit = units.find(u => u.unitOfMeasurementId === unitId);
    return unit ? unit.unitName : 'N/A';
  };

  const handleSubmit = async () => {
    console.log("Attempting to Submit Transfer Data:", formData);
    setIsSubmitting(true);

    // Reset success flag on new submission
    setIsSuccessModal(false);

    // --- Input Validation (Basic) ---
    if (!formData.transferDate || !formData.sourceBranchId || !formData.targetBranchId || formData.items.length === 0) {
        showModal(t('transfers.validationErrorTitle'), t('transfers.validationErrorFields'));
        setIsSubmitting(false);
        return;
    }

    // Check if source and target branches are the same
    if (formData.sourceBranchId === formData.targetBranchId) {
        showModal(t('transfers.validationErrorTitle'), t('transfers.validationErrorSameBranch'));
        setIsSubmitting(false);
        return;
    }

    // --- Quantity Validation ---
    if (transferTypeParam === 'inventory') {
      const invalidItem = formData.items.find((item: any) => {
        const selectedUnitId = parseInt(item.uom);
        const primaryUnitValue = item.primaryUnitValue || 1;
        const secondaryUnitValue = item.secondaryUnitValue || 1;
        let maxQuantity = item.availableQuantity;
        let enteredQuantity = parseFloat(item.quantity) || 0;
        if (selectedUnitId === item.secondaryUnitId) {
          maxQuantity = (item.availableQuantity * secondaryUnitValue) / primaryUnitValue;
        }
        // Allow up to 2 decimals for comparison
        const truncate2 = (val: number) => {
          const str = val.toString();
          const dot = str.indexOf('.') !== -1 ? str.indexOf('.') : str.length;
          return parseFloat(str.slice(0, dot + 1 + 2).replace(/\.$/, ''));
        };
        return truncate2(enteredQuantity) > truncate2(maxQuantity);
      });
      if (invalidItem) {
        showModal(t('transfers.validationErrorTitle'), t('transfers.validationErrorQuantity'));
        setIsSubmitting(false);
        return;
      }
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
        transferBy: formData.transferBy,
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
          requestBody.itemTransferList = formData.items.map((item: any) => {
            const quantity = parseFloat(item.quantity || '0');
            const unitCost = parseFloat(item.cost || '0');
            const rowTotal = quantity * unitCost;
            const rowShare = totalItemCost > 0 ? rowTotal / totalItemCost : 0;
            const rowCostWithTaxes = parseFloat((rowShare * grandTotal).toFixed(2));
            return {
              quantity,
              uom: (() => {
                // Find the unit name for the selected uom id
                const unit = units.find(u => String(u.unitOfMeasurementId) === String(item.uom));
                return unit ? unit.unitName : '';
              })(),
              cost: rowCostWithTaxes,
              sourceItemId: parseInt(item.itemId), // Source item ID
              targetItemId: parseInt(item.targetItemId || item.itemId), // Target item ID (fallback to source if not selected)
              sourceBranchId: parseInt(formData.sourceBranchId),
              targetBranchId: parseInt(formData.targetBranchId),
            };
          });
          break;
        case 'recipe':
          endpoint = '/transfer/main-recipe';
          requestBody.preparedMainRecipeTransferRequestList = formData.items.map((item: any) => {
            const quantity = parseFloat(item.quantity || '0');
            const unitCost = parseFloat(item.cost || '0');
            const rowTotal = quantity * unitCost;
            const rowShare = totalItemCost > 0 ? rowTotal / totalItemCost : 0;
            const rowCostWithTaxes = parseFloat((rowShare * grandTotal).toFixed(2));
            return {
              quantity,
              uom: 'KG',
              cost: rowCostWithTaxes,
              sourcePreparedMainRecipeId: parseInt(item.recipeId), // Source recipe ID
              targetPreparedMainRecipeId: parseInt(item.targetRecipeId || item.recipeId), // +++ Add Target recipe ID +++
              sourceBranchId: parseInt(formData.sourceBranchId),
              targetBranchId: parseInt(formData.targetBranchId),
            };
          });
          break;
        case 'sub-recipe':
          endpoint = '/transfer/prepared-sub-recipe'; // Endpoint from image 3
          requestBody.preparedSubRecipeTransferRequestList = formData.items.map((item: any) => {
            const quantity = parseFloat(item.quantity || '0');
            const unitCost = parseFloat(item.cost || '0');
            const rowTotal = quantity * unitCost;
            const rowShare = totalItemCost > 0 ? rowTotal / totalItemCost : 0;
            const rowCostWithTaxes = parseFloat((rowShare * grandTotal).toFixed(2));
            return {
              quantity,
              uom: 'KG',
              cost: rowCostWithTaxes,
              sourcePreparedSubRecipeId: parseInt(item.subRecipeId), // Source sub-recipe ID
              targetPreparedSubRecipeId: parseInt(item.targetSubRecipeId || item.subRecipeId), // +++ Add Target sub-recipe ID +++
              sourceBranchId: parseInt(formData.sourceBranchId),
              targetBranchId: parseInt(formData.targetBranchId),
            };
          });
          break;
        default:
          showModal(t('common.error'), t('transfers.invalidType'));
          setIsSubmitting(false);
          return;
      }

      console.log("Sending API Request:", endpoint, JSON.stringify(requestBody, null, 2));

      // --- API Call ---
      const response = await api.post(endpoint, requestBody);

      console.log("API Response:", response);

      // --- Handle Response ---
      if (response.status === 200 || response.status === 201) { // Check for success status
          showModal(t('common.success'), t('transfers.submitSuccess', { type: formData.transferType }), true);
      } else {
          // Attempt to get error message from response, fallback to generic message
          const errorMsg = response.data?.description || response.data?.message || t('transfers.submitFailed');
          showModal(t('common.error'), `${t('transfers.submitFailed')}: ${errorMsg}`);
      }
    } catch (error: any) { // Catch block for network errors or exceptions
        console.error("API Submission Error:", error);
        const errorMsg = error.response?.data?.description || error.response?.data?.message || error.message || t('transfers.unexpectedError');
        showModal(t('common.error'), `${t('transfers.submitFailed')}: ${errorMsg}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      setLoading(prev => ({ ...prev, inventory: true }));
      const response = await api.post('/inventory/view/items', {});
      if (response.data?.inventorylist) {
        // Filter items for the selected branch and with quantity > 0
        const filteredItems = response.data.inventorylist.filter(
          (item: InventoryItem) => 
            item.branchId === parseInt(formData.sourceBranchId) && 
            item.totalQuantity > 0
        );
        setInventoryItems(filteredItems);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoading(prev => ({ ...prev, inventory: false }));
    }
  };

  const fetchMainRecipes = async () => {
    try {
      setLoading(prev => ({ ...prev, mainRecipes: true }));
      const response = await api.post('/inventory/view/prepared-main-recipe', {
        page: 0,
        size: 1000,
        sortBy: 'preparedDate',
        direction: 'asc'
      });
      if (response.data?.preparedMainRecipeList) {
        // Filter recipes for the selected branch and with quantity > 0
        const filteredRecipes = response.data.preparedMainRecipeList.filter(
          (recipe: PreparedMainRecipe) => 
            recipe.inventoryLocations.some(loc => 
              loc.branchLocation === parseInt(formData.sourceBranchId) && 
              loc.quantity > 0
            )
        );
        setPreparedMainRecipes(filteredRecipes);
      }
    } catch (error) {
      console.error('Error fetching main recipes:', error);
    } finally {
      setLoading(prev => ({ ...prev, mainRecipes: false }));
    }
  };

  const fetchSubRecipes = async () => {
    try {
      setLoading(prev => ({ ...prev, subRecipes: true }));
      const response = await api.post('/inventory/view/prepared-sub-recipe', {
        page: 0,
        size: 1000,
        sortBy: 'preparedDate',
        direction: 'asc'
      });
      if (response.data?.preparedSubRecipeList) {
        // Filter sub-recipes for the selected branch and with quantity > 0
        const filteredSubRecipes = response.data.preparedSubRecipeList.filter(
          (subRecipe: PreparedSubRecipe) => 
            subRecipe.inventoryLocations.some(loc => 
              loc.branchLocation === parseInt(formData.sourceBranchId) && 
              loc.quantity > 0
            )
        );
        setPreparedSubRecipes(filteredSubRecipes);
      }
    } catch (error) {
      console.error('Error fetching sub recipes:', error);
    } finally {
      setLoading(prev => ({ ...prev, subRecipes: false }));
    }
  };

  const renderItemTable = () => {
    switch (transferTypeParam) {
      case 'inventory':
        return <TransferInventoryItemsTable 
          items={formData.items} 
          allItems={inventoryItems} 
          allItemsWithCost={allItems}
          onChange={handleItemsChange} 
          sourceBranchId={formData.sourceBranchId}
          selectedBranchId={formData.sourceBranchId}
          targetBranchId={formData.targetBranchId}
          units={units}
        />;
      case 'recipe':
        return <TransferRecipeTable 
          items={formData.items} 
          allRecipes={preparedMainRecipes} 
          onChange={handleItemsChange} 
          selectedBranchId={formData.sourceBranchId}
          sourceBranchId={formData.sourceBranchId}
          targetBranchId={formData.targetBranchId}
          units={units}
        />;
      case 'sub-recipe':
        return <TransferSubRecipeTable 
          selectedBranchId={formData.sourceBranchId}
          sourceBranchId={formData.sourceBranchId}
          targetBranchId={formData.targetBranchId}
          items={formData.items} 
          allSubRecipes={preparedSubRecipes} 
          onChange={handleItemsChange} 
          units={units}
        />;
      default:
        return <p className="text-red-500">Invalid transfer type.</p>;
    }
  };

  return (
    <PageLayout title={t('transfers.createTitle', { type: t(`transfers.tab.${transferTypeParam}`) })}>
      <div className="space-y-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/transfers" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
            <ArrowLeft size={20} />
            <span>{t('transfers.backToTransfers')}</span>
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
            {isSubmitting ? t('transfers.submitting') : t('transfers.submitTransfer')}
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
        okText={t('common.ok')}
      />
    </PageLayout>
  );
}

export default function CreateTransferPage() {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <PageLayout title={t('transfers.createTitle', { type: '' })}>
          <div className="flex justify-center items-center h-64">
            <Loader size="medium" />
          </div>
        </PageLayout>
      }
    >
      <CreateTransferContent />
    </Suspense>
  );
}