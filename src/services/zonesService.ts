import { Zone } from '../types';
import { api } from './api';

export const zonesService = {
    async fetchZones(companyId?: number, search?: string, page: number = 1, limit: number = 5, stateId?: number): Promise<{ data: Zone[], total: number }> {
        const response = await api.get('/zones', { params: { companyId, search, page, limit, stateId } });
        return response.data;
    },
    async fetchZoneById(id: number): Promise<Zone> {
        const response = await api.get(`/zones/${id}`);
        return response.data;
    },

    async createZone(data: Partial<Zone>): Promise<Zone> {
        const response = await api.post('/zones', data);
        return response.data;
    },

    async updateZone(id: number, data: Partial<Zone>): Promise<Zone> {
        const response = await api.put(`/zones/${id}`, data);
        return response.data;
    },

    async deleteZone(id: number): Promise<void> {
        await api.delete(`/zones/${id}`);
    }
};
