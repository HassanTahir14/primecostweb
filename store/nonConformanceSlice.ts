import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { nonConformanceApi } from './nonConformanceApi';

// Re-define DTO based on the /all response for clarity
export interface NonConformanceReport {
    orderNo: number;
    ncrNo?: number;
    date: string;
    supplierId: number;
    supplierName: string;
    supplierEmail: string;
    branchName: string;
    branchAddress: string;
    branchId: number;
    itemId?: number;
    itemName?: string;
    description: string; 
    salesContactNumber?: string;
    position?: string;
    inspector?: string;
    nonConformanceDescription: string;
    correctiveAction: string;
    preparedBy?: string;
    approvedBy?: string;
    approvedStatus?: string;
    impactOnDeliverySchedule?: string;
    reportStatus?: string;
    dateCloseOut?: string;
    reportDate?: string;
    updatedAt?: string;
}

// Define payload for adding a report (matches API)
interface AddNonConformancePayload {
    orderNo: number;
    date: string;
    supplierId: number;
    branchId: number;
    description: string; 
    nonConformanceDescription: string;
    correctiveAction: string;
    impactOnDeliverySchedule: string;
    dateCloseOut: string;
}

interface NonConformanceState {
  reports: NonConformanceReport[];
  loading: boolean;
  error: string | null | any; // Can store structured errors
}

const initialState: NonConformanceState = {
  reports: [],
  loading: false,
  error: null,
};

// Thunk for fetching all reports
export const fetchAllNonConformanceReports = createAsyncThunk<
  NonConformanceReport[],
  void,
  { rejectValue: any }
>(
  'nonConformance/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await nonConformanceApi.fetchAll();
      // Check for API-level error response code
      if (response.responseCode !== '0000') {
          return rejectWithValue(response.description || 'Failed to fetch reports');
      }
      return response.nonConformanceReports || []; // Ensure it returns an array
    } catch (error: any) {
      console.error('Fetch Non Conformance Error:', error);
      return rejectWithValue(error.response?.data || error.message || 'An unexpected error occurred');
    }
  }
);

// Thunk for adding a new report
export const addNonConformanceReport = createAsyncThunk<
  any, // Define a specific success type if needed, e.g., the created report
  AddNonConformancePayload,
  { rejectValue: any }
>(
  'nonConformance/add',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await nonConformanceApi.add(reportData);
      // Check for API-level error response code
      if (response.responseCode !== '0000') {
        return rejectWithValue(response.description || 'Failed to add report');
      }
      return response; // Return the success response (or created object if API provides it)
    } catch (error: any) {
      console.error('Add Non Conformance Error:', error);
      return rejectWithValue(error.response?.data || error.message || 'An unexpected error occurred');
    }
  }
);

// Slice Definition
const nonConformanceSlice = createSlice({
  name: 'nonConformance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.reports = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Reports
    builder
      .addCase(fetchAllNonConformanceReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNonConformanceReports.fulfilled, (state, action: PayloadAction<NonConformanceReport[]>) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchAllNonConformanceReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Report
    builder
      .addCase(addNonConformanceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNonConformanceReport.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally add the new report to state if the API returns it
        // Or trigger a refetch of the list
        console.log('Add Report Success:', action.payload);
      })
      .addCase(addNonConformanceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetState } = nonConformanceSlice.actions;
export default nonConformanceSlice.reducer; 