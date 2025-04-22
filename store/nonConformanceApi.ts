import api from './api';

// Interface for the response of fetching all reports
interface NonConformanceReportDTO {
    orderNo: number;
    date: string; // "YYYY-MM-DD"
    supplierId: number;
    supplierName: string; // Assuming API provides name
    supplierEmail: string;
    branchName: string;
    branchAddress: string;
    branchId: number;
    itemId?: number; // Assuming itemId might be part of the response
    itemName?: string; // Assuming itemName might be part of the response
    description: string; // Description of the issue
    salesContactNumber?: string; // Assuming this might be part of the response
    position?: string; // Assuming this might be part of the response
    inspector?: string; // Assuming this might be part of the response
    nonConformanceDescription: string; // Detailed description from the form
    correctiveAction: string;
    preparedBy?: string; // Assuming this might be part of the response
    approvedBy?: string; // Assuming this might be part of the response
    approvedStatus?: string; // e.g., 'REJECTED', 'APPROVED'
}

interface FetchAllApiResponse {
    responseCode: string;
    description: string;
    nonConformanceReports: NonConformanceReportDTO[];
}

// Interface for the payload when adding a new report
interface AddNonConformancePayload {
    orderNo: number;
    date: string; // "YYYY-MM-DD"
    supplierId: number;
    branchId: number;
    description: string; // This seems to map to 'title' in the current form? Or the main description? Let's assume main nonConformanceDescription
    nonConformanceDescription: string;
    correctiveAction: string;
    impactOnDeliverySchedule: string; // This was 'impact' in the form
    dateCloseOut: string; // "YYYY-MM-DD"
    // Missing fields from payload image: 'actionBy'? Let's assume it's not strictly required by API based on image
}

interface AddApiResponse {
    responseCode: string;
    description: string;
    // Potentially other fields returned upon creation
}


export const nonConformanceApi = {
  fetchAll: async (): Promise<FetchAllApiResponse> => {
    const response = await api.get('/non-conformance/all');
    // Add basic validation or logging
    if (!response.data || !response.data.nonConformanceReports) {
        console.error("API Error: Invalid response structure from /non-conformance/all", response.data);
        // Return a default structure to prevent crashes downstream
        return { responseCode: 'ERR', description: 'Invalid API response', nonConformanceReports: [] };
    }
    return response.data;
  },

  add: async (reportData: AddNonConformancePayload): Promise<AddApiResponse> => {
    const response = await api.post('/non-conformance/add', reportData);
    // Add basic validation or logging
    if (!response.data) {
         console.error("API Error: Invalid response structure from /non-conformance/add", response.data);
         return { responseCode: 'ERR', description: 'Invalid API response' };
    }
    return response.data;
  },

  // Add update/delete functions here if needed later
}; 