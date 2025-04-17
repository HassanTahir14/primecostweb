import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { branchApi } from './branchApi';

interface StorageLocation {
  storageLocationName: string;
  storageLocationId: number;
}

export interface Branch {
  branchId: number;
  branchName: string;
  branchManager: string;
  branchAddress: string;
  createdAt: string;
  updatedAt: string;
  storageLocations: StorageLocation[];
}

interface BranchState {
  branches: Branch[];
  loading: boolean;
  error: string | null | any;
}

type AddBranchPayload = {
  branchName: string;
  branchManager: string;
  branchAddress: string;
  storageLocationIdsToAdd: number[];
};

type UpdateBranchPayload = {
  branchId: number;
  branchName: string;
  branchManager: string;
  branchAddress: string;
  storageLocationIdsToAdd: number[];
};

export const fetchAllBranches = createAsyncThunk<
  Branch[],
  void,
  { rejectValue: any }
>(
  'branch/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await branchApi.fetchAll();
      return response.branches;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch branches');
    }
  }
);

export const addBranch = createAsyncThunk<
  any,
  AddBranchPayload,
  { rejectValue: any }
>(
  'branch/add',
  async (branchData, { rejectWithValue }) => {
    try {
      const response = await branchApi.add(branchData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to add branch');
    }
  }
);

export const updateBranch = createAsyncThunk<
  UpdateBranchPayload,
  UpdateBranchPayload,
  { rejectValue: any }
>(
  'branch/update',
  async (branchData, { rejectWithValue }) => {
    try {
      await branchApi.update(branchData);
      return branchData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to update branch');
    }
  }
);

export const deleteBranch = createAsyncThunk<
  number,
  number,
  { rejectValue: any }
>(
  'branch/delete',
  async (branchId, { rejectWithValue }) => {
    try {
      await branchApi.delete({ branchId });
      return branchId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to delete branch');
    }
  }
);

// --- Initial State ---
const initialState: BranchState = {
  branches: [],
  loading: false,
  error: null,
};

// --- Slice Definition ---
const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.branches = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchAllBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
      })
      .addCase(fetchAllBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Add
    builder
      .addCase(addBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBranch.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(addBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Update
    builder
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.branches.findIndex(
          (branch) => branch.branchId === action.payload.branchId
        );
        if (index !== -1) {
          state.branches[index] = {
            ...state.branches[index],
            branchName: action.payload.branchName,
            branchManager: action.payload.branchManager,
            branchAddress: action.payload.branchAddress,
          };
        }
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Delete
    builder
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.filter(
          (branch) => branch.branchId !== action.payload
        );
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetState } = branchSlice.actions;
export default branchSlice.reducer; 