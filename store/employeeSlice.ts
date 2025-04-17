import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeApi } from './employeeApi';

// Interfaces based on GET /kitchen/employees response
interface EmployeeDetails {
  firstName: string;
  familyName: string | null;
  mobileNumber: string;
  healthCardNumber: string;
  position: string;
  iqamaId: string; // Or iqamaCardNumber based on consistency?
  healthCardExpiry: string; // Date string
  iqamaExpiryDate: string; // Date string
  loginId: string;
  active: boolean;
  dateOfBirth: string | null; // Date string
  // Add other fields if present in the API response (e.g., email, nationality)
}

interface DutySchedule {
  // Define based on dutyScheduleResponseList if available in GET response
  // Example (adjust based on actual structure):
  day: string;
  openingShift: string; // e.g., "09:00"
  breakTime: string;
  closingShift: string;
}

interface SalaryDetails {
  basicSalary: number;
  // Add other salary components if present (foodAllowance, etc.)
  // The GET response only shows basicSalary in the provided image
}

// Export the Employee interface
export interface Employee {
  employeeId: number;
  employeeDetailsDTO: EmployeeDetails;
  dutyScheduleResponseList: DutySchedule[]; // Adjust name/structure if needed
  salaryDTO: SalaryDetails; // Adjust name/structure if needed
  // Add image details if they come in the GET response
}

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: any | null; // Store potentially structured error response
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAllEmployees = createAsyncThunk(
  'employee/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await employeeApi.fetchAll();
      return data; // The API function already extracts the list
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Type for addEmployee payload
interface AddEmployeePayload {
  employeeData: any; // Combined data from forms
  images: File[];
}

export const addEmployee = createAsyncThunk(
  'employee/add',
  async ({ employeeData, images }: AddEmployeePayload, { rejectWithValue }) => {
    try {
      const response = await employeeApi.add(employeeData, images);
       if (response && response.responseCode === '0000') {
         // Consider if the API returns the created employee object
         // If so, return it to update the state optimistically/correctly
         // return response.newEmployeeObject; // Example
         return response; // Returning the success response for now
       } else {
         return rejectWithValue(response?.description || 'Failed to add employee');
       }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Type for updateEmployee payload
interface UpdateEmployeePayload {
    employeeId: number;
    employeeData: any;
    images: File[];
    imageIdsToRemove: number[];
}

export const updateEmployee = createAsyncThunk(
  'employee/update',
  async ({ employeeId, employeeData, images, imageIdsToRemove }: UpdateEmployeePayload, { rejectWithValue }) => {
    try {
       const response = await employeeApi.update(employeeId, employeeData, images, imageIdsToRemove);
       if (response && response.responseCode === '0000') {
          // Consider if the API returns the updated employee object
         // return response.updatedEmployeeObject; // Example
         // For now, we might need to refetch or pass the updated data back
         return { ...employeeData, employeeId }; // Return basic data for potential optimistic update
       } else {
         return rejectWithValue(response?.description || 'Failed to update employee');
       }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Optional: Delete Thunk
// export const deleteEmployee = createAsyncThunk(...);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.employees = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchAllEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload; // Assumes payload is the array of employees
      })
      .addCase(fetchAllEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Employee
    builder
      .addCase(addEmployee.pending, (state) => {
        state.loading = true; // Indicate loading state for the add operation
        state.error = null;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.loading = false;
        // If the API returned the created employee, add it:
        // state.employees.push(action.payload); 
        // Since it might not, we might need to refetch or handle differently
        // For now, just stop loading. A refetch might be triggered elsewhere.
        console.log('Add employee success:', action.payload);
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Employee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true; // Indicate loading state for the update operation
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(
          (emp) => emp.employeeId === action.payload.employeeId
        );
        if (index !== -1) {
          // Optimistically update with returned data, or structure based on API response
          // This might need refinement based on what `updateEmployee` actually returns
          // state.employees[index] = { ...state.employees[index], ...action.payload };
           console.log('Update employee success:', action.payload);
           // Consider refetching list for consistency after update
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
    // Optional: Handle Delete cases
  },
});

export const { clearError, resetState } = employeeSlice.actions;
export default employeeSlice.reducer; 