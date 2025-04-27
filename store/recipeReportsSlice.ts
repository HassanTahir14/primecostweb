import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { recipeReportsApi } from './recipeReportsApi';

// --- State Structure ---
interface ReportState {
    data: any[]; // Placeholder - Update with specific types later
    loading: boolean;
    error: any | null;
}

interface RecipeReportsState {
    yieldAnalysis: ReportState;
    profitMargin: ReportState;
    preparedItems: ReportState;
    foodCost: ReportState;
}

// --- Initial State ---
const initialReportState: ReportState = { data: [], loading: false, error: null };

const initialState: RecipeReportsState = {
    yieldAnalysis: { ...initialReportState },
    profitMargin: { ...initialReportState },
    preparedItems: { ...initialReportState },
    foodCost: { ...initialReportState },
};

// --- Common Payload Type ---
interface DateRangePayload {
    sortBy?: string;
    direction?: string;
    page?: number;
    size?: number;
    startDate: string;
    endDate: string;
}

// --- Async Thunks ---

export const fetchYieldAnalysis = createAsyncThunk(
    'recipeReports/fetchYieldAnalysis',
    async (payload: DateRangePayload, { rejectWithValue }) => {
        try {
            const response = await recipeReportsApi.fetchYieldAnalysis(payload);
            // Assuming response format { data: [...] }, adjust if necessary
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchProfitMargin = createAsyncThunk(
    'recipeReports/fetchProfitMargin',
    async (payload: DateRangePayload, { rejectWithValue }) => {
        try {
            const response = await recipeReportsApi.fetchProfitMargin(payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchPreparedItems = createAsyncThunk(
    'recipeReports/fetchPreparedItems',
    async (payload: DateRangePayload, { rejectWithValue }) => {
        try {
            const response = await recipeReportsApi.fetchPreparedItems(payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchFoodCost = createAsyncThunk(
    'recipeReports/fetchFoodCost',
    async (payload: DateRangePayload, { rejectWithValue }) => {
        try {
            const response = await recipeReportsApi.fetchFoodCost(payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// --- Slice Definition ---
const recipeReportsSlice = createSlice({
    name: 'recipeReports',
    initialState,
    reducers: {
        clearRecipeReportError: (state, action: PayloadAction<keyof RecipeReportsState>) => {
            if (state[action.payload]) {
                state[action.payload].error = null;
            }
        },
        clearAllRecipeReportErrors: (state) => {
            Object.keys(state).forEach(key => {
                 if (state[key as keyof RecipeReportsState]?.error !== undefined) {
                     state[key as keyof RecipeReportsState].error = null;
                 }
            });
        },
    },
    extraReducers: (builder) => {
        // Helper to generate reducers for each report type
        const addReportReducers = <T extends keyof RecipeReportsState>(
            reportKey: T,
            thunk: ReturnType<typeof createAsyncThunk<any, DateRangePayload, {}>>
        ) => {
            builder
                .addCase(thunk.pending, (state) => {
                    state[reportKey].loading = true;
                    state[reportKey].error = null;
                })
                .addCase(thunk.fulfilled, (state, action) => {
                    state[reportKey].loading = false;
                    state[reportKey].data = action.payload; // Assume payload is the data array
                })
                .addCase(thunk.rejected, (state, action) => {
                    state[reportKey].loading = false;
                    state[reportKey].error = action.payload;
                });
        };

        addReportReducers('yieldAnalysis', fetchYieldAnalysis);
        addReportReducers('profitMargin', fetchProfitMargin);
        addReportReducers('preparedItems', fetchPreparedItems);
        addReportReducers('foodCost', fetchFoodCost);
    },
});

export const { clearRecipeReportError, clearAllRecipeReportErrors } = recipeReportsSlice.actions;
export default recipeReportsSlice.reducer; 