import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Candidate, CandidateFilters, KanbanStage, PaginatedResponse, PaginationMeta } from '../../../types';
import { candidateService } from '../../../services/candidateService';
import type { RootState } from '../../../app/store';

interface CandidatesState {
    candidates: Candidate[];
    filters: CandidateFilters;
    meta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
    selectedCandidate: Candidate | null;
}

const initialState: CandidatesState = {
    candidates: [],
    filters: {},
    meta: null,
    loading: false,
    error: null,
    selectedCandidate: null,
};

// Async thunk to load candidates
export const loadCandidates = createAsyncThunk(
    'candidates/load',
    async (params: { page?: number; limit?: number; type?: 'active' | 'rejected' | 'notSelectable' } = {}, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const filters = state.candidates.filters;
        const { type = 'active', ...restParams } = params;

        try {
            let response;
            if (type === 'rejected') {
                response = await candidateService.fetch_candidates_rejected({ ...filters, ...restParams });
            } else if (type === 'notSelectable') {
                response = await candidateService.fetch_candidates_notSelectable({ ...filters, ...restParams });
            } else {
                response = await candidateService.fetch_candidates_active({ ...filters, ...restParams });
            }
            return response;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// Async thunk to update candidate stage
export const updateCandidateStage = createAsyncThunk(
    'candidates/updateStage',
    async ({ id, newStage }: { id: string; newStage: KanbanStage }, { rejectWithValue }) => {
        try {
            const updatedCandidate = await candidateService.updateCandidateStage(id, newStage);
            return updatedCandidate;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// Async thunk to load a single candidate by ID
export const loadCandidateById = createAsyncThunk(
    'candidates/loadById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await candidateService.fetchCandidateById(id);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const candidatesSlice = createSlice({
    name: 'candidates',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<CandidateFilters>) => {
            state.filters = action.payload;
        },
        selectCandidate: (state, action: PayloadAction<Candidate | null>) => {
            state.selectedCandidate = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {};
        },
        removeCandidate: (state, action: PayloadAction<string>) => {
            // Optimistically remove a candidate from the list by ID (e.g. after rejection)
            state.candidates = state.candidates.filter(c => c.id !== action.payload);
            if (state.meta) state.meta.total = Math.max(0, state.meta.total - 1);
        },
    },
    extraReducers: (builder) => {
        builder
            // Load candidates
            .addCase(loadCandidates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadCandidates.fulfilled, (state, action: PayloadAction<PaginatedResponse<Candidate>>) => {
                state.loading = false;
                state.candidates = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(loadCandidates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update candidate stage
            .addCase(updateCandidateStage.fulfilled, (state, action: PayloadAction<Candidate>) => {
                const index = state.candidates.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.candidates[index] = action.payload;
                }
                if (state.selectedCandidate?.id === action.payload.id) {
                    state.selectedCandidate = action.payload;
                }
            })
            // Load candidate by ID
            .addCase(loadCandidateById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadCandidateById.fulfilled, (state, action: PayloadAction<Candidate>) => {
                state.loading = false;
                state.selectedCandidate = action.payload;
                // Also update in list if present
                const index = state.candidates.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.candidates[index] = action.payload;
                }
            })
            .addCase(loadCandidateById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setFilters, selectCandidate, clearFilters, removeCandidate } = candidatesSlice.actions;

// Selectors
export const selectAllCandidates = (state: RootState) => state.candidates.candidates;
export const selectCandidatesLoading = (state: RootState) => state.candidates.loading;
export const selectCandidatesError = (state: RootState) => state.candidates.error;
export const selectSelectedCandidate = (state: RootState) => state.candidates.selectedCandidate;
export const selectFilters = (state: RootState) => state.candidates.filters;
export const selectCandidatesMeta = (state: RootState) => state.candidates.meta;

// Selector for unique locations from candidates (Note: This now only gets locations from CURRENT page, not all)
// Ideally backend provides this list. For now, it's partial.
export const selectCandidateLocations = (state: RootState) => {
    const locations = state.candidates.candidates.map(c => c.municipality?.name).filter(Boolean) as string[];
    return Array.from(new Set(locations)).sort();
};

// Replaces selectFilteredCandidates. Since backend filters, we just return the candidates list.
// However, the dashboard logic might need adjustment if client-side logic expects filtered list.
// The slice now holds "filtered" results directly in candidates.
export const selectFilteredCandidates = (state: RootState) => state.candidates.candidates;

export default candidatesSlice.reducer;
