import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addRecipe, getAllRecipes, updateRecipe } from './recipeApi';
import { RootState } from './store';

// Async Thunks
export const createRecipe = createAsyncThunk(
  'recipes/createRecipe',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // Pass the FormData directly without modifying it
      const response = await addRecipe(formData);
      return response;
    } catch (error: any) {
      console.error('Error in createRecipe thunk:', error);
      return rejectWithValue(error);
    }
  }
);

export const fetchRecipes = createAsyncThunk(
  'recipe/fetchAll',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getAllRecipes(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const updateRecipeThunk = createAsyncThunk(
  'recipe/update',
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await updateRecipe(formData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// Initial state
const initialState = {
  recipes: [] as any[],
  currentRecipe: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    page: 0,
    size: 10,
    total: 0
  }
};

// Slice
const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setCurrentRecipe: (state, action) => {
      state.currentRecipe = action.payload;
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    },
    clearRecipes: (state) => {
      state.recipes = [];
    }
  },
  extraReducers: (builder) => {
    // Create Recipe
    builder
      .addCase(createRecipe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle successful recipe creation - response format might vary
        if (action.payload && action.payload.responseCode === "0000") {
          // Add the new recipe to state if needed
        }
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as any;
      })

    // Fetch Recipes
      .addCase(fetchRecipes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.responseCode === "0000") {
          state.recipes = action.payload.recipeList || [];
          state.pagination = {
            page: action.payload.pageNumber,
            size: action.payload.pageSize,
            total: action.payload.totalElements
          };
        } else {
          state.error = action.payload?.description || "Unknown error";
        }
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as any;
      })

    // Update Recipe
      .addCase(updateRecipeThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateRecipeThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.responseCode === "0000" && action.payload.recipe) {
          // Find and update the recipe in the list if it exists
          const index = state.recipes.findIndex(
            (recipe: any) => recipe.id === action.payload.recipe.id
          );
          if (index !== -1) {
            state.recipes[index] = action.payload.recipe;
          }
        }
      })
      .addCase(updateRecipeThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as any;
      });
  },
});

// Actions
export const { setCurrentRecipe, clearCurrentRecipe, clearRecipes } = recipeSlice.actions;

// Selectors
export const selectAllRecipes = (state: RootState) => state.recipe.recipes;
export const selectCurrentRecipe = (state: RootState) => state.recipe.currentRecipe;
export const selectRecipeStatus = (state: RootState) => state.recipe.status;
export const selectRecipeError = (state: RootState) => state.recipe.error;
export const selectRecipePagination = (state: RootState) => state.recipe.pagination;

export default recipeSlice.reducer; 