import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    purchaseReportsApi,
    RejectedPODetail,
    ItemExpiryDetail,
    ItemsBySupplierDetail,
    PurchaseByCategoryDetail
} from './purchaseReportsApi';

// --- State Structure for each report type ---
interface ReportState<T> {
    data: T[];
    loading: boolean;
    error: any | null;
}

interface PaginatedReportState<T> extends ReportState<T> {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}

interface ItemsBySupplierState extends ReportState<ItemsBySupplierDetail> {
    totalItems: number;
    totalCost: number;
}

// --- Overall Slice State ---
interface PurchaseReportsState {
    rejectedPOs: PaginatedReportState<RejectedPODetail>;
    itemExpiries: ReportState<ItemExpiryDetail>;
    itemsBySupplier: ItemsBySupplierState;
    purchaseByCategory: PaginatedReportState<PurchaseByCategoryDetail>;
    // Potentially store common filters like date range here if needed across reports
    // startDate: string | null;
    // endDate: string | null;
}

// --- Initial State ---
const initialPaginationState = {
    pageNumber: 0,
    pageSize: 0,
    totalElements: 0,
    totalPages: 0,
    last: true,
    first: true,
};

const initialState: PurchaseReportsState = {
    rejectedPOs: { data: [], loading: false, error: null, ...initialPaginationState },
    itemExpiries: { data: [], loading: false, error: null },
    itemsBySupplier: { data: [], loading: false, error: null, totalItems: 0, totalCost: 0 },
    purchaseByCategory: { data: [], loading: false, error: null, ...initialPaginationState },
};

// --- Async Thunks ---

// Fetch Rejected POs
export const fetchRejectedPOs = createAsyncThunk(
    'purchaseReports/fetchRejectedPOs',
    async (payload: { startDate: string; endDate: string, size: number }, { rejectWithValue }) => {
        try {
            const response = await purchaseReportsApi.fetchRejectedPOs(payload);
            return response; // Contains rejectedPODetails and pagination
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch Item Expiries
export const fetchItemExpiries = createAsyncThunk(
    'purchaseReports/fetchItemExpiries',
    async (payload: { startDate: string; endDate: string, size: number }, { rejectWithValue }) => {
        try {
            const response = await purchaseReportsApi.fetchItemExpiries(payload);
            return response.itemDetails; // Return just the data array
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch Items by Supplier
export const fetchItemsBySupplier = createAsyncThunk(
    'purchaseReports/fetchItemsBySupplier',
    async (payload: { startDate: string; endDate: string, size: number}, { rejectWithValue }) => {
        try {
            const response = await purchaseReportsApi.fetchItemsBySupplier(payload);
             if (response.responseCode !== '0000') {
                return rejectWithValue(response.description || 'Failed to fetch items by supplier');
            }
            return response; // Contains supplierDetails, totalItems, totalCost
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch Purchase by Category
export const fetchPurchaseByCategory = createAsyncThunk(
    'purchaseReports/fetchPurchaseByCategory',
    async (payload: { category: string; startDate: string; endDate: string, size: number }, { rejectWithValue }) => {
        try {
            const response = await purchaseReportsApi.fetchPurchaseByCategory(payload);
            if (response.responseCode !== '0000') {
                return rejectWithValue(response.description || 'Failed to fetch purchase by category');
            }
            return response; // Contains purchaseDetails and potential pagination
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// --- Slice Definition ---
const purchaseReportsSlice = createSlice({
    name: 'purchaseReports',
    initialState,
    reducers: {
        // Reducer to clear a specific report's error or all errors
        clearReportError: (state, action: PayloadAction<keyof PurchaseReportsState>) => {
            if (state[action.payload]) {
                state[action.payload].error = null;
            }
        },
        clearAllReportErrors: (state) => {
            Object.keys(state).forEach(key => {
                if (state[key as keyof PurchaseReportsState]?.error !== undefined) {
                    state[key as keyof PurchaseReportsState].error = null;
                }
            });
        },
        // Could add reducers to set date filters if managed here
    },
    extraReducers: (builder) => {
        // Rejected POs
        builder
            .addCase(fetchRejectedPOs.pending, (state) => {
                state.rejectedPOs.loading = true;
                state.rejectedPOs.error = null;
            })
            .addCase(fetchRejectedPOs.fulfilled, (state, action) => {
                state.rejectedPOs.loading = false;
                state.rejectedPOs.data = action.payload.rejectedPODetails;
                state.rejectedPOs.pageNumber = action.payload.pageNumber;
                state.rejectedPOs.pageSize = action.payload.pageSize;
                state.rejectedPOs.totalElements = action.payload.totalElements;
                state.rejectedPOs.totalPages = action.payload.totalPages;
                state.rejectedPOs.last = action.payload.last;
                state.rejectedPOs.first = action.payload.first;
            })
            .addCase(fetchRejectedPOs.rejected, (state, action) => {
                state.rejectedPOs.loading = false;
                state.rejectedPOs.error = action.payload;
            });

        // Item Expiries
        builder
            .addCase(fetchItemExpiries.pending, (state) => {
                state.itemExpiries.loading = true;
                state.itemExpiries.error = null;
            })
            .addCase(fetchItemExpiries.fulfilled, (state, action) => {
                state.itemExpiries.loading = false;
                state.itemExpiries.data = action.payload;
            })
            .addCase(fetchItemExpiries.rejected, (state, action) => {
                state.itemExpiries.loading = false;
                state.itemExpiries.error = action.payload;
            });

        // Items by Supplier
        builder
            .addCase(fetchItemsBySupplier.pending, (state) => {
                state.itemsBySupplier.loading = true;
                state.itemsBySupplier.error = null;
            })
            .addCase(fetchItemsBySupplier.fulfilled, (state, action) => {
                state.itemsBySupplier.loading = false;
                state.itemsBySupplier.data = action.payload.supplierDetails;
                state.itemsBySupplier.totalItems = action.payload.totalItems;
                state.itemsBySupplier.totalCost = action.payload.totalCost;
            })
            .addCase(fetchItemsBySupplier.rejected, (state, action) => {
                state.itemsBySupplier.loading = false;
                state.itemsBySupplier.error = action.payload;
            });

        // Purchase by Category
        builder
            .addCase(fetchPurchaseByCategory.pending, (state) => {
                state.purchaseByCategory.loading = true;
                state.purchaseByCategory.error = null;
            })
            .addCase(fetchPurchaseByCategory.fulfilled, (state, action) => {
                state.purchaseByCategory.loading = false;
                state.purchaseByCategory.data = action.payload.purchaseDetails || []; // Handle null case
                state.purchaseByCategory.pageNumber = action.payload.pageNumber ?? 0;
                state.purchaseByCategory.pageSize = action.payload.pageSize ?? 0;
                state.purchaseByCategory.totalElements = action.payload.totalElements ?? 0;
                state.purchaseByCategory.totalPages = action.payload.totalPages ?? 0;
                state.purchaseByCategory.last = action.payload.last ?? true;
                state.purchaseByCategory.first = action.payload.first ?? true;
            })
            .addCase(fetchPurchaseByCategory.rejected, (state, action) => {
                state.purchaseByCategory.loading = false;
                state.purchaseByCategory.error = action.payload;
            });
    },
});

export const { clearReportError, clearAllReportErrors } = purchaseReportsSlice.actions;
export default purchaseReportsSlice.reducer; 