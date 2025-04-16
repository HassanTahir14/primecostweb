import api from './api';

export interface SupplierData {
  name: string;
  contactNo: string;
  email: string;
  vatNo: string;
  salesmanName: string;
  salesmanContactNo: string;
  salesmanEmail: string;
  supplierAddress: string;
  crNo: string;
}

export interface Supplier extends SupplierData {
  supplierId: number;
  createdAt?: string;
  updatedAt?: string;
}

export const supplierApi = {
  fetchAll: async () => {
    const response = await api.get('/supplier/all');
    return response.data;
  },

  add: async (supplierData: SupplierData) => {
    const response = await api.post('/supplier/add', supplierData);
    return response.data;
  },

  update: async (supplierData: Supplier) => {
    const response = await api.put('/supplier/update', supplierData);
    return response.data;
  },

  delete: async (supplierId: number) => {
    const response = await api.delete('/supplier/delete', {
      data: { supplierId }
    });
    return response.data;
  }
}; 