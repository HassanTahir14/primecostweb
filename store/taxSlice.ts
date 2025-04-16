import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taxApi } from './taxApi';

interface Tax {
  taxId: number;
  taxCode: string;
  taxName: string;
  taxRate: number;
  taxGroup: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TaxState {
  taxes: Tax[];
  loading: boolean;
  error: string | null;
}

// Async thunks
export const fetchAllTaxes = createAsyncThunk(
  'tax/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await taxApi.fetchAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addTax = createAsyncThunk(
  'tax/add',
  async (taxData: Omit<Tax, 'taxId'>, { rejectWithValue }) => {
    try {
      return await taxApi.add(taxData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTax = createAsyncThunk(
  'tax/update',
  async (taxData: Tax, { rejectWithValue }) => {
    try {
      return await taxApi.update(taxData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTax = createAsyncThunk(
  'tax/delete',
  async (taxId: number, { rejectWithValue }) => {
    try {
      await taxApi.delete(taxId);
      return taxId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState: TaxState = {
  taxes: [],
  loading: false,
  error: null,
};

const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.taxes = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all taxes
    builder
      .addCase(fetchAllTaxes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTaxes.fulfilled, (state, action) => {
        state.loading = false;
        state.taxes = action.payload.taxList;
      })
      .addCase(fetchAllTaxes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch taxes';
      })

    // Add tax
    builder
      .addCase(addTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTax.fulfilled, (state, action) => {
        state.loading = false;
        state.taxes.push(action.payload);
      })
      .addCase(addTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add tax';
      })

    // Update tax
    builder
      .addCase(updateTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTax.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.taxes.findIndex(
          (tax) => tax.taxId === action.payload.taxId
        );
        if (index !== -1) {
          state.taxes[index] = action.payload;
        }
      })
      .addCase(updateTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update tax';
      })

    // Delete tax
    builder
      .addCase(deleteTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTax.fulfilled, (state, action) => {
        state.loading = false;
        state.taxes = state.taxes.filter(
          (tax) => tax.taxId !== action.payload
        );
      })
      .addCase(deleteTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete tax';
      });
  },
});

export const { clearError, resetState } = taxSlice.actions;
export default taxSlice.reducer; 