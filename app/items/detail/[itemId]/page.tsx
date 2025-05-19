'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux'; // Import useSelector
// Remove api import if no longer needed for this page
// import api from '@/store/api'; 
import GenericDetailPage, { DetailFieldConfig } from '@/components/common/GenericDetailPage';
import PageLayout from '@/components/PageLayout'; 
import { selectAllItems, selectItemsStatus } from '@/store/itemsSlice'; // Import selector for items list
import { selectAllCategories } from '@/store/itemCategorySlice'; // Import category selector
import { fetchAllTaxes, selectAllTaxes } from '@/store/taxSlice'; // Import tax selector
// We need a way to get Units - assuming a selector exists or fetching directly
import api from '@/store/api'; // Re-import api if needed for units
import { RootState } from '@/store/store'; // Import RootState if needed for typing selector
import axios from 'axios'; // Use axios for direct API call if not using your api wrapper
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';
import { useTranslation } from '@/context/TranslationContext';

// Define the specific Item structure (can be imported if defined elsewhere)
interface ItemImage { imageId: number; path: string; }

// Define the BranchDetail structure
interface BranchDetail {
  branchId: number;
  branchName: string;
  storageLocationId: number;
  storageLocationName: string;
  quantity: number;
}




interface Item {
  itemId: number;
  name: string;
  code: string;
  itemsBrandName: string;
  categoryId: number;
  taxId: number;
  primaryUnitId: number;
  primaryUnitValue: number;
  secondaryUnitId?: number; // Make optional if it can be null/undefined
  secondaryUnitValue?: number;
  countryOrigin: string;
  purchaseCostWithoutVat: number;
  purchaseCostWithVat: number;
  images: ItemImage[];
  createdAt?: string; // Make createdAt optional if not always present in list data
  updatedAt?: string; // Keep optional
  branchDetails?: BranchDetail[]; // Added optional branch details
  // Add any other fields returned by the single item API endpoint
}

// Unit structure from the API call
interface ApiUnit {
    unitOfMeasurementId: number;
    unitName: string;
    unitDescription?: string;
}

// Add interface for auth user
interface AuthUser {
  username: string;
  userId: number;
  role: string;
  dashboardMenuList: Array<{ menuName: string }>;
}

// Add this interface for purchase order transaction
interface PurchaseOrderTransaction {
  id: number;
  quantity: number;
  unitId: number;
  unitName: string;
  itemCode: string;
  purchaseCost: number;
  supplierId: number;
  supplierName: string;
  dateOfOrder: string;
  dateOfDelivery: string;
  expiryDate: string;
  purchaseOrderStatus: string;
  storageLocationId: number;
  branchId: number;
}

// --- Helper function for formatting currency ---
const formatCurrency = (value: number | null | undefined, currency = 'SAR') => {
  if (value === null || value === undefined) return 'N/A';
  return `${currency} ${value.toFixed(2)}`;
};

// --- Helper function for formatting dates ---
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit' // Optional: add time
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export default function ItemDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId as string;
  const { currency } = useCurrency();

  // Get data from Redux state
  const allItems = useSelector(selectAllItems);
  const itemsStatus = useSelector(selectItemsStatus); 
   

  
  // Local state for Units (fetched directly)
  const [units, setUnits] = useState<ApiUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  // Local state for the specific item, loading, and error
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);

  // Get user role from localStorage
  const [isAdmin, setIsAdmin] = useState(false);
  const dispatch = useDispatch();
  const [taxes, setTaxes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Add state for purchase order transactions
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderTransaction[]>([]);
  const [purchaseOrdersLoading, setPurchaseOrdersLoading] = useState(false);
  const [purchaseOrdersError, setPurchaseOrdersError] = useState<string | null>(null);
  // Only use RECEIVED purchase orders for calculations and display
  const receivedPurchaseOrders = purchaseOrders.filter(po => po.purchaseOrderStatus === 'RECEIVED');

  const [formattedCosts, setFormattedCosts] = useState<any>({});

  useEffect(() => {
    const authUserStr = localStorage.getItem('authUser');
    if (authUserStr) {
      try {
        const authUser: AuthUser = JSON.parse(authUserStr);
        setIsAdmin(authUser.role === 'Admin');
      } catch (error) {
        console.error('Error parsing auth user:', error);
      }
    }
  }, []);

  // Fetch Units directly (since we don't have a slice/selector yet)
  useEffect(() => {
    setUnitsLoading(true);
    setUnitsError(null);
    api.get('/units-of-measurement/all')
        .then(response => {
            if (response.data && response.data.unitsOfMeasurement) {
                setUnits(response.data.unitsOfMeasurement);
            } else {
                throw new Error('Invalid response structure for units');
            }
        })
        .catch(err => {
            console.error("Failed to fetch units:", err);
            setUnitsError(err.response?.data?.description || err.message || 'Failed to load units.');
        })
        .finally(() => {
            setUnitsLoading(false);
        });
  }, []); // Fetch only once on mount

   useEffect(() => {
    api.get('/tax/all')
      .then(res => {
        const taxArr = res.data.taxList || [];
        setTaxes(taxArr);
      })
      .catch(err => {
        console.error('Failed to fetch taxes:', err);
      });

    api.get('categories/all')
      .then(res => {
        const catArr = res.data.itemCategoryList || [];
        setCategories(catArr);
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
      });

  }, [dispatch]);

  // Effect to find the item in the Redux store once items & units are ready
  useEffect(() => {
    // Wait until dependent data (items list, units) is loaded or failed
    if (itemsStatus === 'idle' || itemsStatus === 'loading' || unitsLoading) {
        setLoading(true); // Keep showing loading
        return;
    }

    setLoading(true); // Start the search process
    setError(null);

    if (!itemId) {
      setError('Item ID is missing.');
      setLoading(false);
      return;
    }

    if (itemsStatus === 'failed') {
        setError('Could not load items list to find the detail.');
        setLoading(false);
        return;
    }
     if (unitsError) {
        // Decide how to handle this - show item details without unit names?
        console.warn("Units failed to load, unit names may be missing.");
        // setError('Could not load necessary unit data.');
        // setLoading(false);
        // return; // Or continue without unit names?
    }

    // Proceed if items loaded successfully (even if units failed, we might show IDs)
    if (itemsStatus === 'succeeded') {
        const numericItemId = parseInt(itemId, 10);
        if (isNaN(numericItemId)) {
             setError('Invalid Item ID.');
             setLoading(false);
             return;
        }
        
        const foundItem = allItems.find(i => i.itemId === numericItemId);

        if (foundItem) {
            setItem(foundItem); 
            setError(null);
        } else {
            setError(`Item with ID ${itemId} not found in the list.`);
        }
        setLoading(false); 
    } 

  }, [itemId, allItems, itemsStatus, units, unitsLoading, unitsError]); // Re-run when dependencies change

  // Fetch purchase order transactions for this item
  useEffect(() => {
  if (!itemId) return;
  setPurchaseOrdersLoading(true);
  setPurchaseOrdersError(null);

  api.post(`/purchase-order/transaction?itemId=${Number(itemId)}`)
    .then(res => {
      if (res.data && res.data.purchaseOrderTransactionsList) {
        setPurchaseOrders(res.data.purchaseOrderTransactionsList);
      } else {
        setPurchaseOrders([]);
      }
    })
    .catch(err => {
      setPurchaseOrdersError('Failed to load purchase orders');
      setPurchaseOrders([]);
    })
    .finally(() => setPurchaseOrdersLoading(false));
}, [itemId]);

  useEffect(() => {
    if (item) {
      const formatCosts = async () => {
        const costs = {
          purchaseCostWithoutVat: await formatCurrencyValue(item.purchaseCostWithoutVat, currency),
          purchaseCostWithVat: await formatCurrencyValue(item.purchaseCostWithVat, currency)
        };
        setFormattedCosts(costs);
      };
      formatCosts();
    }
  }, [item, currency]);

  // --- Field Configuration (Using IDs and render functions for names) ---
  const fieldConfig: DetailFieldConfig[] = [
    { 
      key: 'name', 
      label: t('items.detail.itemName'),
      render: (name) => name.split('@')[0]
    },
    {
      key: 'name',
      label: t('items.detail.itemType'),
      render: (name) => name.split('@')[1] || t('common.na')
    },
    { key: 'code', label: t('items.detail.itemCode') },
    { key: 'itemsBrandName', label: t('items.detail.brandName') },
    {
      key: 'categoryId', 
      label: t('items.detail.category'),
      render: (categoryId) => (Array.isArray(categories) ? categories.find(c => c.categoryId === categoryId)?.name : undefined) || categoryId || t('common.na')
    },
    {
      key: 'primaryUnitId',
      label: t('items.detail.primaryUnit'),
      render: (unitId) => units.find(u => u.unitOfMeasurementId === unitId)?.unitName || unitId || t('common.na')
    },
    { key: 'primaryUnitValue', label: t('items.detail.primaryUnitValue') }, 
    {
      key: 'secondaryUnitId',
      label: t('items.detail.secondaryUnit'),
      render: (unitId) => unitId ? (units.find(u => u.unitOfMeasurementId === unitId)?.unitName || unitId) : t('common.na')
    },
    {
      key: 'secondaryUnitValue',
      label: t('items.detail.secondaryUnitValue'),
      render: (value, data) => data.secondaryUnitId ? (value ?? t('common.na')) : t('common.na')
    }, 
    {
      key: 'taxId',
      label: t('items.detail.taxType'),
      render: (taxId) => taxes.find(tax => tax.taxId === taxId)?.taxName || taxId || t('common.na')
    },
    {
      key: 'taxId',
      label: t('items.detail.taxRate'),
      render: (taxId) => {
          const tax = taxes.find(tax => tax.taxId === taxId);
          return tax ? `${tax.taxRate}%` : t('common.na');
      }
    },
    // Only show price-related fields to admin users
    ...(isAdmin ? [
      { 
        key: 'purchaseCostWithoutVat', 
        label: t('items.detail.costVatExcl'),
        render: () => formattedCosts.purchaseCostWithoutVat || t('common.na')
      },
      { 
        key: 'purchaseCostWithVat', 
        label: t('items.detail.costVatIncl'), 
        render: () => formattedCosts.purchaseCostWithVat || t('common.na')
      }
    ] : []),
    { key: 'countryOrigin', label: t('items.detail.countryOfOrigin') },
  ];

  // Show loading if item list or units are loading, or if item is being searched
  const combinedLoading = loading || itemsStatus === 'loading' || itemsStatus === 'idle' || unitsLoading;

  // Get unit names
  const primaryUnit = units.find(u => u.unitOfMeasurementId === item?.primaryUnitId);
  const secondaryUnit = units.find(u => u.unitOfMeasurementId === item?.secondaryUnitId);

  // Conversion rate (e.g., 1 PLT = 12 LTR)
  const conversionRate = item?.secondaryUnitValue;

  // Calculate total stock as the sum of all ingredient quantities in all branches (raw quantity)
  const totalStock = item && item.branchDetails
    ? item.branchDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0)
    : 0;

  // Prepare extra fields for conversion and total stock
  let extraDetails: Record<string, any> = {};
  if (primaryUnit && secondaryUnit && conversionRate) {
    extraDetails = {
      conversionInfo: `1 ${primaryUnit.unitName} = ${conversionRate} ${secondaryUnit.unitName}`,
      totalStockInfo: item && item.branchDetails
        ? `${totalStock} ${primaryUnit ? primaryUnit.unitName : ''}`
        : undefined,
    };
  }

  // Always use an array for taxes
  const taxArr = Array.isArray(taxes) ? taxes : [];
  const itemTax = item ? taxArr.find(t => t.taxId === item.taxId) : undefined;
  const taxTypeWithRate = itemTax ? `${itemTax.taxName} ${itemTax.taxRate}% (${itemTax.taxGroup})` : 'N/A';

  // Extend fieldConfig for details section
  const extendedFieldConfig = [
    ...fieldConfig.filter(f => f.key !== 'taxId' && f.key !== 'taxRate'), // Remove old tax fields
    { key: 'taxTypeWithRate', label: t('items.detail.taxType') },
    ...(extraDetails.conversionInfo ? [{ key: 'conversionInfo', label: t('items.detail.unitConversion') }] : []),
    ...(extraDetails.totalStockInfo ? [{ key: 'totalStockInfo', label: t('items.detail.totalStock') }] : []),
  ];

  // Merge item data with extra details
  const detailsData = item ? { ...item, ...extraDetails, taxTypeWithRate } : item;

  // Prepare branch details for PDF and UI with raw quantity (no transformation)
  const branchDetailsForPDF = item?.branchDetails?.map(detail => ({
    ...detail,
    calculatedQuantity: detail.quantity, // Use raw quantity
    unitName: primaryUnit ? primaryUnit.unitName : '',
  })) || [];

  return (
    <PageLayout title={
      combinedLoading
        ? t('items.detail.loadingItem')
        : (item ? t('items.detail.itemWithName', { name: item.name.split('@')[0] }) : t('items.detail.itemDetail'))
    }>
      <GenericDetailPage
        title={t('items.detail.itemDetails')}
        data={detailsData}
        fieldConfig={extendedFieldConfig}
        onBack={() => router.back()}
        isLoading={combinedLoading}
        error={error}
        imageKey="images"
        branchDetails={branchDetailsForPDF}
        purchaseOrders={purchaseOrders}
      />


      {/* Conditionally Render Branch Details Section */} 
      {!combinedLoading && item && item.branchDetails && item.branchDetails.length > 0 && (
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-gray-50">
          <div className="bg-white bg-opacity-70 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
            <h2 className="text-base md:text-lg font-bold mb-4">{t('items.detail.branchStockDetails')}</h2>
            <div className="bg-white bg-opacity-90 rounded-xl shadow-md overflow-hidden">
              <div className="p-4 sm:p-6">
                <dl className="grid grid-cols-1 gap-y-4">
                  {item.branchDetails.map((detail) => (
                    <div key={detail.branchId + '-' + detail.storageLocationId}>
                      <dt className="text-lg font-medium text-gray-900">{detail.branchName}</dt>
                      <dd className="mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500">{t('items.detail.location')}</span>
                            <p className="mt-1 text-sm text-gray-900">{detail.storageLocationName}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">{t('items.detail.quantity')}</span>
                            <p className="mt-1 text-sm text-gray-900">{detail.quantity} {primaryUnit ? primaryUnit.unitName : ''}</p>
                          </div>
                        </div>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock details from purchases */}
      {!purchaseOrdersLoading && receivedPurchaseOrders.length > 0 && (
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-gray-50">
          <div className="bg-white bg-opacity-70 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
            <h2 className="text-base md:text-lg font-bold mb-4">{t('items.detail.stockDetailsFromPurchases')}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="text-left font-bold text-gray-700 px-4 py-2">{t('items.detail.purchaseOrderId')}</th>
                    <th className="text-left font-bold text-gray-700 px-4 py-2">{t('items.detail.quantity')}</th>
                    <th className="text-left font-bold text-gray-700 px-4 py-2">{t('items.detail.unit')}</th>
                    <th className="text-left font-bold text-gray-700 px-4 py-2">{t('items.detail.supplierName')}</th>
                    <th className="text-left font-bold text-gray-700 px-4 py-2">{t('items.detail.deliveredDate')}</th>
                    <th className="text-left font-bold text-gray-700 px-4 py-2">{t('items.detail.expiryDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedPurchaseOrders.map(po => (
                    <tr key={po.id} className="bg-white rounded-lg shadow-sm">
                      <td className="text-left px-4 py-2 font-medium text-gray-900">{po.id}</td>
                      <td className="text-left px-4 py-2 text-gray-900">{po.quantity}</td>
                      <td className="text-left px-4 py-2 text-gray-900">{po.unitName}</td>
                      <td className="text-left px-4 py-2 text-gray-900">{po.supplierName}</td>
                      <td className="text-left px-4 py-2 text-gray-900">
                        {po.dateOfDelivery ? new Date(po.dateOfDelivery).toLocaleDateString('en-GB') : t('common.na')}
                      </td>
                      <td className="text-left px-4 py-2 text-gray-900">
                        {po.expiryDate ? new Date(po.expiryDate).toLocaleDateString('en-GB') : t('common.na')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}