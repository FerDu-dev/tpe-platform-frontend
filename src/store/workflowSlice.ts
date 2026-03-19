import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Stage } from '../types';
import { workflowService } from '../services/workflowService';

interface WorkflowState {
  stages: Stage[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkflowState = {
  stages: [],
  loading: false,
  error: null,
};

export const loadStages = createAsyncThunk(
  'workflow/loadStages',
  async (workflowId: number, { rejectWithValue }) => {
    try {
      return await workflowService.getStages(workflowId);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadStages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadStages.fulfilled, (state, action: PayloadAction<Stage[]>) => {
        state.loading = false;
        state.stages = action.payload;
      })
      .addCase(loadStages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectStages = (state: { workflow: WorkflowState }) => state.workflow.stages;
export const selectStagesLoading = (state: { workflow: WorkflowState }) => state.workflow.loading;

export default workflowSlice.reducer;
