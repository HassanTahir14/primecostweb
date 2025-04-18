import api from './api';

// Define interface for Item data structure based on API docs
// Adjust fields as necessary based on exact API response/request structure
interface ItemData {
  taxId?: number;
  primaryUnit?: number; // Assuming ID is sent
  primaryUnitValue?: number;
  name?: string;
  code?: string;
  purchaseCostWithoutVat?: number;
  itemsBrandName?: string;
  purchaseCostWithVat?: number;
  secondaryUnit?: number; // Assuming ID is sent
  secondaryUnitValue?: number;
  categoryId?: number;
  countryOrigin?: string;
  itemId?: number; // Required for update/delete
  imageIdsToRemove?: number[]; // Optional for update
  // Add other fields as needed from the Swagger definition
}

interface FetchParams {
  page?: number;
  size?: number;
  direction?: 'asc' | 'desc';
  searchQuery?: string;
  sortBy?: string;
}

export const itemsApi = {
  // Fetch all items with pagination/sorting
  fetchAll: async (params: FetchParams) => {
    const response = await api.post('/items/all', params);
    // Assuming the API returns { itemList: [], pageNumber: 0, ... }
    return response.data; 
  },

  // Add a new item (multipart/form-data)
  add: async (itemData: ItemData, images: File[]) => {
    const formData = new FormData();

    // Append item data as a JSON string blob under the key 'request'
    formData.append('request', new Blob([JSON.stringify(itemData)], { type: 'application/json' }));

    // Append images
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post('/items/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update an existing item (multipart/form-data)
  update: async (itemData: ItemData, images: File[]) => {
    const formData = new FormData();

    // Append item data as a JSON string blob under the key 'request'
    formData.append('request', new Blob([JSON.stringify(itemData)], { type: 'application/json' }));

    // Append new images
    images.forEach((image) => {
      formData.append('images', image);
    });

    // Ensure itemId is included in itemData for the request
    if (!itemData.itemId) {
        throw new Error("Item ID is required for updating.");
    }

    const response = await api.put('/items/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete an item
  delete: async (itemId: number) => {
    const response = await api.delete('/items/delete', {
      data: { itemId } // Send itemId in the request body as per Swagger
    });
    return response.data;
  }
}; 