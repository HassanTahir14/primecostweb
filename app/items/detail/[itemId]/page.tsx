'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux'; // Import useSelector
// Remove api import if no longer needed for this page
// import api from '@/store/api'; 
import GenericDetailPage, { DetailFieldConfig } from '@/components/common/GenericDetailPage';
import PageLayout from '@/components/PageLayout'; 
import { selectAllItems, selectItemsStatus } from '@/store/itemsSlice'; // Import selector for items list
import { selectAllCategories } from '@/store/itemCategorySlice'; // Import category selector
import { selectAllTaxes } from '@/store/taxSlice'; // Import tax selector
// We need a way to get Units - assuming a selector exists or fetching directly
import api from '@/store/api'; // Re-import api if needed for units
import { RootState } from '@/store/store'; // Import RootState if needed for typing selector

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
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId as string;

  // Get data from Redux state
  const allItems = useSelector(selectAllItems);
  const itemsStatus = useSelector(selectItemsStatus); 
  const categories = useSelector(selectAllCategories);
  const taxes = useSelector(selectAllTaxes);
  
  // Local state for Units (fetched directly)
  const [units, setUnits] = useState<ApiUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  // Local state for the specific item, loading, and error
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);

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

  // --- Field Configuration (Using IDs and render functions for names) ---
  const fieldConfig: DetailFieldConfig[] = [
    { 
      key: 'name', 
      label: 'Item Name',
      render: (name) => name.split('@')[0]
    },
    {
      key: 'name',
      label: 'Item Type',
      render: (name) => name.split('@')[1] || 'N/A'
    },
    { key: 'code', label: 'Item Code' },
    { key: 'itemsBrandName', label: 'Brand Name' },
    {
      key: 'categoryId', 
      label: 'Category',
      render: (categoryId) => categories.find(c => c.categoryId === categoryId)?.name || categoryId || 'N/A'
    },
    {
      key: 'primaryUnitId',
      label: 'Primary Unit',
      render: (unitId) => units.find(u => u.unitOfMeasurementId === unitId)?.unitName || unitId || 'N/A'
    },
    { key: 'primaryUnitValue', label: 'Primary Unit Value' }, 
    {
      key: 'secondaryUnitId',
      label: 'Secondary Unit',
      render: (unitId) => unitId ? (units.find(u => u.unitOfMeasurementId === unitId)?.unitName || unitId) : 'N/A'
    },
    {
      key: 'secondaryUnitValue',
      label: 'Secondary Unit Value',
      render: (value, data) => data.secondaryUnitId ? (value ?? 'N/A') : 'N/A' // Show only if secondary unit exists
    }, 
    {
      key: 'taxId',
      label: 'Tax Type',
      render: (taxId) => taxes.find(t => t.taxId === taxId)?.taxName || taxId || 'N/A'
    },
    {
      key: 'taxId', // Use taxId again to find rate
      label: 'Tax Rate',
      render: (taxId) => {
          const tax = taxes.find(t => t.taxId === taxId);
          return tax ? `${tax.taxRate}%` : 'N/A';
      }
    },
    { 
      key: 'purchaseCostWithoutVat', 
      label: 'Cost (VAT Excl)',
      render: (value) => formatCurrency(value) 
    },
    { 
      key: 'purchaseCostWithVat', 
      label: 'Cost (VAT Incl)', 
      render: (value) => formatCurrency(value)
    },
    { key: 'countryOrigin', label: 'Country of Origin' },
    // Conditionally render date field only if data exists
    { key: 'createdAt', label: 'Created At', render: (value) => value ? formatDate(value) : 'N/A' }, 
    { key: 'updatedAt', label: 'Last Updated', render: (value) => value ? formatDate(value) : 'N/A' },
  ];

  // Define imageBaseUrl (same as before)
  const imageBaseUrl = ''; // Replace with actual base URL

  // Show loading if item list or units are loading, or if item is being searched
  const combinedLoading = loading || itemsStatus === 'loading' || itemsStatus === 'idle' || unitsLoading;

  return (
    <PageLayout title={combinedLoading ? "Loading Item..." : (item ? `Item: ${item.name}` : "Item Detail")}>
      <GenericDetailPage
        title="Item Details"
        data={item}
        fieldConfig={fieldConfig}
        onBack={() => router.back()}
        isLoading={combinedLoading}
        error={error} // Show main error if item not found or list failed
        imageKey="images"
        imageBaseUrl={imageBaseUrl}
      />

      {/* Conditionally Render Branch Details Section */} 
      {!combinedLoading && item && item.branchDetails && item.branchDetails.length > 0 && (
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-gray-50">
          <div className="bg-white bg-opacity-70 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
            <h2 className="text-base md:text-lg font-bold mb-4">Branch Stock Details</h2>
            <div className="bg-white bg-opacity-90 rounded-xl shadow-md overflow-hidden">
              <div className="p-4 sm:p-6">
                <dl className="grid grid-cols-1 gap-y-4">
                  {item.branchDetails.map((detail) => (
                    <div key={detail.branchId + '-' + detail.storageLocationId}>
                      <dt className="text-lg font-medium text-gray-900">{detail.branchName}</dt>
                      <dd className="mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Location</span>
                            <p className="mt-1 text-sm text-gray-900">{detail.storageLocationName}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Quantity</span>
                            <p className="mt-1 text-sm text-gray-900">{detail.quantity}</p>
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
    </PageLayout>
  );
} 