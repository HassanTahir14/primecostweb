import api from './api';

interface StorageLocationData {
  storageLocationName: string;
  storageLocationId?: number; // Optional for add, required for update
}

interface DeletePayload {
  storageLocationId: number;
}

export const storageLocationApi = {
  fetchAll: async () => {
    const response = await api.get('/storage-location/all');
    // Assuming the API returns { responseCode, description, storageLocation: [...] }
    if (response.data && response.data.storageLocation) {
      return response.data.storageLocation; // Return just the array
    } else {
      // Handle cases where the structure might be different or empty
      console.warn('Unexpected response structure for fetchAll storage locations:', response.data);
      return []; 
    }
  },

  add: async (locationData: { storageLocationName: string }) => {
    const response = await api.post('/storage-location/add', locationData);
    return response.data; 
  },

  update: async (locationData: StorageLocationData) => {
    if (locationData.storageLocationId === undefined) {
      throw new Error('storageLocationId is required for update');
    }
    const response = await api.put('/storage-location/update', locationData);
    return response.data;
  },

  delete: async (payload: DeletePayload) => {
    const response = await api.delete('/storage-location/delete', {
      data: payload
    });
    return response.data;
  }
}; 