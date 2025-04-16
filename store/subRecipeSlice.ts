import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addSubRecipe, getAllSubRecipes, updateSubRecipe } from './subRecipeApi';
import { RootState } from './store';

// Async Thunks
export const createSubRecipe = createAsyncThunk(
  'subRecipe/create',
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await addSubRecipe(formData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const fetchSubRecipes = createAsyncThunk(
  'subRecipe/fetchAll',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getAllSubRecipes(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const updateSubRecipeThunk = createAsyncThunk(
  'subRecipe/update',
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await updateSubRecipe(formData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// Initial state
const initialState = {
  subRecipes: [] as any[],
  currentSubRecipe: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    page: 0,
    size: 10,
    total: 0
  }
};

// Slice
const subRecipeSlice = createSlice({
  name: 'subRecipe',
  initialState,
  reducers: {
    setCurrentSubRecipe: (state, action) => {
      state.currentSubRecipe = action.payload;
    },
    clearCurrentSubRecipe: (state) => {
      state.currentSubRecipe = null;
    },
    clearSubRecipes: (state) => {
      state.subRecipes = [];
    }
  },
  extraReducers: (builder) => {
    // Create subRecipe
    builder
      .addCase(createSubRecipe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createSubRecipe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle successful subRecipe creation - response format might vary
        if (action.payload && action.payload.responseCode === "0000") {
          // Add the new subRecipe to state if needed
          if (action.payload.subRecipe) {
            state.subRecipes.push(action.payload.subRecipe);
          }
        }
      })
      .addCase(createSubRecipe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as any;
      })

    // Fetch subRecipes
      .addCase(fetchSubRecipes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSubRecipes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.responseCode === "0000") {
          state.subRecipes = action.payload.subRecipeList || [];
          state.pagination = {
            page: action.payload.pageNumber,
            size: action.payload.pageSize,
            total: action.payload.totalElements
          };
        } else {
          state.error = action.payload?.description || "Unknown error";
        }
      })
      .addCase(fetchSubRecipes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as any;
      })

    // Update subRecipe
      .addCase(updateSubRecipeThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateSubRecipeThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.responseCode === "0000" && action.payload.subRecipe) {
          // Find and update the subRecipe in the list if it exists
          const index = state.subRecipes.findIndex(
            (subRecipe: any) => subRecipe.id === action.payload.subRecipe.id
          );
          if (index !== -1) {
            state.subRecipes[index] = action.payload.subRecipe;
          }
        }
      })
      .addCase(updateSubRecipeThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as any;
      });
  },
});

// Actions
export const { setCurrentSubRecipe, clearCurrentSubRecipe, clearSubRecipes } = subRecipeSlice.actions;

// Selectors
export const selectAllSubRecipes = (state: RootState) => state.subRecipe.subRecipes;
export const selectCurrentSubRecipe = (state: RootState) => state.subRecipe.currentSubRecipe;
export const selectSubRecipeStatus = (state: RootState) => state.subRecipe.status;
export const selectSubRecipeError = (state: RootState) => state.subRecipe.error;
export const selectSubRecipePagination = (state: RootState) => state.subRecipe.pagination;

export default subRecipeSlice.reducer; 