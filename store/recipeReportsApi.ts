import api from './api';

// --- Common Payload ---
interface DateRangePayload {
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
}

// --- Response Interfaces (Placeholders - Update with actual API structure) ---

interface GenericReportResponse {
    // Assuming a common structure, adjust if needed
    responseCode?: string;
    description?: string;
    data: any[]; // Placeholder for actual report data structure
    // Add pagination or other common fields if they exist
}

// Specific placeholder types if structure is known to differ significantly
interface YieldAnalysisResponse extends GenericReportResponse { }
interface ProfitMarginResponse extends GenericReportResponse { }
interface PreparedItemsResponse extends GenericReportResponse { }
interface FoodCostResponse extends GenericReportResponse { }


// --- API Functions ---
export const recipeReportsApi = {
    fetchYieldAnalysis: async (payload: DateRangePayload): Promise<YieldAnalysisResponse> => {
        console.log('Fetching Yield Analysis:', payload);
        const response = await api.post('/recipe-reports/yield-analysis', payload);
        // Add basic validation if possible, otherwise rely on caller
        if (!response.data) { 
            console.error("API Error: Invalid response from /recipe-reports/yield-analysis");
            return { data: [] }; // Return default structure
        }
        return { data: response.data }; // Assume data is the array for now
    },

    fetchProfitMargin: async (payload: DateRangePayload): Promise<ProfitMarginResponse> => {
        console.log('Fetching Profit Margin:', payload);
        const response = await api.post('/recipe-reports/profit-margin', payload);
        if (!response.data) { 
            console.error("API Error: Invalid response from /recipe-reports/profit-margin");
            return { data: [] }; 
        }
        return { data: response.data }; 
    },

    fetchPreparedItems: async (payload: DateRangePayload): Promise<PreparedItemsResponse> => {
        console.log('Fetching Prepared Items:', payload);
        const response = await api.post('/recipe-reports/prepared-items', payload);
        if (!response.data) { 
            console.error("API Error: Invalid response from /recipe-reports/prepared-items");
            return { data: [] }; 
        }
         return { data: response.data }; 
    },

    fetchFoodCost: async (payload: DateRangePayload): Promise<FoodCostResponse> => {
        console.log('Fetching Food Cost:', payload);
        const response = await api.post('/recipe-reports/food-cost', payload);
         if (!response.data) { 
            console.error("API Error: Invalid response from /recipe-reports/food-cost");
            return { data: [] }; 
        }
        return { data: response.data }; 
    },
}; 