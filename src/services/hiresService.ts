import { api } from './api';
import { PaginatedResponse, Candidate, Requisition } from '../types';
import { candidateService } from './candidateService';

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
            data: data.map((app: any) => ({
                id: app.id,
                candidate: candidateService._mapCandidate(app.candidate),
                jobRequisition: app.jobRequisition,
                hiredAt: app.hiredAt,
                effectiveStartDate: app.effectiveStartDate,
                status: app.status
            })),
            meta
        };
    }
};
