import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import recipeReducer from './recipeSlice';
import recipeCategoryReducer from './recipeCategorySlice';
import subRecipeReducer from './subRecipeSlice';
import subRecipeCategoryReducer from './subRecipeCategorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipe: recipeReducer,
    recipeCategory: recipeCategoryReducer,
    subRecipe: subRecipeReducer,
    subRecipeCategory: subRecipeCategoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 