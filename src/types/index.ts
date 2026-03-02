// Global TypeScript type definitions

export type KanbanStage = 'applied' | 'eligible' | 'psychotechnical' | 'interview' | 'decision';

export type CandidateSubStatus = 'Video Solicitado' | 'Video Cargado' | 'En espera' | 'Psicotécnica Solicitada' | 'Entrevista Agendada';

export interface ApplicationLog {
    id: string;
    applicationId: string;
    stageId: number;
    status: string;
    subStatus?: string;
    comment?: string;
    userId?: string;
    createdAt: string;
}

export type Priority = 'A' | 'B' | 'C';

export type RequisitionStatus = 'activa' | 'cerrada' | 'suspendida';

export interface State {
    id: number;
    name: string;
}

export interface Municipality {
    id: number;
    name: string;
    stateId: number;
    state?: State;
}

export interface User {
    id: string; // nationalId for candidates, UUID for staff
    username: string;
    email: string;
    role: string;
    token: string;
    entityType?: 'staff' | 'candidate';
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone?: string;
    createdDate?: string;
    currentProcess?: {
        applicationId: string;
        jobTitle: string;
        stage: any;
        testUrl?: string;
    } | null;
}

export interface Candidate {
    id: string; // Internal UUID (though backend uses nationalId as ID sometimes, but let's keep string)
    firstName: string;
    lastName: string;
    idx?: string; // Relation to requisition
    nationalId: string; // Cédula
    email: string;
    phone: string;

    // Optional / Nullable fields from backend
    dob?: string;
    address?: string;
    // Location data
    municipalityId?: number;
    municipality?: Municipality;

    profession?: string;
    educationLevel?: string;

    hasVehicle: boolean;
    vehicleDetail?: string;

    cvUrl?: string;
    videoUrl?: string;
    driveFolderUrl?: string;

    // Computed / Extended fields
    stage?: KanbanStage; // Derived from applications[0].currentStage
    subStatus?: string;
    daysInStage?: number;
    testUrl?: string;
    testScore?: number;
    interviewDate?: string;

    // Extended properties for UI
    applications?: any[];
    logs?: ApplicationLog[];
    zone?: string;
    location?: string;
    rejectionReason?: string;

    createdAt: string;
    updatedAt: string;
}

export interface CandidateFilters {
    search?: string;
    nationalId?: string;
    profession?: string;
    location?: string;
    zone?: string;
    hasVehicle?: boolean;
    status?: KanbanStage;
    isRejected?: boolean;
    isNotEligible?: boolean;
    isManualRejected?: boolean;
    stateId?: number;
    municipalityId?: number;
    idx?: string; // Filter by requisition idx
    // Legacy support if needed, but prefer search
    name?: string;
}

export interface Requisition {
    id: string;
    idx: string;
    company: string;
    title: string;
    priority: Priority;
    status: RequisitionStatus;
    applicants: number;
    createdDate: string;
    department: string;
    location: string;
    zone?: string;
    route?: string;
    stateId?: number;
    municipalityId?: number;
}

export interface RequisitionFilters {
    company?: string;
    priority?: Priority;
    status?: RequisitionStatus;
    zone?: string;
    stateId?: number;
    municipalityId?: number;
}

export interface PaginationMeta {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
}

export interface AuthCredentials {
    username: string;
    password: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
