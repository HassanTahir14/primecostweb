import api from './api';

// Define the payload structure for adding an expense
// Adjust based on your actual API requirements
interface AddExpensePayload {
  employeeId: number;
  expenseType: string;
  amount: number;
  expenseDate: string; // Assuming YYYY-MM-DD format
  description?: string;
}

export const expenseApi = {
  addExpense: async (payload: AddExpensePayload) => {
    const token = localStorage.getItem('authToken'); // Assuming auth is needed
    const response = await api.post('/payroll/expense/add', payload, {
        headers: {
             'Authorization': `Bearer ${token}`,
        }
    });
    // Assuming the API returns a standard response structure
    if (response.data && response.data.responseCode === '0000') {
        return response.data; // Return success response
    } else {
        throw new Error(response.data?.description || 'Failed to add expense');
    }
  },

  // Add fetchAll, update, delete if needed for expenses later
}; 