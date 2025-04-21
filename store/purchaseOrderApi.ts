import api from './api';

export const purchaseOrderApi = {
  // Fetch all purchase orders with pagination/sorting
  fetchAll: async (params: { page: number; size: number; sortBy: string; direction: string }) => {
    const { page = 0, size = 10, sortBy = 'datedFOrder', direction = 'asc' } = params;
    const response = await api.post('/purchase-order/purchase-orders', {
      page,
      size,
      sortBy,
      direction,
    });
    if (response.data && response.data.responseCode === '0000') {
      // Assuming the API returns the list directly or within a nested object like purchaseOrders
      // Adjust based on the actual response structure if needed
      return {
        orders: response.data.purchaseOrders || [],
        // Add pagination info if available in response (e.g., totalElements, totalPages)
        // totalElements: response.data.totalElements,
        // totalPages: response.data.totalPages,
      };
    } else {
      throw new Error(response.data?.description || 'Failed to fetch purchase orders');
    }
  },

  // Add a new purchase order item
  add: async (orderData: any) => {
     // Construct payload based on the /add API schema
    const payload = {
        categoryId: parseInt(orderData.categoryId) || 0, // Ensure numeric if needed
        purchaseCost: parseFloat(orderData.purchaseCost) || 0,
        supplierId: parseInt(orderData.supplierId) || 0,
        vatPercentage: parseFloat(orderData.vatPercentage) || 0,
        vatAmount: parseFloat(orderData.vatAmount) || 0,
        quantity: parseFloat(orderData.quantity) || 1,
        unit: orderData.unit || '', 
        isPrimaryUnitSelected: orderData.isPrimaryUnitSelected ?? true, // Default if needed
        isSecondaryUnitSelected: orderData.isSecondaryUnitSelected ?? false, // Default if needed
        itemId: parseInt(orderData.itemId) || 0, // Ensure this aligns with product selection logic
    };
    const response = await api.post('/purchase-order/add', payload);
    return response.data; // Assumes response includes success/error message
  },

  // Update an existing purchase order item
  update: async (orderData: any) => {
    // Construct payload based on the /update API schema
    const payload = {
        categoryId: parseInt(orderData.categoryId) || 0, 
        purchaseCost: parseFloat(orderData.purchaseCost) || 0,
        supplierId: parseInt(orderData.supplierId) || 0,
        vatPercentage: parseFloat(orderData.vatPercentage) || 0,
        vatAmount: parseFloat(orderData.vatAmount) || 0,
        quantity: parseFloat(orderData.quantity) || 1,
        unit: parseInt(orderData.unit) || 0, // Parse unit to int
        isPrimaryUnitSelected: orderData.isPrimaryUnitSelected ?? true,
        isSecondaryUnitSelected: orderData.isSecondaryUnitSelected ?? false,
        itemId: parseInt(orderData.itemId) || 0, 
        purchaseId: parseInt(orderData.id) || 0, // Use 'id' from the order for 'purchaseId'
    };
    const response = await api.put('/purchase-order/update', payload);
    return response.data; // Assumes response includes success/error message
  },

  // Receive a purchase order
  receive: async (payload: any) => {
    // Payload structure from receivePurchaseOrder thunk
    const response = await api.put('/purchase-order/received', {
      purchaseId: parseInt(payload.purchaseId) || 0,
      expiryDate: payload.expiryDate || null, // Send null if empty
      dateOfDelivery: payload.dateOfDelivery,
      quantity: parseInt(payload.quantity) || 0,
      unit: parseInt(payload.unit) || 0, // unit ID
      isPrimaryUnitSelected: payload.isPrimaryUnitSelected,
      isSecondaryUnitSelected: payload.isSecondaryUnitSelected,
      storageLocationId: parseInt(payload.storageLocationId) || 0,
      branchId: parseInt(payload.branchId) || 0,
    });
    return response.data; // Assumes response includes success/error message
  },

  // Optional: Delete a purchase order item (check API endpoint)
  // delete: async (purchaseId: number) => {
  //   // Example: Adjust endpoint and method as needed
  //   const response = await api.delete(`/purchase-order/delete/${purchaseId}`); 
  //   return response.data;
  // },
}; 