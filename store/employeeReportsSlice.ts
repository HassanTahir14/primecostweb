import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    employeeReportsApi,
    // Import the specific response types
    SalaryBreakdownResponse,
    PerformanceReportResponse,
    IqamaExpiryResponse,
    HealthCardExpiryResponse,
    GeneralEmployeeReportResponse
} from './employeeReportsApi';

// --- State Structure ---
// Make ReportState generic to hold specific response types
interface ReportState<T> {
    data: T | null; // Data is the specific response object or null
    loading: boolean;
    error: any | null;
}

// Use the generic ReportState with specific response types
interface EmployeeReportsState {
    salaryBreakdown: ReportState<SalaryBreakdownResponse>;
    performanceReport: ReportState<PerformanceReportResponse>;
    iqamaExpiry: ReportState<IqamaExpiryResponse>;
    healthCardExpiry: ReportState<HealthCardExpiryResponse>;
    general: ReportState<GeneralEmployeeReportResponse>;
}

// --- Initial State ---
// Function to create initial state for a specific report type
const createInitialReportState = <T>(): ReportState<T> => ({
    data: null,
    loading: false,
    error: null,
});

// Initialize the main state using the helper function
const initialState: EmployeeReportsState = {
    salaryBreakdown: createInitialReportState<SalaryBreakdownResponse>(),
    performanceReport: createInitialReportState<PerformanceReportResponse>(),
    iqamaExpiry: createInitialReportState<IqamaExpiryResponse>(),
    healthCardExpiry: createInitialReportState<HealthCardExpiryResponse>(),
    general: createInitialReportState<GeneralEmployeeReportResponse>(),
};

// --- Common Payload Type ---
interface DateRangePayload {
    sortBy?: string;
    startDate: string;
    endDate: string;
}

// --- Async Thunks --- 

export const fetchSalaryBreakdown = createAsyncThunk<
    SalaryBreakdownResponse, // Return type
    DateRangePayload,
    { rejectValue: any }
>(
    'employeeReports/fetchSalaryBreakdown',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await employeeReportsApi.fetchSalaryBreakdown(payload);
            // Check for error response defined in API function
            if (response.responseCode === 'ERROR') {
                return rejectWithValue(response.description || 'Failed to fetch salary breakdown');
            }
            return response; // Return the full response object
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown error occurred');
        }
    }
);

export const fetchPerformanceReport = createAsyncThunk<
    PerformanceReportResponse, // Return type
    DateRangePayload,
    { rejectValue: any }
>(
    'employeeReports/fetchPerformanceReport',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await employeeReportsApi.fetchPerformanceReport(payload);
             if (response.responseCode === 'ERROR') {
                return rejectWithValue(response.description || 'Failed to fetch performance report');
            }
            return response;
        } catch (error: any) {
             return rejectWithValue(error.message || 'An unknown error occurred');
        }
    }
);

export const fetchIqamaExpiry = createAsyncThunk<
    IqamaExpiryResponse, // Return type
    DateRangePayload,
    { rejectValue: any }
>(
    'employeeReports/fetchIqamaExpiry',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await employeeReportsApi.fetchIqamaExpiry(payload);
             if (response.responseCode === 'ERROR') {
                return rejectWithValue(response.description || 'Failed to fetch Iqama expiry');
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown error occurred');
        }
    }
);

export const fetchHealthCardExpiry = createAsyncThunk<
    HealthCardExpiryResponse, // Return type
    DateRangePayload,
    { rejectValue: any }
>(
    'employeeReports/fetchHealthCardExpiry',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await employeeReportsApi.fetchHealthCardExpiry(payload);
             if (response.responseCode === 'ERROR') {
                return rejectWithValue(response.description || 'Failed to fetch Health Card expiry');
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown error occurred');
        }
    }
);

export const fetchGeneralEmployeeReport = createAsyncThunk<
    GeneralEmployeeReportResponse, // Return type
    DateRangePayload,
    { rejectValue: any }
>(
    'employeeReports/fetchGeneralEmployeeReport',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await employeeReportsApi.fetchGeneralEmployeeReport(payload);
             if (response.responseCode === 'ERROR') {
                return rejectWithValue(response.description || 'Failed to fetch general report');
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An unknown error occurred');
        }
    }
);

// --- Slice Definition ---
const employeeReportsSlice = createSlice({
    name: 'employeeReports',
    initialState,
    reducers: {
        clearEmployeeReportError: (state, action: PayloadAction<keyof EmployeeReportsState>) => {
            if (state[action.payload]) {
                state[action.payload].error = null;
            }
        },
        clearAllEmployeeReportErrors: (state) => {
            Object.keys(state).forEach(key => {
                 // Add type assertion for safety
                 const reportKey = key as keyof EmployeeReportsState;
                 if (state[reportKey]?.error !== undefined) {
                     state[reportKey].error = null;
                 }
            });
        },
    },
    extraReducers: (builder) => {
        // Define a type for the thunk action payload based on Response types
        type ReportActionPayload = SalaryBreakdownResponse | PerformanceReportResponse | IqamaExpiryResponse | HealthCardExpiryResponse | GeneralEmployeeReportResponse;

        // Update the helper function signature if needed, but it might infer correctly
        const addReportReducers = <ReportKey extends keyof EmployeeReportsState>(
            reportKey: ReportKey,
            // Explicitly type the thunk using the specific response type for that key
            thunk: ReturnType<typeof createAsyncThunk<EmployeeReportsState[ReportKey]['data'], DateRangePayload, { rejectValue: any }>>
        ) => {
            builder
                .addCase(thunk.pending, (state) => {
                    state[reportKey].loading = true;
                    state[reportKey].error = null;
                })
                .addCase(thunk.fulfilled, (state, action) => {
                    state[reportKey].loading = false;
                    // action.payload is now correctly typed as the specific Response type or null
                    state[reportKey].data = action.payload;
                })
                .addCase(thunk.rejected, (state, action) => {
                    state[reportKey].loading = false;
                    state[reportKey].error = action.payload; // Keep error as any for now
                });
        };

        // Pass the correctly typed thunks
        addReportReducers('salaryBreakdown', fetchSalaryBreakdown);
        addReportReducers('performanceReport', fetchPerformanceReport);
        addReportReducers('iqamaExpiry', fetchIqamaExpiry);
        addReportReducers('healthCardExpiry', fetchHealthCardExpiry);
        addReportReducers('general', fetchGeneralEmployeeReport);
    },
});

export const { clearEmployeeReportError, clearAllEmployeeReportErrors } = employeeReportsSlice.actions;
export default employeeReportsSlice.reducer; 