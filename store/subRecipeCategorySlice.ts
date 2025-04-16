import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subRecipeCategoryApi } from './subRecipeCategoryApi';

// Async thunks
export const fetchAllCategories = createAsyncThunk(
  'subRecipeCategory/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subRecipeCategoryApi.fetchAll();
      if (response.responseCode === "0000") {
        return response;
      }
      return rejectWithValue(response.description || "Failed to fetch categories");
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addCategory = createAsyncThunk(
  'subRecipeCategory/add',
  async (categoryData: any, { rejectWithValue }) => {
    try {
      const response = await subRecipeCategoryApi.add(categoryData);
      if (response.responseCode === "0000") {
        return response;
      }
      return rejectWithValue(response.description || "Failed to add category");
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'subRecipeCategory/update',
  async (categoryData: any, { rejectWithValue }) => {
    try {
      const response = await subRecipeCategoryApi.update(categoryData);
      if (response.responseCode === "0000") {
        return response;
      }
      return rejectWithValue(response.description || "Failed to update category");
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'subRecipeCategory/delete',
  async (data: { subRecipeCategoryId: number }, { rejectWithValue }) => {
    try {
      const response = await subRecipeCategoryApi.delete(data);
      if (response.responseCode === "0000") {
        return data.subRecipeCategoryId;
      }
      return rejectWithValue(response.description || "Failed to delete category");
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState: any = {
  subRecipeCategories: [] as any[],
  loading: false,
  error: null,
};

const subRecipeCategorySlice = createSlice({
  name: 'subRecipeCategory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.subRecipeCategories = [];
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
        state.subRecipeCategories = action.payload.subRecipeCategoryList;
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
        if (action.payload.subRecipeCategory) {
          state.subRecipeCategories.push(action.payload.subRecipeCategory);
        }
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
        if (action.payload.subRecipeCategory) {
          const index = state.subRecipeCategories.findIndex(
            (cat: any) => cat.subRecipeCategoryId === action.payload.subRecipeCategory.subRecipeCategoryId
          );
          if (index !== -1) {
            state.subRecipeCategories[index] = action.payload.subRecipeCategory;
          }
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
        state.subRecipeCategories = state.subRecipeCategories.filter(
          (cat: any) => cat.subRecipeCategoryId !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete category';
      });
  },
});

export const { clearError, resetState } = subRecipeCategorySlice.actions;
export default subRecipeCategorySlice.reducer; 