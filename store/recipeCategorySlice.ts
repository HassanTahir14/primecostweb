import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { recipeCategoryApi } from './recipeCategoryApi';

// Async thunks
export const fetchAllCategories = createAsyncThunk(
  'recipeCategory/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await recipeCategoryApi.fetchAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addCategory = createAsyncThunk(
  'recipeCategory/add',
  async (categoryData: any, { rejectWithValue }) => {
    try {
      return await recipeCategoryApi.add(categoryData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'recipeCategory/update',
  async (categoryData: any, { rejectWithValue }) => {
    try {
      return await recipeCategoryApi.update(categoryData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'recipeCategory/delete',
  async (categoryId: any, { rejectWithValue }) => {
    try {
      await recipeCategoryApi.delete(categoryId);
      return categoryId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState: any = {
  categories: [] as any[],
  loading: false,
  error: null,
};

const recipeCategorySlice = createSlice({
  name: 'recipeCategory',
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
        state.categories = action.payload.recipeCategoryList;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch categories';
      })

    // Add category
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add category';
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
          (cat: any) => cat.categoryId === action.payload.categoryId
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update category';
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
          (cat: any) => cat.categoryId !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete category';
      });
  },
});

export const { clearError, resetState } = recipeCategorySlice.actions;
export default recipeCategorySlice.reducer; 