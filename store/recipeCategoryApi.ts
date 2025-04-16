import api from './api';

export const recipeCategoryApi = {
  fetchAll: async () => {
    const response = await api.get('/recipe/categories/all');
    return response.data;
  },

  add: async (categoryData: any) => {
    const response = await api.post('/recipe/categories/add', categoryData);
    return response.data;
  },

  update: async (categoryData: any) => {
    const response = await api.put('/recipe/categories/update', categoryData);
    return response.data;
  },

  delete: async (categoryId: any) => {
    const response = await api.delete('/recipe/categories/delete', {
      data: { categoryId }
    });
    return response.data;
  }
}; 