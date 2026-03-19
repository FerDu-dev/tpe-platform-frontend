// Global TypeScript type definitions

export type KanbanStage = 'applied' | 'eligible' | 'psychotechnical' | 'interview' | 'decision';

export interface Stage {
    id: number;
    workflowId: number;
    name: string;
    order: number;
    emailTemplate?: string;
    requiresVideoUpload: boolean;
    config?: any;
    createdAt: string;
    updatedAt: string;
}

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

export interface Zone {
  id: number;
  name: string;
  companyId: number;
  region?: string;
  coordinator?: string;
  coordinatorNum?: string;
  geographicRoute?: string;
  stateId?: number;
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
        testCode?: string;
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
    birthDate?: string;
    altPhone?: string;
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

    metadata?: {
        gender?: string;
        hasChildren?: boolean;
        childrenCount?: number;
        maritalStatus?: string;
        salesExperience?: boolean;
    };

    // Computed / Extended fields
    stage: KanbanStage; // Derived from STAGE_MAPPING for Kanban board
    currentStageId?: number; // Raw ID from backend (1-8)
    currentStageName?: string; // Raw name from backend (e.g., "Video")
    subStatus?: string;
    daysInStage?: number;
    testUrl?: string;
    testCode?: string;
    testScore?: number;
    interviewDate?: string;
    appliedDate?: string;

    // Extended properties for UI
    applications?: any[];
    logs?: ApplicationLog[];
  zoneId?: number;
  zone?: any; // Can be string or Zone object
  location?: string;
  rejectionReason?: string;
  requisitionZoneName?: string;
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
    stageId?: number;
    jobRequisitionId?: number;
    stateId?: number;
    municipalityId?: number;
    idx?: string;
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
    zone?: any;
    zoneId: number;
    companyId: number;
    route?: string;
    stateId?: number;
    municipalityId?: number;
    stateName?: string;
    municipalityName?: string;
    requestedBy?: string;
    matchingCandidates?: Candidate[];
}

export interface RequisitionFilters {
    company?: string;
    priority?: Priority;
    status?: RequisitionStatus;
    zone?: string;
    stateId?: number;
    municipalityId?: number;
    search?: string;
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
