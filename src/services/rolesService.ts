import { api } from './api';

export interface IRole {
  id: number;
  name: string;
  description?: string;
  permissions: any;
  createdAt: string;
  updatedAt: string;
}

export const rolesService = {
  getAll: async () => {
    const response = await api.get<IRole[]>('/roles');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<IRole>(`/roles/${id}`);
    return response.data;
  },

  create: async (roleData: any) => {
    const response = await api.post<IRole>('/roles', roleData);
    return response.data;
  },

  update: async (id: number, roleData: any) => {
    const response = await api.patch<IRole>(`/roles/${id}`, roleData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};
