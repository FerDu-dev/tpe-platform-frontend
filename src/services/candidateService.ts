import { Candidate, KanbanStage, PaginatedResponse, CandidateFilters } from '../types';
import { api } from './api';

// Map backend stage names to frontend KanbanStage
const STAGE_MAPPING: Record<number, KanbanStage> = {
    1: 'applied',
    2: 'eligible',
    3: 'psychotechnical',
    4: 'interview',
    5: 'decision',
};

export const candidateService = {
    async fetchCandidates(filters: CandidateFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Candidate>> {
        const response = await api.get('/candidates', { params: filters });
        const { data, meta } = response.data;

        const mappedCandidates = data.map((c: any) => {
            const activeApp = c.applications?.[0]; // backend currentStageId should match our mapping
            const mappedStage = STAGE_MAPPING[activeApp?.currentStageId] || 'applied';

            return {
                id: c.nationalId,
                idx: activeApp?.jobRequisitionId || 'N/A',
                nationalId: c.nationalId,
                firstName: c.firstName,
                lastName: c.lastName,
                profession: c.profession || 'N/A',
                stage: mappedStage,
                subStatus: activeApp?.subStatus,
                hasVehicle: c.hasVehicle,
                vehicleDetail: c.vehicleDetail,
                videoUrl: c.videoUrl,
                cvUrl: c.cvUrl,
                email: c.email,
                phone: c.phone,
                location: `${c.municipality?.name || ''} - ${c.municipality?.state?.name || ''}`.trim(),
                municipality: c.municipality,
                municipalityId: c.municipalityId,
                zone: activeApp?.jobRequisition?.zone?.name || 'N/A',
                applications: c.applications,
                logs: activeApp?.logs, // Include logs for the timeline
                testUrl: activeApp?.testUrl,
                testScore: activeApp?.testScore,
                interviewDate: activeApp?.interviewDate,
                appliedDate: activeApp?.createdAt || new Date().toISOString(),
                daysInStage: activeApp?.updatedAt
                    ? Math.floor((Date.now() - new Date(activeApp.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
                    : 0,
                rejectionReason: activeApp?.rejectionReason
            };
        });

        return { data: mappedCandidates, meta };
    },

    async updateCandidateStage(id: string, newStage: KanbanStage, options?: { comment?: string; subStatus?: string; testLink?: string; testScore?: number }): Promise<Candidate> {
        const FRONTEND_TO_BACKEND_STAGE: Record<KanbanStage, number> = {
            'applied': 1,
            'eligible': 2,
            'psychotechnical': 3,
            'interview': 4,
            'decision': 5
        };

        const targetStageId = FRONTEND_TO_BACKEND_STAGE[newStage];

        try {
            const response = await api.get(`/candidates/${id}`);
            const fullCandidate = response.data;
            const appId = fullCandidate.applications?.[0]?.id;

            if (!appId) throw new Error('No active application found for candidate');

            await api.patch(`/applications/${appId}/stage`, {
                targetStageId,
                ...options
            });

            // Re-fetch to get updated state with logs etc
            const updated = await this.fetchCandidates({ nationalId: id });
            return updated.data[0];
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    async updateSubStatus(candidateId: string, subStatus: string, comment?: string): Promise<Candidate> {
        const response = await api.get(`/candidates/${candidateId}`);
        const appId = response.data.applications?.[0]?.id;

        await api.patch(`/applications/${appId}/sub-status`, { subStatus, comment });

        const updated = await this.fetchCandidates({ nationalId: candidateId });
        return updated.data[0];
    },

    async rejectCandidate(candidateId: string, reason: string): Promise<Candidate> {
        const response = await api.get(`/candidates/${candidateId}`);
        const appId = response.data.applications?.[0]?.id;

        await api.post(`/applications/${appId}/reject`, { reason });

        const updated = await this.fetchCandidates({ nationalId: candidateId });
        return updated.data[0];
    },

    async registerCandidate(formData: FormData): Promise<any> {
        const response = await api.post('/candidates/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
