import api from './api';

// Define the expected structure for a single 'other payroll' item
// Adjust this interface based on your actual API response
interface OtherPayrollItem {
  id: number;
  employeeId: number;
  employeeName: string; // Assuming name is included
  payrollType: string;
  amount: number;
  date: string; // Assuming ISO date string
  description?: string;
}

// Define the expected structure of the API response
// Adjust based on your actual API
interface ApiResponse {
  responseCode: string;
  description: string;
  otherPayrolls: OtherPayrollItem[]; // Assuming the list is nested
}

export const otherPayrollApi = {
  fetchAll: async (params?: any): Promise<ApiResponse> => {
    // Adjust endpoint and method (GET/POST) if needed
    const response = await api.post('/payroll/expense/all', { params }); 
    // If it's POST, use: await api.post('/other-payroll/all', params || {});
    return response.data;
  },

  // Add other methods like add, update, delete if needed later
  // add: async (payload: any) => { ... },
}; 