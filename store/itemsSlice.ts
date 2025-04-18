import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { itemsApi } from './itemsApi';

// Define the structure of an Item based on the API response
interface ItemImage {
  imageId: number;
  path: string;
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
  secondaryUnitId: number;
  secondaryUnitValue: number;
  countryOrigin: string;
  purchaseCostWithoutVat: number;
  purchaseCostWithVat: number;
  images: ItemImage[];
  // Add other relevant fields from the response
}

// Define the structure for pagination info
interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// Define the state structure for items
interface ItemsState {
  items: Item[];
  pagination: PaginationInfo | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | any; // Allow any type for error flexibility
  currentAction: 'add' | 'update' | 'delete' | 'fetch' | 'idle';
}

// Initial state
const initialState: ItemsState = {
  items: [],
  pagination: null,
  status: 'idle',
  error: null,
  currentAction: 'idle',
};

// Define types for API parameters
interface FetchItemsParams {
  page?: number;
  size?: number;
  direction?: 'asc' | 'desc';
  searchQuery?: string;
  sortBy?: string;
}

interface AddItemParams {
  itemData: any; // Use a more specific type if possible
  images: File[];
}

interface UpdateItemParams {
  itemData: any; // Use a more specific type, ensure itemId is present
  images: File[];
}

// Async thunks for CRUD operations
export const fetchAllItems = createAsyncThunk(
  'items/fetchAll',
  async (params: FetchItemsParams = {}, { rejectWithValue }) => {
    try {
      const response = await itemsApi.fetchAll(params);
      // Assuming response structure: { itemList: [], pageNumber: 0, ... }
      return response; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch items');
    }
  }
);

export const addItem = createAsyncThunk(
  'items/add',
  async ({ itemData, images }: AddItemParams, { dispatch, rejectWithValue }) => {
    try {
      const response = await itemsApi.add(itemData, images);
      // Optionally dispatch fetchAllItems to refresh the list after adding
      // Consider fetching the specific page the user is on
      // dispatch(fetchAllItems({ page: 0, size: 10 })); // Example refresh
      return response; // Contains success message etc.
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to add item');
    }
  }
);

export const updateItem = createAsyncThunk(
  'items/update',
  async ({ itemData, images }: UpdateItemParams, { dispatch, rejectWithValue }) => {
    try {
      const response = await itemsApi.update(itemData, images);
       // Optionally dispatch fetchAllItems to refresh the list after updating
      // Consider fetching the specific page the user is on
      // dispatch(fetchAllItems({ page: itemData.currentPage, size: 10 })); // Example refresh
      return response; // Contains success message etc.
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to update item');
    }
  }
);

export const deleteItem = createAsyncThunk(
  'items/delete',
  async (itemId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await itemsApi.delete(itemId);
      // Return itemId along with the success response for local state update or confirmation
      return { itemId, response }; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to delete item');
    }
  }
);

// Items slice
const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetItemsState: (state) => {
      Object.assign(state, initialState);
    },
    resetCurrentAction: (state) => {
      state.currentAction = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Items
      .addCase(fetchAllItems.pending, (state) => {
        state.status = 'loading';
        state.currentAction = 'fetch';
        state.error = null;
      })
      .addCase(fetchAllItems.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.currentAction = 'idle';
        state.items = action.payload.itemList;
        state.pagination = {
          pageNumber: action.payload.pageNumber,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          last: action.payload.last,
          first: action.payload.first,
        };
      })
      .addCase(fetchAllItems.rejected, (state, action) => {
        state.status = 'failed';
        state.currentAction = 'idle';
        state.error = action.payload;
      })

      // Add Item
      .addCase(addItem.pending, (state) => {
        state.status = 'loading';
        state.currentAction = 'add';
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(addItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update Item
      .addCase(updateItem.pending, (state) => {
        state.status = 'loading';
        state.currentAction = 'update';
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete Item
      .addCase(deleteItem.pending, (state) => {
        state.status = 'loading';
        state.currentAction = 'delete';
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.itemId !== action.payload.itemId);
        if (state.pagination) {
            state.pagination.totalElements -= 1;
        }
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearError, resetItemsState, resetCurrentAction } = itemsSlice.actions;
export default itemsSlice.reducer;

// Selectors
export const selectAllItems = (state: { items: ItemsState }) => state.items.items;
export const selectItemsPagination = (state: { items: ItemsState }) => state.items.pagination;
export const selectItemsStatus = (state: { items: ItemsState }) => state.items.status;
export const selectItemsError = (state: { items: ItemsState }) => state.items.error;
export const selectItemsCurrentAction = (state: { items: ItemsState }) => state.items.currentAction; 