import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Requisition, RequisitionFilters, PaginationMeta, PaginatedResponse } from '../../../types';
import { requisitionService } from '../../../services/requisitionService';
import type { RootState } from '../../../app/store';

interface RequisitionsState {
    requisitions: Requisition[];
    filters: RequisitionFilters;
    meta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
    analytics: {
        totalParticipants: number;
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
    'requisitions/load',
    async (params: { page?: number; limit?: number; status?: string } & RequisitionFilters = {}, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const filters = state.requisitions.filters;
        try {
            const response = await requisitionService.fetchRequisitions({ ...filters, ...params });
            return response;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const createRequisition = createAsyncThunk(
    'requisitions/create',
    async (data: Partial<Requisition>, { rejectWithValue }) => {
        try {
            return await requisitionService.createRequisition(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk to load recruitment analytics
export const loadRecruitmentAnalytics = createAsyncThunk(
    'requisitions/loadAnalytics',
    async (params: { companyId?: number; stateId?: number; status?: string; jobRequisitionId?: number } = {}, { rejectWithValue }) => {
        try {
            return await requisitionService.fetchRecruitmentAnalytics(params);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const requisitionsSlice = createSlice({
    name: 'requisitions',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<RequisitionFilters>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = { status: state.filters.status || 'OPEN' };
        },
        addRequisition: (state, action: PayloadAction<Requisition>) => {
            state.requisitions.unshift(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadRequisitions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadRequisitions.fulfilled, (state, action: PayloadAction<PaginatedResponse<Requisition>>) => {
                state.loading = false;
                state.requisitions = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(loadRequisitions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createRequisition.fulfilled, (state, action: PayloadAction<Requisition>) => {
                state.requisitions.unshift(action.payload);
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
            });
    },
});

export const { addRequisition, setFilters, clearFilters } = requisitionsSlice.actions;

// Selectors
export const selectRequisitions = (state: RootState) => state.requisitions.requisitions;
export const selectRequisitionsLoading = (state: RootState) => state.requisitions.loading;
export const selectRequisitionsError = (state: RootState) => state.requisitions.error;
export const selectRequisitionsMeta = (state: RootState) => state.requisitions.meta;
export const selectRequisitionsFilters = (state: RootState) => state.requisitions.filters;
export const selectRecruitmentAnalytics = (state: RootState) => state.requisitions.analytics;
export const selectAnalyticsLoading = (state: RootState) => state.requisitions.analyticsLoading;

export default requisitionsSlice.reducer;
