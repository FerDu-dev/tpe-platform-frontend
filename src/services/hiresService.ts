import { api } from './api';
import { PaginatedResponse, Candidate, Requisition } from '../types';

export interface HireRecord {
    id: string;
    candidate: Candidate;
    jobRequisition: Requisition;
    hiredAt: string;
    effectiveStartDate: string;
    status: string;
}

export const hiresService = {
    async fetchHires(filters: { search?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<HireRecord>> {
        const response = await api.get('/applications', {
            params: {
                ...filters,
                status: 'HIRED'
            }
        });
        
        const { data, meta } = response.data;
        
        return {
            data: data.map((app: any) => {
                const rawCandidate = app.salesCandidate || app.administrativeCandidate || {};
                const rawRequisition = app.salesRequisition || app.administrativeRequisition || {};
                
                return {
                    id: app.id,
                    candidate: rawCandidate,
                    jobRequisition: {
                        ...rawRequisition,
                        title: rawRequisition.title || rawRequisition.position || 'N/A',
                        company: rawRequisition.company?.name || rawRequisition.company || 'N/A',
                        zone: rawRequisition.zone?.name || rawRequisition.zone || 'N/A'
                    },
                    hiredAt: app.hiredAt,
                    effectiveStartDate: app.effectiveStartDate,
                    status: app.status
                };
            }),
            meta
        };
    }
};
