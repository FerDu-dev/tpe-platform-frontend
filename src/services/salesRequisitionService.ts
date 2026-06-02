import { Requisition, RequisitionFilters, PaginatedResponse } from '../types';
import { api } from './api';

const mapRequisition = (r: any): Requisition => ({
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
    route: r.zone?.geographicRoute || 'N/A',
    state: r.state,
    comments: r.comments,
    isConfidential: r.isConfidential,
    createdAt: r.createdAt,
    // Optional fields for detail view
    matchingCandidates: r.matchingCandidates,
    statusReason: r.statusReason,
    statusUpdatedAt: r.statusUpdatedAt,
    applications: r.applications
} as Requisition);

export const salesRequisitionService = {
    async fetchRequisitions(filters: RequisitionFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Requisition>> {
        const response = await api.get('/sales-requisitions', { params: filters });
        const { data, meta } = response.data;

        return {
            data: data.map(mapRequisition),
            meta
        };
    },
    async createRequisition(data: Partial<Requisition>): Promise<Requisition> {
        const response = await api.post('/sales-requisitions', data);
        return mapRequisition(response.data);
    },
    async findOne(id: string): Promise<Requisition> {
        const response = await api.get(`/sales-requisitions/${id}`);
        return mapRequisition(response.data);
    },
    async fetchRecruitmentAnalytics(filters: { companyId?: number; stateId?: number; status?: string; jobRequisitionId?: number; excludeRejected?: boolean } = {}): Promise<any> {
        const response = await api.get('/applications/analytics', { params: filters });
        return response.data;
    },
    async pause(id: number | string, reason: string): Promise<any> {
        const response = await api.patch(`/sales-requisitions/${id}/pause`, { reason });
        return response.data;
    },
    async cancel(id: number | string, reason: string): Promise<any> {
        const response = await api.patch(`/sales-requisitions/${id}/cancel`, { reason });
        return response.data;
    },
    async reactivate(id: number | string): Promise<any> {
        const response = await api.patch(`/sales-requisitions/${id}/reactivate`, {});
        return response.data;
    },
    async updateRequisition(id: number | string, data: Partial<Requisition>): Promise<Requisition> {
        const response = await api.put(`/sales-requisitions/${id}`, data);
        return mapRequisition(response.data);
    },
    async deleteRequisition(id: number | string): Promise<void> {
        await api.delete(`/sales-requisitions/${id}`);
    },
    async fetch_candidates_active(params: { stageId?: number; status?: string } = {}): Promise<any> {
        const response = await api.get('/sales-candidates', { params });
        return response.data;
    },
    async fetchCandidateByNationalId(nationalId: string): Promise<any> {
        const response = await api.get(`/sales-candidates/profile/${nationalId}`);
        return response.data;
    },
};
