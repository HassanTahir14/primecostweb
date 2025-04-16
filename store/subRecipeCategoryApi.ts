import api from './api';

export const subRecipeCategoryApi = {
  fetchAll: async () => {
    const response = await api.get('/sub-recipe/categories/all');
    return response.data;
  },

  add: async (categoryData: any) => {
    const response = await api.post('/sub-recipe/categories/add', categoryData);
    return response.data;
  },

  update: async (categoryData: any) => {
    const response = await api.put('/sub-recipe/categories/update', categoryData);
    return response.data;
  },

  delete: async (categoryId: any) => {
    const response = await api.delete('/sub-recipe/categories/delete', {
      data: { categoryId }
    });
    return response.data;
  }
}; 