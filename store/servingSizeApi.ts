import api from './api';

export const servingSizeApi = {
  fetchAll: async () => {
    const response = await api.get('/serving-size/all');
    return response.data;
  },

  add: async (servingSizeData: any) => {
    const response = await api.post('/serving-size/add', servingSizeData);
    return response.data;
  },

  update: async (servingSizeData: any) => {
    const response = await api.put('/serving-size/update', servingSizeData);
    return response.data;
  },

  delete: async (servingSizeId: any) => {
    const response = await api.delete('/serving-size/delete', {
      data: { servingSizeId }
    });
    return response.data;
  }
}; 