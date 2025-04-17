import api from './api';

interface StorageLocation {
  storageLocationName: string;
  storageLocationId: number;
}

interface Branch {
  branchId: number;
  branchName: string;
  branchManager: string;
  branchAddress: string;
  createdAt: string;
  updatedAt: string;
  storageLocations: StorageLocation[];
}

interface ApiResponse {
  responseCode: string;
  description: string;
  branches: Branch[];
}

interface BranchPayload {
  branchId?: number;
  branchName: string;
  branchManager: string;
  branchAddress: string;
  storageLocationIdsToAdd: number[];
}

interface DeletePayload {
  branchId: number;
}

// Define expected shape of a single branch from the API
interface BranchApiResponse {
  branchId: number;
  name: string; // Assuming API uses 'name' based on mock data
  branchManager: string;
  branchAddress: string;
  storageLocations: { storageLocationId: number, storageLocationName: string }[]; // Assuming API nests locations
  // Add other fields if returned by the API
}

export const branchApi = {
  fetchAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/branch/all');
    return response.data;
  },

  add: async (branchData: Omit<BranchPayload, 'branchId'>) => {
    const response = await api.post('/branch/add', branchData);
    return response.data;
  },

  update: async (branchData: Required<BranchPayload>) => {
    if (branchData.branchId === undefined) {
      throw new Error('branchId is required for update');
    }
    const response = await api.put('/branch/update', branchData);
    return response.data;
  },

  delete: async (payload: DeletePayload) => {
    const response = await api.delete('/branch/delete', {
      data: payload
    });
    return response.data;
  }
}; 