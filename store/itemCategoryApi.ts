import api from './api';

export const itemCategoryApi = {
  fetchAll: async () => {
    // GET /api/v1/categories/all
    const response = await api.get('/categories/all');
    return response.data;
  },

  add: async (categoryData: { name: string }) => {
    // POST /api/v1/categories/add
    const response = await api.post('/categories/add', categoryData);
    return response.data;
  },

  update: async (categoryData: { categoryId: number; name: string }) => {
    // PUT /api/v1/categories/update
    const response = await api.put('/categories/update', categoryData);
    return response.data;
  },

  delete: async (categoryId: number) => {
    // DELETE /api/v1/categories/delete
    // The API expects the categoryId in the request body
    const response = await api.delete('/categories/delete', {
      data: { categoryId }
    });
    return response.data;
  }
}; 