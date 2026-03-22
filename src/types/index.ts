// Global TypeScript type definitions

export interface PaginationMeta {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

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

export type RequisitionStatus = 'OPEN' | 'CLOSED' | 'SUSPENDED' | 'PAUSED' | 'CANCELLED';

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

export interface Permissions {
    [module: string]: string[];
}

export interface Role {
    id: number;
    name: string;
    permissions: Permissions;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: Role | string;
    token: string;
    entityType?: 'staff' | 'candidate';
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone?: string;
    isActive?: boolean;
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
    id: string;
    firstName: string;
    lastName: string;
    idx?: string;
    nationalId: string;
    email: string;
    phone: string;
    birthDate?: string;
    altPhone?: string;
    address?: string;
    municipalityId?: number;
    municipality?: Municipality;
    profession?: string;
    educationLevel?: string;
    hasVehicle: boolean;
    vehicleDetail?: string;
    cvUrl?: string;
    videoUrl?: string;
    psychTestUrl?: string;
    driveFolderUrl?: string;
    gender?: string;
    hasChildren?: boolean;
    childrenCount?: number;
    maritalStatus?: string;
    metadata?: any;
    salesExperienceYears?: number;
    salesExperienceTypes?: string[];
    commercializedGoodsTypes?: string[];
    vehicleType?: string;
    vehicleBrandModelYear?: string;
    isVehicleOwner?: boolean;
    vehicleOwnerRelationship?: string;
    currentMonthlyIncome?: number;
    salaryAspiration?: number;
    currentCompany?: string;
    previousCompanies?: string;
    personalReferences?: any[];
    workReferences?: any[];
    stage: KanbanStage;
    currentStageId?: number;
    currentStageName?: string;
    subStatus?: string;
    daysInStage?: number;
    testUrl?: string;
    testCode?: string;
    testScore?: number;
    interviewDate?: string;
    appliedDate?: string;
    applications?: any[];
    logs?: ApplicationLog[];
    zoneId?: number;
    zone?: any;
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
    companyId?: number;
    stateId?: number;
    municipalityId?: number;
    idx?: string;
    name?: string;
    currentStageId?: number;
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
    statusReason?: string;
    statusUpdatedAt?: string;
}

export interface RequisitionFilters {
    company?: string;
    priority?: Priority;
    status?: RequisitionStatus;
    zone?: string;
    stateId?: number;
    municipalityId?: number;
    search?: string;
    page?: number;
    limit?: number;
}

export interface AuthCredentials {
    username: string;
    password: string;
}
