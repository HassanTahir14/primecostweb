import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { servingSizeApi } from './servingSizeApi';
import { RootState } from './store';

// Types
interface ServingSize {
  servingSizeId: number;
  name: string;
  unitOfMeasurementId: number;
  unitOfMeasurement?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

interface ServingSizeState {
  servingSizes: ServingSize[];
  loading: boolean;
  error: string | null;
}

// Async thunks
export const fetchAllServingSizes = createAsyncThunk(
  'servingSize/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await servingSizeApi.fetchAll();
      console.log('API Response:', response); // Add this to debug
      return response.servingSizeList || []; // Return the servingSizeList array directly
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addServingSize = createAsyncThunk(
  'servingSize/add',
  async (servingSizeData: Partial<ServingSize>, { rejectWithValue }) => {
    try {
      const response = await servingSizeApi.add(servingSizeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateServingSize = createAsyncThunk(
  'servingSize/update',
  async (servingSizeData: ServingSize, { rejectWithValue }) => {
    try {
      const response = await servingSizeApi.update(servingSizeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteServingSize = createAsyncThunk(
  'servingSize/delete',
  async ({ servingSizeId }: { servingSizeId: number }, { rejectWithValue }) => {
    try {
      await servingSizeApi.delete(servingSizeId);
      return servingSizeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState: ServingSizeState = {
  servingSizes: [],
  loading: false,
  error: null,
};

const servingSizeSlice = createSlice({
  name: 'servingSize',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.servingSizes = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all serving sizes
    builder
      .addCase(fetchAllServingSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllServingSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.servingSizes = action.payload; // The payload is now the array directly
        console.log('Updated state:', state.servingSizes); // Add this to debug
      })
      .addCase(fetchAllServingSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch serving sizes';
      })

    // Add serving size
    builder
      .addCase(addServingSize.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addServingSize.fulfilled, (state, action) => {
        state.loading = false;
        state.servingSizes.push(action.payload);
      })
      .addCase(addServingSize.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add serving size';
      })

    // Update serving size
    builder
      .addCase(updateServingSize.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateServingSize.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.servingSizes.findIndex(
          (size) => size.servingSizeId === action.payload?.servingSizeId
        );
        if (index !== -1) {
          state.servingSizes[index] = action.payload;
        }
      })
      .addCase(updateServingSize.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update serving size';
      })

    // Delete serving size
    builder
      .addCase(deleteServingSize.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteServingSize.fulfilled, (state, action) => {
        state.loading = false;
        state.servingSizes = state.servingSizes.filter(
          (size) => size.servingSizeId !== action.payload
        );
      })
      .addCase(deleteServingSize.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete serving size';
      });
  },
});

// Selectors
export const selectAllServingSizes = (state: RootState) => state.servingSize.servingSizes;
export const selectServingSizeStatus = (state: RootState) => state.servingSize.loading;
export const selectServingSizeError = (state: RootState) => state.servingSize.error;

export const { clearError, resetState } = servingSizeSlice.actions;
export default servingSizeSlice.reducer; 