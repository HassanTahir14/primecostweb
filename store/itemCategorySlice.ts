import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { itemCategoryApi } from './itemCategoryApi';
import { RootState } from './store';

// Types
export interface ItemCategory {
  categoryId: number;
  name: string;
}

interface ItemCategoryState {
  categories: ItemCategory[];
  loading: boolean;
  error: string | null | any;
}

// Async thunks
export const fetchAllCategories = createAsyncThunk(
  'itemCategory/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await itemCategoryApi.fetchAll();
      // Assuming the API returns { responseCode: string, description: string, itemCategoryList: ItemCategory[] }
      if (response.responseCode === '0000') {
        return response.itemCategoryList;
      } else {
        return rejectWithValue(response.description || 'Failed to fetch categories');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'An unknown error occurred');
    }
  }
);

export const addCategory = createAsyncThunk(
  'itemCategory/add',
  async (categoryData: { name: string }, { rejectWithValue }) => {
    try {
      const response = await itemCategoryApi.add(categoryData);
      // Assuming the API returns { responseCode: string, description: string, /* potentially the new category */ }
      if (response.responseCode === '0000') {
        // We might need to re-fetch or expect the category in the response
        // For now, let's return the success message and handle state update potentially by re-fetching
        return { ...categoryData, message: response.description }; // Return input data + message
      } else {
        return rejectWithValue(response.description || 'Failed to add category');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'An unknown error occurred');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'itemCategory/update',
  async (categoryData: { categoryId: number; name: string }, { rejectWithValue }) => {
    try {
      const response = await itemCategoryApi.update(categoryData);
      // Assuming the API returns { responseCode: string, description: string }
      if (response.responseCode === '0000') {
        return { ...categoryData, message: response.description }; // Return input data + message
      } else {
        return rejectWithValue(response.description || 'Failed to update category');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'An unknown error occurred');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'itemCategory/delete',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      const response = await itemCategoryApi.delete(categoryId);
       // Assuming the API returns { responseCode: string, description: string }
      if (response.responseCode === '0000') {
        return { categoryId, message: response.description }; // Return ID for removal + message
      } else {
        return rejectWithValue(response.description || 'Failed to delete category');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'An unknown error occurred');
    }
  }
);

const initialState: ItemCategoryState = {
  categories: [],
  loading: false,
  error: null,
};

const itemCategorySlice = createSlice({
  name: 'itemCategory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.categories = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all categories
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Add category
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        // In a real app, you might get the full category object back
        // Or you might need to trigger a re-fetch.
        // For now, we don't update the state directly on add.
        // Let's assume fetchAllCategories will be called again.
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (cat) => cat.categoryId === action.payload.categoryId
        );
        if (index !== -1) {
          state.categories[index].name = action.payload.name;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (cat) => cat.categoryId !== action.payload.categoryId
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, resetState } = itemCategorySlice.actions;

// Selectors
export const selectAllCategories = (state: RootState) => state.itemCategory.categories;
export const selectCategoryStatus = (state: RootState) => state.itemCategory.loading;
export const selectCategoryError = (state: RootState) => state.itemCategory.error;

export default itemCategorySlice.reducer; 