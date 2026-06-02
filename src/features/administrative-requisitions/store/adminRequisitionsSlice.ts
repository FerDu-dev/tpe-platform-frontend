import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdministrativeRequisition, AdministrativeRequisitionFilters, PaginationMeta, PaginatedResponse } from '../../../types';
import { administrativeRequisitionService } from '../../../services/administrativeRequisitionService';
import type { RootState } from '../../../app/store';

interface RequisitionsState {
    requisitions: AdministrativeRequisition[];
    filters: AdministrativeRequisitionFilters;
    meta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
    analytics: {
        totalActiveParticipants: number;
        totalHiredParticipants: number;
        totalRejected: number;
        totalNotEligible: number;
        countsByStage: Record<number, number>;
        countsByState: Record<string, number>;
        advanceRate?: number;
        requisitionAnalytics?: {
            status: Record<string, number>;
            priority: Record<string, number>;
        };
    } | null;
    analyticsLoading: boolean;
}

const initialState: RequisitionsState = {
    requisitions: [],
    filters: { status: 'OPEN' },
    meta: null,
    loading: false,
    error: null,
    analytics: null,
    analyticsLoading: false,
};

// Async thunk to load requisitions
export const loadRequisitions = createAsyncThunk(
    'adminRequisitions/load',
    async (params: { page?: number; limit?: number; status?: string } & AdministrativeRequisitionFilters = {}, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const filters = state.adminRequisitions.filters;
        
        // Sanitize: Exclude jobRequisitionId as the list endpoint doesn't support it as a filter
        const { jobRequisitionId, ...cleanFilters } = { ...filters, ...params } as any;

        try {
            const response = await administrativeRequisitionService.fetchRequisitions(cleanFilters);
            return response;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const createRequisition = createAsyncThunk(
    'adminRequisitions/create',
    async (data: Partial<AdministrativeRequisition>, { rejectWithValue }) => {
        try {
            return await administrativeRequisitionService.createRequisition(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateRequisition = createAsyncThunk(
    'adminRequisitions/update',
    async ({ id, data }: { id: number | string; data: Partial<AdministrativeRequisition> }, { rejectWithValue }) => {
        try {
            return await administrativeRequisitionService.updateRequisition(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk to load recruitment analytics
export const loadRecruitmentAnalytics = createAsyncThunk(
    'adminRequisitions/loadAnalytics',
    async (params: { companyId?: number; stateId?: number; status?: string; jobRequisitionId?: number; excludeRejected?: boolean } = {}, { rejectWithValue }) => {
        try {
            return await administrativeRequisitionService.fetchRecruitmentAnalytics(params);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// Async thunk to delete a requisition
export const deleteRequisition = createAsyncThunk(
    'adminRequisitions/delete',
    async (id: number | string, { rejectWithValue }) => {
        try {
            await administrativeRequisitionService.deleteRequisition(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const requisitionsSlice = createSlice({
    name: 'adminRequisitions',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<AdministrativeRequisitionFilters>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = { status: state.filters.status || 'OPEN' };
        },
        addRequisition: (state, action: PayloadAction<AdministrativeRequisition>) => {
            state.requisitions.unshift(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadRequisitions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadRequisitions.fulfilled, (state, action: PayloadAction<PaginatedResponse<AdministrativeRequisition>>) => {
                state.loading = false;
                state.requisitions = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(loadRequisitions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createRequisition.fulfilled, (state, action: PayloadAction<AdministrativeRequisition>) => {
                state.requisitions.unshift(action.payload);
            })
            .addCase(updateRequisition.fulfilled, (state, action: PayloadAction<AdministrativeRequisition>) => {
                const index = state.requisitions.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.requisitions[index] = action.payload;
                }
            })
            // Analytics
            .addCase(loadRecruitmentAnalytics.pending, (state) => {
                state.analyticsLoading = true;
            })
            .addCase(loadRecruitmentAnalytics.fulfilled, (state, action: PayloadAction<any>) => {
                state.analyticsLoading = false;
                state.analytics = action.payload;
            })
            .addCase(loadRecruitmentAnalytics.rejected, (state) => {
                state.analyticsLoading = false;
            })
            .addCase(deleteRequisition.fulfilled, (state, action: PayloadAction<number | string>) => {
                state.requisitions = state.requisitions.filter(r => r.id !== action.payload);
            });
    },
});

export const { addRequisition, setFilters, clearFilters } = requisitionsSlice.actions;

// Selectors
export const selectRequisitions = (state: RootState) => state.adminRequisitions.requisitions;
export const selectRequisitionsLoading = (state: RootState) => state.adminRequisitions.loading;
export const selectRequisitionsError = (state: RootState) => state.adminRequisitions.error;
export const selectRequisitionsMeta = (state: RootState) => state.adminRequisitions.meta;
export const selectRequisitionsFilters = (state: RootState) => state.adminRequisitions.filters;
export const selectRecruitmentAnalytics = (state: RootState) => state.adminRequisitions.analytics;
export const selectAnalyticsLoading = (state: RootState) => state.adminRequisitions.analyticsLoading;

export default requisitionsSlice.reducer;
