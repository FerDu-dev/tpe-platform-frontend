import { Candidate, KanbanStage, PaginatedResponse, CandidateFilters } from '../types';
import { api } from './api';

// Map backend stage names to frontend KanbanStage
const STAGE_MAPPING: Record<number, KanbanStage> = {
    1: 'applied',
    2: 'eligible',
    3: 'psychotechnical',
    4: 'interview',
    5: 'interview',
    6: 'interview',
    7: 'decision',
    8: 'decision',
};

export const STAGE_DISPLAY_MAPPING: Record<number, string> = {
    1: 'Bienvenida',
    2: 'Video',
    3: 'P. Psicotécnica',
    4: 'Entrevista Personal',
    5: 'Entrevista Técnica',
    6: 'Pruebas Médicas/AP/Ref',
    7: 'Oferta de Puesto',
    8: 'Contratación',
};

export const STAGE_COLORS: Record<number, string> = {
    1: '#1890ff', // Bienvenida -> Blue
    2: '#722ed1', // Video -> Purple
    3: '#faad14', // P. Psicotécnica -> Gold
    4: '#13c2c2', // Entrevista Personal -> Cyan
    5: '#2f54eb', // Entrevista Técnica -> Geekblue
    6: '#eb2f96', // Pruebas Médicas/AP/Ref -> Magenta
    7: '#fa8c16', // Oferta de Puesto -> Orange
    8: '#52c41a', // Contratación -> Green
};

export const SUB_STATUS_COLORS: Record<string, string> = {
    'video enviado': '#52c41a', // Green
    'video solicitado': '#1890ff', // Blue
    'pendiente': '#fa8c16', // Orange
    'en proceso': '#722ed1', // Purple
    'completado': '#52c41a', // Green
    'no elegible': '#f5222d', // Red
    'agendado': '#13c2c2', // Cyan
    'bienvenida': '#1890ff', // Blue
    'video solicitado a candidato': '#1890ff', // Blue
    'pendiente por prueba': '#fa8c16', // Orange
    'entrevista pendiente': '#722ed1', // Purple
    'entrevista técnica pendiente': '#2f54eb', // Geekblue
    'pruebas médicas/ref pendientes': '#eb2f96', // Magenta
    'oferta pendiente': '#fa8c16', // Orange
    'video cargado exitosamente': '#52c41a', // Green
    'cv cargado exitosamente': '#52c41a', // Green
};

export const getSoftTagStyle = (color: string) => ({
    background: `${color}15`,
    color: color,
    border: `1px solid ${color}50`,
    fontWeight: 600,
    borderRadius: '4px'
});

export const getStatusTagStyle = (subStatus?: string) => {
    if (!subStatus) return { borderRadius: '12px', fontWeight: 600 };
    const normalized = subStatus.toLowerCase();
    const color = SUB_STATUS_COLORS[normalized] || '#8c8c8c';
    const isSuccess = normalized.includes('exitosamente') || normalized.includes('enviado') || normalized.includes('completado');
    
    return {
        background: isSuccess ? `${color}25` : `${color}10`,
        color: color,
        border: isSuccess ? `2px solid ${color}` : `1px solid ${color}40`,
        borderRadius: '12px',
        fontWeight: 700,
        padding: '0 12px',
        boxShadow: isSuccess ? `0 0 8px ${color}40` : 'none'
    };
};

export const candidateService = {
    _mapCandidate(c: any): Candidate {
        // Prefer ACTIVE application; for rejected/notSelectable candidates pick the most recent one
        const activeApp =
            c.applications?.find((a: any) => a.status === 'ACTIVE') ||
            c.applications?.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())?.[0];
        const mappedStage = STAGE_MAPPING[activeApp?.currentStageId] || 'applied';

        const tryParse = (val: any) => {
            if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
                try { return JSON.parse(val); } catch { return val; }
            }
            return val;
        };

        return {
            id: c.id,
            idx: activeApp?.jobRequisitionId || 'N/A',
            nationalId: c.nationalId,
            firstName: c.firstName,
            lastName: c.lastName,
            profession: c.profession || 'N/A',
            birthDate: c.birthDate,
            altPhone: c.altPhone,
            address: c.address,
            educationLevel: c.educationLevel,
            gender: c.gender,
            maritalStatus: c.maritalStatus,
            hasChildren: c.hasChildren,
            childrenCount: c.childrenCount,
            metadata: c.metadata,
            stage: mappedStage,
            currentStageId: activeApp?.currentStageId,
            currentStageName: STAGE_DISPLAY_MAPPING[activeApp?.currentStageId] || 'Postulado',
            requisitionZoneName: activeApp?.jobRequisition?.zone?.name,
            subStatus: (activeApp?.logs?.[0] && (
                activeApp.logs[0].stageId === activeApp.currentStageId || 
                activeApp.logs[0].comment?.toLowerCase().includes('exitosamente')
            )) 
                ? (activeApp.logs[0].subStatus || activeApp.logs[0].comment) 
                : (activeApp?.subStatus || STAGE_DISPLAY_MAPPING[activeApp?.currentStageId]),
            hasVehicle: c.hasVehicle,
            vehicleDetail: c.vehicleDetail,

            // New Fields Mapping
            salesExperienceYears: c.salesExperienceYears,
            salesExperienceTypes: tryParse(c.salesExperienceTypes),
            commercializedGoodsTypes: tryParse(c.commercializedGoodsTypes),
            vehicleType: c.vehicleType,
            vehicleBrandModelYear: c.vehicleBrandModelYear,
            isVehicleOwner: c.isVehicleOwner,
            vehicleOwnerRelationship: c.vehicleOwnerRelationship,
            currentMonthlyIncome: c.currentMonthlyIncome,
            salaryAspiration: c.salaryAspiration,
            currentCompany: c.currentCompany,
            previousCompanies: c.previousCompanies,
            personalReferences: tryParse(c.personalReferences),
            workReferences: tryParse(c.workReferences),

            videoUrl: c.videoUrl,
            cvUrl: c.cvUrl,
            psychTestUrl: c.psychTestUrl,
            driveFolderUrl: c.driveFolderUrl,
            email: c.email,
            phone: c.phone,
            location: `${c.municipality?.name || ''} - ${c.municipality?.state?.name || ''}`.trim(),
            municipality: c.municipality,
            municipalityId: c.municipalityId,
            zone: activeApp?.jobRequisition?.zone?.name || 'N/A',
            applications: c.applications,
            logs: activeApp?.logs,
            testUrl: activeApp?.testUrl,
            testCode: activeApp?.testCode,
            testScore: activeApp?.testScore,
            interviewDate: activeApp?.interviewDate,
            appliedDate: activeApp?.createdAt || new Date().toISOString(),
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            daysInStage: activeApp?.updatedAt
                ? Math.floor((Date.now() - new Date(activeApp.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
                : 0,
            rejectionReason: activeApp?.rejectionReason
        };
    },

    async fetchCandidates(filters: CandidateFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Candidate>> {
        const response = await api.get('/candidates', { params: filters });
        const { data, meta } = response.data;
        return { data: data.map((c: any) => this._mapCandidate(c)), meta };
    },

    async fetchCandidateById(id: string): Promise<Candidate> {
        const response = await api.get(`/candidates/${id}`);
        return this._mapCandidate(response.data);
    },

    async fetchCandidateProfile(): Promise<Candidate> {
        const response = await api.get('/candidates/profile');
        return this._mapCandidate(response.data);
    },

    async fetchCandidateCurrentProcess(): Promise<any> {
        const response = await api.get('/candidates/current-process');
        return response.data;
    },

    async fetch_candidates_active(filters: CandidateFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Candidate>> {
        const response = await api.get('/candidates', { params: filters });
        const { data, meta } = response.data;
        return { data: data.map((c: any) => this._mapCandidate(c)), meta };
    },

    async fetch_candidates_rejected(filters: CandidateFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Candidate>> {
        const response = await api.get('/candidates_rejected', { params: filters });
        const { data, meta } = response.data;
        return { data: data.map((c: any) => this._mapCandidate(c)), meta };
    },

    async fetch_candidates_notSelectable(filters: CandidateFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Candidate>> {
        const response = await api.get('/candidates_notSelectable', { params: filters });
        const { data, meta } = response.data;
        return { data: data.map((c: any) => this._mapCandidate(c)), meta };
    },

    async updateCandidateStage(id: string, newStage: number | KanbanStage, options?: { comment?: string; subStatus?: string; testLink?: string; testCode?: string; testScore?: number }): Promise<Candidate> {
        const FRONTEND_TO_BACKEND_STAGE: Record<KanbanStage, number> = {
            'applied': 1,
            'eligible': 2,
            'psychotechnical': 3,
            'interview': 4,
            'decision': 5
        };

        const targetStageId = typeof newStage === 'number' ? newStage : FRONTEND_TO_BACKEND_STAGE[newStage];

        try {
            const response = await api.get(`/candidates/${id}`);
            const fullCandidate = response.data;
            const appId = fullCandidate.applications?.find((a: any) => a.status === 'ACTIVE')?.id || fullCandidate.applications?.[0]?.id;

            if (!appId) throw new Error('No application found for candidate');

            await api.patch(`/applications/${appId}/stage`, {
                targetStageId,
                ...options
            });

            // Re-fetch to get updated state
            const updated = await this.fetch_candidates_active({ nationalId: id });
            return updated.data[0];
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    async updateSubStatus(candidateId: string, subStatus: string, comment?: string): Promise<Candidate> {
        const response = await api.get(`/candidates/${candidateId}`);
        const appId = response.data.applications?.find((a: any) => a.status === 'ACTIVE')?.id || response.data.applications?.[0]?.id;

        await api.patch(`/applications/${appId}/sub-status`, { subStatus, comment });

        const updated = await this.fetch_candidates_active({ nationalId: candidateId });
        return updated.data[0];
    },

    async rejectCandidate(candidateId: string, reason: string): Promise<void> {
        const response = await api.get(`/candidates/${candidateId}`);
        const appId = response.data.applications?.find((a: any) => a.status === 'ACTIVE')?.id || response.data.applications?.[0]?.id;

        if (!appId) throw new Error('No se encontró aplicación para rechazar');

        await api.post(`/applications/${appId}/reject`, { reason });
        // No re-fetch here — caller is responsible for updating state
    },

    async registerCandidate(formData: FormData): Promise<any> {
        const response = await api.post('/candidates/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async rescueCandidate(applicationId: string): Promise<any> {
        const response = await api.patch(`/applications/${applicationId}/rescue`);
        return response.data;
    },

    async resendDocumentationRequest(candidateId: string, type: 'CV' | 'Video' | 'PsychTest'): Promise<any> {
        const response = await api.post(`/candidates/${candidateId}/resend-docs`, { type });
        return response.data;
    },

    async uploadCandidateDocument(candidateId: string, type: 'CV' | 'Video' | 'PsychTest', file: File | any): Promise<any> {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);
        const response = await api.post(`/candidates/${candidateId}/upload-doc`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async completePsychotechnicalTest(applicationId: string): Promise<any> {
        const response = await api.post(`/applications/${applicationId}/complete-test`);
        return response.data;
    },

    async updateCandidate(id: string, data: any): Promise<Candidate> {
        const response = await api.put(`/candidates/${id}`, data);
        return this._mapCandidate(response.data);
    },

    async updateApplicationRequisition(candidateId: string, jobRequisitionId: number): Promise<Candidate> {
        const response = await api.get(`/candidates/${candidateId}`);
        const appId = response.data.applications?.find((a: any) => a.status === 'ACTIVE')?.id || response.data.applications?.[0]?.id;

        if (!appId) throw new Error('No se encontró aplicación activa');

        await api.patch(`/applications/${appId}/requisition`, { jobRequisitionId });

        // Re-fetch to get updated state
        return this.fetchCandidateById(candidateId);
    },

    async hireCandidate(candidateId: string, effectiveStartDate: string, comment?: string): Promise<void> {
        const response = await api.get(`/candidates/${candidateId}`);
        const appId = response.data.applications?.find((a: any) => a.status === 'ACTIVE')?.id || response.data.applications?.[0]?.id;

        if (!appId) throw new Error('No se encontró aplicación para contratar');

        await api.post(`/applications/${appId}/hire`, { effectiveStartDate, comment });
    },
};
