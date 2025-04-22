import api from './api';

// --- Common Payload ---
interface DateRangePayload {
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
}

// --- Record Interfaces (Based on actual API responses) ---

export interface SubRecipeTransferRecord {
  subRecipeName: string;
  branch: string;
  quantity: number;
  unit: string;
  cost: number;
  orderDate: string; // Assuming this is the transfer date
}

export interface RecipeTransferRecord {
  recipeName: string;
  branch: string;
  quantity: number;
  unit: string;
  cost: number;
  orderDate: string; // Assuming this is the transfer date
}

export interface MaterialTransferRecord {
  itemName: string;
  branch: string;
  quantity: number;
  unit: string;
  cost: number;
  orderDate: string; // Assuming this is the transfer date
}

export interface ItemTransferRecord {
  transferDate: string;
  transferCode: number;
  requestedBy: string;
  transferredBy: string;
  transferCost: number;
  otherCharges: number;
  totalTransferCost: number;
  fromBranch: string;
  toBranch: string;
}

// --- Response Interfaces (Specific for each report) ---

interface BaseReportResponse {
    responseCode?: string;
    description?: string;
}

export interface SubRecipeTransferResponse extends BaseReportResponse {
    subRecipes: SubRecipeTransferRecord[];
}

export interface RecipeTransferResponse extends BaseReportResponse {
    recipes: RecipeTransferRecord[];
}

export interface MaterialTransferResponse extends BaseReportResponse {
    materials: MaterialTransferRecord[];
}

export interface ItemTransferResponse extends BaseReportResponse {
    transferDetails: ItemTransferRecord[];
}

// Default response structure for error cases
const defaultErrorResponse = (detailsKey: string) => ({
    responseCode: 'ERROR',
    description: 'Failed to fetch report or invalid response structure.',
    [detailsKey]: [],
});

// --- API Functions --- Assuming endpoints from image
export const transferReportsApi = {
    fetchSubRecipesTransferred: async (payload: DateRangePayload): Promise<SubRecipeTransferResponse> => {
        const endpoint = '/transfer-reports/sub-recipes-transferred';
        console.log(`Fetching report: ${endpoint}`, payload);
        try {
            const response = await api.post(endpoint, payload);
            if (!response.data || !Array.isArray(response.data.subRecipes)) {
                console.error(`API Error: Invalid response structure from ${endpoint}`, response.data);
                return defaultErrorResponse('subRecipes') as SubRecipeTransferResponse;
            }
            return response.data as SubRecipeTransferResponse;
        } catch (error) {
            console.error(`API Call Failed: ${endpoint}`, error);
            return defaultErrorResponse('subRecipes') as SubRecipeTransferResponse;
        }
    },

    fetchRecipesTransferred: async (payload: DateRangePayload): Promise<RecipeTransferResponse> => {
        const endpoint = '/transfer-reports/recipes-transferred';
        console.log(`Fetching report: ${endpoint}`, payload);
        try {
            const response = await api.post(endpoint, payload);
            if (!response.data || !Array.isArray(response.data.recipes)) {
                console.error(`API Error: Invalid response structure from ${endpoint}`, response.data);
                return defaultErrorResponse('recipes') as RecipeTransferResponse;
            }
            return response.data as RecipeTransferResponse;
        } catch (error) {
            console.error(`API Call Failed: ${endpoint}`, error);
            return defaultErrorResponse('recipes') as RecipeTransferResponse;
        }
    },

    fetchMaterialsTransferred: async (payload: DateRangePayload): Promise<MaterialTransferResponse> => {
        const endpoint = '/transfer-reports/materials-transferred';
        console.log(`Fetching report: ${endpoint}`, payload);
        try {
            const response = await api.post(endpoint, payload);
            if (!response.data || !Array.isArray(response.data.materials)) {
                console.error(`API Error: Invalid response structure from ${endpoint}`, response.data);
                return defaultErrorResponse('materials') as MaterialTransferResponse;
            }
            return response.data as MaterialTransferResponse;
        } catch (error) {
            console.error(`API Call Failed: ${endpoint}`, error);
            return defaultErrorResponse('materials') as MaterialTransferResponse;
        }
    },

    fetchItemsTransferred: async (payload: DateRangePayload): Promise<ItemTransferResponse> => {
        const endpoint = '/transfer-reports/items-transferred';
        console.log(`Fetching report: ${endpoint}`, payload);
        try {
            const response = await api.post(endpoint, payload);
            if (!response.data || !Array.isArray(response.data.transferDetails)) {
                console.error(`API Error: Invalid response structure from ${endpoint}`, response.data);
                return defaultErrorResponse('transferDetails') as ItemTransferResponse;
            }
            return response.data as ItemTransferResponse;
        } catch (error) {
            console.error(`API Call Failed: ${endpoint}`, error);
            return defaultErrorResponse('transferDetails') as ItemTransferResponse;
        }
    },
}; 