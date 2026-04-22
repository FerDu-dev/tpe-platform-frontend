import { Requisition, RequisitionFilters, PaginatedResponse } from '../types';
import { api } from './api';

export const requisitionService = {
    async fetchRequisitions(filters: RequisitionFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Requisition>> {
        const response = await api.get('/requisitions', { params: filters });
        const { data, meta } = response.data;

        const mappedRequisitions = data.map((r: any) => ({
            id: r.id,
            idx: r.id,
            company: r.company?.name || 'Compañía',
            companyId: r.companyId,
            title: r.title,
            priority: r.priority,
            status: r.status,
            applicants: r._count?.applications || 0,
            filledCount: r.filledCount || 0,
            vacanciesCount: r.vacanciesCount || 0,
            createdDate: r.createdAt,
            department: r.department || 'N/A',
            stateId: r.stateId,
            municipalityId: r.municipalityId,
            zoneId: r.zoneId,
            requestedBy: r.requestedBy,
            location: r.municipality ? `${r.municipality.name} - ${r.state?.name || ''}` : (r.state?.name || 'N/A'),
            zone: r.zone,
            state: r.state,
            route: r.zone?.geographicRoute || 'N/A'
        }));

        return {
            data: mappedRequisitions,
            meta
        };
    },
    async createRequisition(data: Partial<Requisition>): Promise<Requisition> {
        const response = await api.post('/requisitions', data);
        const r = response.data;
        return {
            id: r.id,
            idx: r.id,
            company: r.company?.name || 'Compañía',
            companyId: r.companyId,
            title: r.title,
            priority: r.priority,
            status: r.status,
            applicants: 0,
            filledCount: r.filledCount || 0,
            vacanciesCount: r.vacanciesCount || 0,
            createdDate: r.createdAt,
            department: r.department || 'N/A',
            location: r.municipality ? `${r.municipality.name} - ${r.state?.name || ''}` : (r.state?.name || 'N/A'),
            zone: r.zone,
            state: r.state,
            zoneId: r.zoneId,
            route: r.zone?.geographicRoute || 'N/A',
            stateId: r.stateId,
            municipalityId: r.municipalityId,
            requestedBy: r.requestedBy,
        } as Requisition;
    },
    async findOne(id: string): Promise<any> {
        const response = await api.get(`/requisitions/${id}`);
        return response.data;
    },
    async fetchRecruitmentAnalytics(filters: { companyId?: number; stateId?: number; status?: string; jobRequisitionId?: number } = {}): Promise<any> {
        const response = await api.get('/applications/analytics', { params: filters });
        return response.data;
    },
    async pause(id: number | string, reason: string): Promise<any> {
        const response = await api.patch(`/requisitions/${id}/pause`, { reason });
        return response.data;
    },
    async cancel(id: number | string, reason: string): Promise<any> {
        const response = await api.patch(`/requisitions/${id}/cancel`, { reason });
        return response.data;
    },
    async reactivate(id: number | string): Promise<any> {
        const response = await api.patch(`/requisitions/${id}/reactivate`, {});
        return response.data;
    },
    async updateRequisition(id: number | string, data: Partial<Requisition>): Promise<Requisition> {
        const response = await api.put(`/requisitions/${id}`, data);
        const r = response.data;
        return {
            id: r.id,
            idx: r.id,
            company: r.company?.name || 'Compañía',
            companyId: r.companyId,
            title: r.title,
            priority: r.priority,
            status: r.status,
            applicants: 0, // Reset or fetch if needed, but usually UI reloads
            filledCount: r.filledCount || 0,
            vacanciesCount: r.vacanciesCount || 0,
            createdDate: r.createdAt,
            department: r.department || 'N/A',
            location: r.municipality ? `${r.municipality.name} - ${r.state?.name || ''}` : (r.state?.name || 'N/A'),
            zone: r.zone,
            state: r.state,
            zoneId: r.zoneId,
            route: r.zone?.geographicRoute || 'N/A',
            stateId: r.stateId,
            municipalityId: r.municipalityId,
            requestedBy: r.requestedBy,
        } as Requisition;
    },
    async deleteRequisition(id: number | string): Promise<void> {
        await api.delete(`/requisitions/${id}`);
    },
};
