import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { otherPayrollApi } from './otherPayrollApi';

// Re-define or import the interface for a single item
// Adjust based on your actual API response
export interface OtherPayrollItem {
  id: number;
  employeeId: number;
  employeeName: string;
  payrollType: string;
  amount: number;
  date: string;
  description?: string;
}

interface OtherPayrollState {
  payrolls: OtherPayrollItem[];
  loading: boolean;
  error: string | null | any;
}

// Fetch Thunk
export const fetchOtherPayrolls = createAsyncThunk<
  OtherPayrollItem[], // Return type: array of items
  void, // Argument type (void if no args)
  { rejectValue: any } // Type for rejected action payload
>(
  'otherPayroll/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await otherPayrollApi.fetchAll();
      // Assuming the list is nested under 'otherPayrolls' based on ApiRespone interface
      // Adjust if the API returns the array directly or under a different key
      if (response && response.responseCode === '0000') {
          return response.otherPayrolls || [];
      } else {
          return rejectWithValue(response?.description || 'Failed to fetch other payrolls');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'An unexpected error occurred');
    }
  }
);

// --- Initial State ---
const initialState: OtherPayrollState = {
  payrolls: [],
  loading: false,
  error: null,
};

// --- Slice Definition ---
const otherPayrollSlice = createSlice({
  name: 'otherPayroll',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.payrolls = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchOtherPayrolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOtherPayrolls.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload; // Expecting the array directly now
      })
      .addCase(fetchOtherPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    // Add cases for other actions (add, update, delete) if created
  },
});

export const { clearError, resetState } = otherPayrollSlice.actions;
export default otherPayrollSlice.reducer; 