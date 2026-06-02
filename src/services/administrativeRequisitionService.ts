import { AdministrativeRequisition, AdministrativeRequisitionFilters, PaginatedResponse } from '../types';
import { api } from './api';

const mapRequisition = (r: any): AdministrativeRequisition => ({
    id: r.id,
    idx: r.id,
    company: r.company?.name || 'Compañía',
    companyId: r.companyId,
    requestedBy: r.requestedBy,
    priority: r.priority,
    type: r.type || 'N/A',
    department: r.department || 'N/A',
    position: r.position || 'N/A',
    levelAndStep: r.levelAndStep,
    country: r.country,
    stateId: r.stateId,
    state: r.state,
    schedule: r.schedule,
    isConfidential: r.isConfidential,
    requestDate: r.requestDate || r.createdAt,
    comments: r.comments,
    status: r.status,
    statusReason: r.statusReason,
    statusUpdatedAt: r.statusUpdatedAt,
    vacanciesCount: r.vacanciesCount || 0,
    filledCount: r.filledCount || 0,
    applicants: r._count?.applications || 0,
    createdDate: r.createdAt,
    createdAt: r.createdAt,
});

export const administrativeRequisitionService = {
    async fetchRequisitions(filters: AdministrativeRequisitionFilters = {}): Promise<PaginatedResponse<AdministrativeRequisition>> {
        try {
            const response = await api.get('/administrative-requisitions', { params: filters });
            console.log('Administrative Requisitions Response:', response.data);
            const { data, meta } = response.data;

            return {
                data: (data || []).map(mapRequisition),
                meta
            };
        } catch (error) {
            console.error('Error in administrativeRequisitionService.fetchRequisitions:', error);
            throw error;
        }
    },
    async createRequisition(data: Partial<AdministrativeRequisition>): Promise<AdministrativeRequisition> {
        const response = await api.post('/administrative-requisitions', data);
        return mapRequisition(response.data);
    },
    async findOne(id: string | number): Promise<AdministrativeRequisition> {
        const response = await api.get(`/administrative-requisitions/${id}`);
        return mapRequisition(response.data);
    },
    async fetchRecruitmentAnalytics(filters: { companyId?: number; stateId?: number; status?: string; jobRequisitionId?: number; excludeRejected?: boolean } = {}): Promise<any> {
        // Analytics can remain hitting the shared/general endpoint if needed, but for isolation let's hit administrative-candidates if available.
        // Assuming it's still using applications/analytics for now.
        const response = await api.get('/applications/analytics', { params: filters });
        return response.data;
    },
    async pause(id: number | string, reason: string): Promise<any> {
        const response = await api.patch(`/administrative-requisitions/${id}/pause`, { reason });
        return response.data;
    },
    async cancel(id: number | string, reason: string): Promise<any> {
        const response = await api.patch(`/administrative-requisitions/${id}/cancel`, { reason });
        return response.data;
    },
    async reactivate(id: number | string): Promise<any> {
        const response = await api.patch(`/administrative-requisitions/${id}/reactivate`, {});
        return response.data;
    },
    async updateRequisition(id: number | string, data: Partial<AdministrativeRequisition>): Promise<AdministrativeRequisition> {
        const response = await api.put(`/administrative-requisitions/${id}`, data);
        return mapRequisition(response.data);
    },
    async deleteRequisition(id: number | string): Promise<void> {
        await api.delete(`/administrative-requisitions/${id}`);
    },
    async fetch_candidates_active(params: { stageId?: number; status?: string } = {}): Promise<any> {
        const response = await api.get('/administrative-candidates', { params });
        return response.data;
    },
    async fetchCandidateByNationalId(nationalId: string): Promise<any> {
        const response = await api.get(`/administrative-candidates/profile/${nationalId}`);
        return response.data;
    },
};
