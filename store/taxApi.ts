import api from './api';

export const taxApi = {
  fetchAll: async () => {
    const response = await api.get('/tax/all');
    return response.data;
  },

  add: async (taxData: any) => {
    const response = await api.post('/tax/add', taxData);
    return response.data;
  },

  update: async (taxData: any) => {
    const response = await api.put('/tax/update', taxData);
    return response.data;
  },

  delete: async (taxId: number) => {
    const response = await api.delete('/tax/delete', {
      data: { taxId }
    });
    return response.data;
  }
}; 