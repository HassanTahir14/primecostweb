import api from './api';

// Define the expected structure for a single 'other payroll' item
// Adjust this interface based on your actual API response
interface OtherPayrollItem {
  userId: number;
  employeeName: string;
  type: string;
  dated: string;
  amount: number;
}

// Define the expected structure of the API response
// Adjust based on your actual API
interface ApiResponse {
  responseCode: string;
  description: string;
  payrollExpenses: OtherPayrollItem[]; // Changed from otherPayrolls to payrollExpenses
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