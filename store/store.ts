import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import recipeReducer from './recipeSlice';
import recipeCategoryReducer from './recipeCategorySlice';
import subRecipeReducer from './subRecipeSlice';
// import itemReducer from './itemSlice'; // Assuming this was replaced
// import categoryReducer from './categorySlice'; // Assuming this was replaced by itemCategorySlice
// import unitReducer from './unitSlice'; // Need to confirm if this exists
import supplierReducer from './supplierSlice';
import storageLocationReducer from './storageLocationSlice';
import branchReducer from './branchSlice';
import employeeReducer from './employeeSlice';
import purchaseOrderReducer from './purchaseOrderSlice';
// import inventoryReducer from './inventorySlice'; // Need to confirm if this exists
import expenseReducer from './expenseSlice';
import nonConformanceReducer from './nonConformanceSlice';
import purchaseReportsReducer from './purchaseReportsSlice';
import recipeReportsReducer from './recipeReportsSlice'; 
// Use existing slices based on previous context
import itemCategoryReducer from './itemCategorySlice';
import itemsReducer from './itemsSlice';
import employeeReportsReducer from './employeeReportsSlice';
import transferReportsReducer from './transferReportsSlice';
import otherPayrollReducer from './otherPayrollSlice';
import subRecipeCategoryReducer from './subRecipeCategorySlice';
import taxReducer from './taxSlice';
// import unitSlice if it exists and is needed
// import inventorySlice if it exists and is needed

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipe: recipeReducer,
    recipeCategory: recipeCategoryReducer,
    subRecipe: subRecipeReducer,
    // item: itemReducer, // Remove or replace
    itemCategory: itemCategoryReducer, // Use this instead of categoryReducer?
    items: itemsReducer, // Use this instead of itemReducer?
    // unit: unitReducer, // Add if exists
    supplier: supplierReducer,
    storageLocation: storageLocationReducer,
    branch: branchReducer,
    employee: employeeReducer,
    purchaseOrder: purchaseOrderReducer,
    // inventory: inventoryReducer, // Add if exists
    expense: expenseReducer,
    nonConformance: nonConformanceReducer,
    purchaseReports: purchaseReportsReducer,
    recipeReports: recipeReportsReducer,
    employeeReports: employeeReportsReducer,
    transferReports: transferReportsReducer,
    otherPayroll: otherPayrollReducer,
    subRecipeCategory: subRecipeCategoryReducer,
    tax: taxReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Consider customizing this for production
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 