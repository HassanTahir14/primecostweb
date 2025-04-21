import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { expenseApi } from './expenseApi';

// Re-define or import the payload interface
// Adjust based on your actual API requirements
interface AddExpensePayload {
  employeeId: number;
  expenseType: string;
  amount: number;
  expenseDate: string;
  description?: string;
}

interface ExpenseState {
  loading: boolean;
  error: string | null | any;
  // Add an expenses array here if you need to fetch/display them:
  // expenses: any[]; 
}

// Add Expense Thunk
export const addExpense = createAsyncThunk<
  any, // Return type (can be the success response or specific data)
  AddExpensePayload,
  { rejectValue: any } 
>(
  'expense/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await expenseApi.addExpense(payload);
      // Return response data on success
      return response;
    } catch (error: any) {
      // Use error message from API or generic message
      return rejectWithValue(error.message || 'Failed to add expense');
    }
  }
);

// --- Initial State ---
const initialState: ExpenseState = {
  loading: false,
  error: null,
  // expenses: [], // Initialize if needed
};

// --- Slice Definition ---
const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      // state.expenses = []; // Reset if needed
    },
  },
  extraReducers: (builder) => {
    // Add Expense
    builder
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update state if needed (e.g., add to expenses array)
        console.log('Add expense success:', action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
    // Add fetchAll reducers etc. if needed later
  },
});

export const { clearError, resetState } = expenseSlice.actions;
export default expenseSlice.reducer; 