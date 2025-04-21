import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storageLocationApi } from './storageLocationApi';

// Define the interface for a single storage location based on the API response
// Export the interface
export interface StorageLocation {
  storageLocationId: number;
  storageLocationName: string;
  branchId?: number; // Add branchId if it's part of the structure
}

// Define the interface for the state
interface StorageLocationState {
  locations: StorageLocation[];
  loading: boolean;
  error: string | null | any; // Allow for object errors from rejectWithValue
}

// --- Async Thunks ---

export const fetchAllStorageLocations = createAsyncThunk<StorageLocation[], void, { rejectValue: any }>(
  'storageLocation/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await storageLocationApi.fetchAll();
      return data; // API service now returns the array directly
    } catch (error: any) { // Catch block expects error of type any or unknown
      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch storage locations');
    }
  }
);

export const addStorageLocation = createAsyncThunk<any, { storageLocationName: string }, { rejectValue: any }>(
  'storageLocation/add',
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await storageLocationApi.add(locationData);
      // Assuming the add API might return the newly created object or a success message
      // Let's assume it returns the new object for optimistic updates, adjust if needed.
      // If it just returns a success message, you might need to refetch or handle differently.
      // For now, let's return the response and handle in the reducer.
      // A better approach if the API returns the new object:
      // return { ...locationData, storageLocationId: response.newId }; // Synthesize or use response
      return response; // Or return the whole response to check status code etc.
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to add storage location');
    }
  }
);

interface UpdatePayload {
  storageLocationId: number;
  storageLocationName: string;
}

export const updateStorageLocation = createAsyncThunk<any, UpdatePayload, { rejectValue: any }>(
  'storageLocation/update',
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await storageLocationApi.update(locationData);
      // Assuming the update API returns the updated object or a success message
      // Return the data needed to update the state (the updated location data)
      return { ...locationData }; // Optimistically return the data sent
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to update storage location');
    }
  }
);

export const deleteStorageLocation = createAsyncThunk<number, number, { rejectValue: any }>(
  'storageLocation/delete',
  async (storageLocationId, { rejectWithValue }) => {
    try {
      await storageLocationApi.delete({ storageLocationId });
      return storageLocationId; // Return the ID of the deleted item for removal from state
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to delete storage location');
    }
  }
);

// --- Initial State ---
const initialState: StorageLocationState = {
  locations: [],
  loading: false,
  error: null,
};

// --- Slice Definition ---
const storageLocationSlice = createSlice({
  name: 'storageLocation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.locations = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchAllStorageLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStorageLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload; // Payload is the array directly
      })
      .addCase(fetchAllStorageLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Add
    builder
      .addCase(addStorageLocation.pending, (state) => {
        state.loading = true; // Might want separate loading for add/update/delete
        state.error = null;
      })
      .addCase(addStorageLocation.fulfilled, (state, action) => {
        state.loading = false;
        // If API returns the new object with ID, push it. Otherwise, refetch.
        // state.locations.push(action.payload); // Ideal case
        // For now, we don't know the structure of action.payload reliably, 
        // so refetching might be safer after add/update.
        // Or rely on a success message and don't modify state here.
      })
      .addCase(addStorageLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Update
    builder
      .addCase(updateStorageLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStorageLocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.locations.findIndex(
          (loc) => loc.storageLocationId === action.payload.storageLocationId
        );
        if (index !== -1) {
          state.locations[index] = action.payload; // Update with the data returned by the thunk
        }
      })
      .addCase(updateStorageLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Delete
    builder
      .addCase(deleteStorageLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStorageLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = state.locations.filter(
          (loc) => loc.storageLocationId !== action.payload // Remove by ID
        );
      })
      .addCase(deleteStorageLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetState } = storageLocationSlice.actions;
export default storageLocationSlice.reducer; 