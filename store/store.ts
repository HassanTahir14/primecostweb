import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import recipeReducer from './recipeSlice';
import recipeCategoryReducer from './recipeCategorySlice';
import subRecipeReducer from './subRecipeSlice';
import subRecipeCategoryReducer from './subRecipeCategorySlice';
import servingSizeReducer from './servingSizeSlice';
import taxReducer from './taxSlice';
import supplierReducer from './supplierSlice';
import storageLocationReducer from './storageLocationSlice';
import branchReducer from './branchSlice';
import employeeReducer from './employeeSlice';
import purchaseOrderReducer from './purchaseOrderSlice';
import itemCategoryReducer from './itemCategorySlice';
import itemsReducer from './itemsSlice';
import otherPayrollReducer from './otherPayrollSlice';
import expenseReducer from './expenseSlice';

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
    storageLocation: storageLocationReducer,
    branch: branchReducer,
    employee: employeeReducer,
    purchaseOrder: purchaseOrderReducer,
    itemCategory: itemCategoryReducer,
    items: itemsReducer,
    otherPayroll: otherPayrollReducer,
    expense: expenseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 