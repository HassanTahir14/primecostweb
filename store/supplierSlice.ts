import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supplierApi, type Supplier, type SupplierData } from './supplierApi';

interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

// Async thunks
export const fetchAllSuppliers = createAsyncThunk(
  'supplier/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await supplierApi.fetchAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addSupplier = createAsyncThunk(
  'supplier/add',
  async (supplierData: SupplierData, { rejectWithValue }) => {
    try {
      return await supplierApi.add(supplierData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'supplier/update',
  async (supplierData: Supplier, { rejectWithValue }) => {
    try {
      return await supplierApi.update(supplierData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'supplier/delete',
  async (supplierId: number, { rejectWithValue }) => {
    try {
      await supplierApi.delete(supplierId);
      return supplierId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState: SupplierState = {
  suppliers: [],
  loading: false,
  error: null,
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.suppliers = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all suppliers
    builder
      .addCase(fetchAllSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload.supplier;
      })
      .addCase(fetchAllSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch suppliers';
      })

    // Add supplier
    builder
      .addCase(addSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push(action.payload);
      })
      .addCase(addSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add supplier';
      })

    // Update supplier
    builder
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.suppliers.findIndex(
          (supplier) => supplier.supplierId === action.payload.supplierId
        );
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update supplier';
      })

    // Delete supplier
    builder
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter(
          (supplier) => supplier.supplierId !== action.payload
        );
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete supplier';
      });
  },
});

export const { clearError, resetState } = supplierSlice.actions;
export default supplierSlice.reducer; 