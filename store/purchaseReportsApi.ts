import api from './api';

// --- Common Payloads ---
interface DateRangePayload {
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
    size: number; // Optional for pagination
    direction?: 'asc' | 'desc'; // Optional for sorting
}

interface CategoryPayload extends DateRangePayload {
    category: string;
}

// --- Response Interfaces ---

// Rejected POs
export interface RejectedPODetail {
    itemName: string;
    quantity: number;
    unitId: string; // Seems like unit name abbreviation?
    dated: string;
    reason: string;
}
interface RejectedPOResponse {
    rejectedPODetails: RejectedPODetail[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    // No responseCode/description in the image, assume success if data present
}

// Item Expiry
export interface ItemExpiryDetail {
    itemName: string;
    dateAdded: string;
    expiryDate: string;
    quantity: number;
    storageLocationName: string;
    branchId: number;
    branchName: string;
    status: string; // "Expired" or "Good"
    purchaseOrderStatus: string; // "RECEIVED"
}
interface ItemExpiryResponse {
    itemDetails: ItemExpiryDetail[];
    // No responseCode/description in the image
}

// Items by Supplier
export interface ItemsBySupplierDetail {
    itemName: string;
    quantity: number;
    unit: string;
    date: string;
    amount: number;
    purchaseOrderStatus: string;
}
interface ItemsBySupplierResponse {
    responseCode: string;
    description: string;
    totalItems: number;
    totalCost: number;
    supplierDetails: ItemsBySupplierDetail[];
}

// Purchase by Category
export interface PurchaseByCategoryDetail { 
    // API returns "Category not found" - need structure for success case
    // Assuming structure similar to others, e.g.:
    itemName: string;
    quantity: number;
    unit: string;
    date: string;
    amount: number;
    supplierName: string;
}
interface PurchaseByCategoryResponse {
    responseCode: string;
    description: string;
    purchaseDetails: PurchaseByCategoryDetail[] | null; // Can be null if category not found
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?: number;
    last?: boolean;
    first?: boolean;
}

// --- API Functions ---
export const purchaseReportsApi = {
    fetchRejectedPOs: async (payload: DateRangePayload): Promise<RejectedPOResponse> => {
        const response = await api.post('/purchase-reports/rejected-po', payload);
        // Add basic validation as response structure differs slightly
        if (!response.data || !response.data.rejectedPODetails) {
             console.error("API Error: Invalid response structure from /purchase-reports/rejected-po", response.data);
             return { rejectedPODetails: [], pageNumber: 0, pageSize: 0, totalElements: 0, totalPages: 0, last: true, first: true };
        }
        return response.data;
    },

    fetchItemExpiries: async (payload: DateRangePayload): Promise<ItemExpiryResponse> => {
        const response = await api.post('/purchase-reports/item-expiry', payload);
        if (!response.data || !response.data.itemDetails) {
             console.error("API Error: Invalid response structure from /purchase-reports/item-expiry", response.data);
            return { itemDetails: [] };
        }
        return response.data;
    },

    fetchItemsBySupplier: async (payload: DateRangePayload): Promise<ItemsBySupplierResponse> => {
        const response = await api.post('/purchase-reports/item-by-supplier', payload);
         if (!response.data || response.data.responseCode !== '0000') {
             console.error("API Error or failed response from /purchase-reports/item-by-supplier", response.data);
            return { responseCode: response.data?.responseCode || 'ERR', description: response.data?.description || 'API Error', totalItems: 0, totalCost: 0, supplierDetails: [] };
        }
        return response.data;
    },

    fetchPurchaseByCategory: async (payload: CategoryPayload): Promise<PurchaseByCategoryResponse> => {
        const response = await api.post('/purchase-reports/by-category', payload);
        if (!response.data) {
             console.error("API Error: Invalid response structure from /purchase-reports/by-category", response.data);
             return { responseCode: 'ERR', description: 'Invalid API response', purchaseDetails: null };
        }
        if (response.data.responseCode === '1500') {
            console.warn("Category not found for name:", payload.category);
            return { ...response.data, purchaseDetails: [] }; 
        }
        return response.data;
    },
}; 