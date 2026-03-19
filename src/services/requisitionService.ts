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
            title: r.title,
            priority: r.priority, // Matches 'A'|'B'|'C'
            status: r.status === 'OPEN' ? 'activa' : (r.status === 'CLOSED' ? 'cerrada' : 'suspendida'),
            applicants: r._count?.applications || 0,
            createdDate: r.createdAt,
            department: 'Ventas',
            location: r.municipality ? `${r.municipality.name} - ${r.state?.name || ''}` : (r.state?.name || 'N/A'),
            zone: r.zone?.name || 'N/A',
            route: 'N/A'
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
            title: r.title,
            priority: r.priority,
            status: r.status === 'OPEN' ? 'activa' : (r.status === 'CLOSED' ? 'cerrada' : 'suspendida'),
            applicants: 0,
            createdDate: r.createdAt,
            department: 'Ventas',
            location: r.municipality ? `${r.municipality.name} - ${r.state?.name || ''}` : (r.state?.name || 'N/A'),
            zone: r.zone?.name || 'N/A',
            route: 'N/A',
            stateId: r.stateId,
            municipalityId: r.municipalityId,
            requestedBy: r.requestedBy,
        } as Requisition;
    },
};
