import { api } from './api';
import { User } from '../types';

export const usersService = {
  getAll: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (userData: any) => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  update: async (id: string, userData: any) => {
    const response = await api.patch<User>(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
