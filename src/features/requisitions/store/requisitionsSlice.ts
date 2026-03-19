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
}

const initialState: RequisitionsState = {
    requisitions: [],
    filters: {},
    meta: null,
    loading: false,
    error: null,
};

// Async thunk to load requisitions
// Now accepts params optionally
export const loadRequisitions = createAsyncThunk(
    'requisitions/load',
    async (params: { page?: number; limit?: number } = {}, { getState, rejectWithValue }) => {
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

const requisitionsSlice = createSlice({
    name: 'requisitions',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<RequisitionFilters>) => {
            state.filters = action.payload;
            // When filters change, we sort of need to reload. 
            // In a real app we might want to trigger loadRequisitions here or in the component.
            // For now just setting state.
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
            });
    },
});

export const { addRequisition, setFilters } = requisitionsSlice.actions;

// Selectors
export const selectRequisitions = (state: RootState) => state.requisitions.requisitions;
export const selectRequisitionsLoading = (state: RootState) => state.requisitions.loading;
export const selectRequisitionsError = (state: RootState) => state.requisitions.error;
export const selectRequisitionsMeta = (state: RootState) => state.requisitions.meta;
export const selectRequisitionsFilters = (state: RootState) => state.requisitions.filters;

export default requisitionsSlice.reducer;
