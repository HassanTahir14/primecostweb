import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import recipeReducer from './recipeSlice';
import recipeCategoryReducer from './recipeCategorySlice';
import subRecipeReducer from './subRecipeSlice';
import subRecipeCategoryReducer from './subRecipeCategorySlice';
import servingSizeReducer from './servingSizeSlice';
import taxReducer from './taxSlice';
import supplierReducer from './supplierSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipe: recipeReducer,
    recipeCategory: recipeCategoryReducer,
    subRecipe: subRecipeReducer,
    subRecipeCategory: subRecipeCategoryReducer,
    servingSize: servingSizeReducer,
    tax: taxReducer,
    supplier: supplierReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 