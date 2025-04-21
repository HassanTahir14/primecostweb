import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { purchaseOrderApi } from './purchaseOrderApi';

// Interface based on GET /purchase-order/purchase-orders response
export interface PurchaseOrder {
  id: number; // Changed to number based on API response
  quantity: number;
  unitId: number;
  unitName: string;
  itemCode: string;
  categoryId: number;
  categoryName: string;
  purchaseCost: number;
  supplierId: number;
  supplierName: string;
  vatPercentage: number;
  vatAmount: number;
  datedFOrder: string; // ISO date string
  datedFDelivery: string; // ISO date string
  updatedAt: string; // ISO date string
  tokenStatus: string;
  purchaseOrderStatus: string;
  itemName: string;
  isPrimaryUnitSelected?: boolean; // Added for receive payload
  isSecondaryUnitSelected?: boolean; // Added for receive payload
  // Add other fields if necessary based on full API spec
}

// Interface for the state
interface PurchaseOrderState {
  orders: PurchaseOrder[];
  loading: boolean;
  error: any | null;
  // Add pagination state if needed
  // currentPage: number;
  // totalPages: number;
  // totalElements: number;
}

const initialState: PurchaseOrderState = {
  orders: [],
  loading: false,
  error: null,
  // currentPage: 0,
  // totalPages: 0,
  // totalElements: 0,
};

// Async Thunks
export const fetchAllPurchaseOrders = createAsyncThunk(
  'purchaseOrder/fetchAll',
  // Accept pagination/sorting params
  async (params: { page: number; size: number; sortBy: string; direction: string }, { rejectWithValue }) => {
    try {
      const data = await purchaseOrderApi.fetchAll(params);
      return data; // API function returns { orders: [], ... }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addPurchaseOrder = createAsyncThunk(
  'purchaseOrder/add',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await purchaseOrderApi.add(orderData);
      if (response && response.responseCode === '0000') {
        // Potentially return the created order if API provides it
        return response; // Return success response for now
      } else {
        return rejectWithValue(response?.description || 'Failed to add purchase order');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePurchaseOrder = createAsyncThunk(
  'purchaseOrder/update',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await purchaseOrderApi.update(orderData);
      if (response && response.responseCode === '0000') {
        // Return updated order data for potential optimistic update
        // Need to know what the actual API response for update contains
        return orderData; // Return the data sent for update
      } else {
        return rejectWithValue(response?.description || 'Failed to update purchase order');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Receive Purchase Order Thunk ---
interface ReceiveOrderPayload {
  purchaseId: number;
  expiryDate?: string; // Optional based on modal form
  dateOfDelivery: string;
  quantity: number;
  unit: number; // unitId from the original order
  isPrimaryUnitSelected: boolean;
  isSecondaryUnitSelected: boolean;
  storageLocationId: number;
  branchId: number;
}

export const receivePurchaseOrder = createAsyncThunk(
  'purchaseOrder/receive',
  async (payload: ReceiveOrderPayload, { rejectWithValue }) => {
    try {
      const response = await purchaseOrderApi.receive(payload); // Assuming receive method exists in purchaseOrderApi
      if (response && response.responseCode === '0000') {
        return { purchaseId: payload.purchaseId, ...response }; // Return ID and response for potential state update
      } else {
        return rejectWithValue(response?.description || 'Failed to receive purchase order');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Optional: Delete Thunk
// export const deletePurchaseOrder = createAsyncThunk(...);

const purchaseOrderSlice = createSlice({
  name: 'purchaseOrder',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.orders = [];
      state.loading = false;
      state.error = null;
      // Reset pagination state if used
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchAllPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        // Update pagination state if returned
        // state.totalElements = action.payload.totalElements;
        // state.totalPages = action.payload.totalPages;
        // state.currentPage = action.payload.currentPage; // Assuming API returns current page
      })
      .addCase(fetchAllPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Purchase Order
    builder
      .addCase(addPurchaseOrder.pending, (state) => {
        state.loading = true; // Indicate loading state for the add operation
        state.error = null;
      })
      .addCase(addPurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Ideally, add the new order if returned by API, otherwise refetch might be needed
        console.log('Add purchase order success:', action.payload);
      })
      .addCase(addPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Purchase Order
    builder
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id // Ensure payload has the id
        );
        if (index !== -1) {
          // Optimistically update the order in the list
          // This assumes action.payload contains the updated order fields
          state.orders[index] = { ...state.orders[index], ...action.payload };
        }
        console.log('Update purchase order success:', action.payload);
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
    // --- Handle Receive Purchase Order ---
    builder
      .addCase(receivePurchaseOrder.pending, (state) => {
        state.loading = true; // Or a specific loading state like state.receiving = true;
        state.error = null;
      })
      .addCase(receivePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Update the status of the received order
        const index = state.orders.findIndex((order) => order.id === action.payload.purchaseId);
        if (index !== -1) {
          // Update status or other relevant fields based on API response
          // Example: Assuming API confirms receipt and changes status
          state.orders[index].purchaseOrderStatus = 'RECEIVED'; // Or whatever the status should be
        }
        console.log('Receive purchase order success:', action.payload);
      })
      .addCase(receivePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Optional: Handle Delete cases
  },
});

export const { clearError, resetState } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer; 