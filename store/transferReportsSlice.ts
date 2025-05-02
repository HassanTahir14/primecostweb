import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    transferReportsApi,
    // Import specific response types
    SubRecipeTransferResponse,
    RecipeTransferResponse,
    MaterialTransferResponse,
    ItemTransferResponse
} from './transferReportsApi';

// --- Generic Report State --- (Assuming similar structure as employee reports)
interface ReportState<T> {
    data: T | null;
    loading: boolean;
    error: any | null;
}

// --- Transfer Reports State Structure ---
interface TransferReportsState {
    subRecipesTransferred: ReportState<SubRecipeTransferResponse>;
    recipesTransferred: ReportState<RecipeTransferResponse>;
    materialsTransferred: ReportState<MaterialTransferResponse>;
    itemsTransferred: ReportState<ItemTransferResponse>;
}

// --- Initial State --- (Using helper function)
const createInitialReportState = <T>(): ReportState<T> => ({
    data: null,
    loading: false,
    error: null,
});

const initialState: TransferReportsState = {
    subRecipesTransferred: createInitialReportState<SubRecipeTransferResponse>(),
    recipesTransferred: createInitialReportState<RecipeTransferResponse>(),
    materialsTransferred: createInitialReportState<MaterialTransferResponse>(),
    itemsTransferred: createInitialReportState<ItemTransferResponse>(),
};

// --- Common Payload Type ---
interface DateRangePayload {
    sortBy?: string;
    page?: number;
    size?: number;
    direction?: string;
    startDate: string;
    endDate: string;
}

// --- Async Thunks ---

export const fetchSubRecipesTransferred = createAsyncThunk<
    SubRecipeTransferResponse,
    DateRangePayload,
    { rejectValue: any }
>(
    'transferReports/fetchSubRecipes',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await transferReportsApi.fetchSubRecipesTransferred(payload);
            if (response.responseCode === 'ERROR') {
                return rejectWithValue(response.description || 'Failed to fetch transferred sub-recipes');
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown error occurred');
        }
    }
);

export const fetchRecipesTransferred = createAsyncThunk<
    RecipeTransferResponse,
    DateRangePayload,
    { rejectValue: any }
>(
    'transferReports/fetchRecipes',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await transferReportsApi.fetchRecipesTransferred(payload);
            if (response.responseCode === 'ERROR') {
                return rejectWithValue(response.description || 'Failed to fetch transferred recipes');
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown error occurred');
        }
    }
);

export const fetchMaterialsTransferred = createAsyncThunk<
    MaterialTransferResponse,
    DateRangePayload,
    { rejectValue: any }
>(
    'transferReports/fetchMaterials',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await transferReportsApi.fetchMaterialsTransferred(payload);
            if (response.responseCode === 'ERROR') {
                return rejectWithValue(response.description || 'Failed to fetch transferred materials');
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown error occurred');
        }
    }
);

export const fetchItemsTransferred = createAsyncThunk<
    ItemTransferResponse,
    DateRangePayload,
    { rejectValue: any }
>(
    'transferReports/fetchItems',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await transferReportsApi.fetchItemsTransferred(payload);
            if (response.responseCode === 'ERROR') {
                return rejectWithValue(response.description || 'Failed to fetch transferred items');
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown error occurred');
        }
    }
);

// --- Slice Definition ---
const transferReportsSlice = createSlice({
    name: 'transferReports',
    initialState,
    reducers: {
        clearTransferReportError: (state, action: PayloadAction<keyof TransferReportsState>) => {
            if (state[action.payload]) {
                state[action.payload].error = null;
            }
        },
        clearAllTransferReportErrors: (state) => {
            Object.keys(state).forEach(key => {
                 const reportKey = key as keyof TransferReportsState;
                 if (state[reportKey]?.error !== undefined) {
                     state[reportKey].error = null;
                 }
            });
        },
    },
    extraReducers: (builder) => {
        const addReportReducers = <ReportKey extends keyof TransferReportsState>(
            reportKey: ReportKey,
            thunk: ReturnType<typeof createAsyncThunk<TransferReportsState[ReportKey]['data'], DateRangePayload, { rejectValue: any }>>
        ) => {
            builder
                .addCase(thunk.pending, (state) => {
                    state[reportKey].loading = true;
                    state[reportKey].error = null;
                })
                .addCase(thunk.fulfilled, (state, action) => {
                    state[reportKey].loading = false;
                    state[reportKey].data = action.payload;
                })
                .addCase(thunk.rejected, (state, action) => {
                    state[reportKey].loading = false;
                    state[reportKey].error = action.payload;
                });
        };

        addReportReducers('subRecipesTransferred', fetchSubRecipesTransferred);
        addReportReducers('recipesTransferred', fetchRecipesTransferred);
        addReportReducers('materialsTransferred', fetchMaterialsTransferred);
        addReportReducers('itemsTransferred', fetchItemsTransferred);
    },
});

export const { clearTransferReportError, clearAllTransferReportErrors } = transferReportsSlice.actions;
export default transferReportsSlice.reducer; 