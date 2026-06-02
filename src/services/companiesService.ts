import { api } from './api';
import { Company } from '../types';

export const companiesService = {
  getAll: async () => {
    const response = await api.get<{ data: Company[]; total: number }>('/companies');
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },

  create: async (companyData: Partial<Company>) => {
    const response = await api.post<Company>('/companies', companyData);
    return response.data;
  },

  update: async (id: number, companyData: Partial<Company>) => {
    const response = await api.patch<Company>(`/companies/${id}`, companyData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};
