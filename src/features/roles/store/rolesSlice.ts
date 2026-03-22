import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { rolesService, IRole } from '../../../services/rolesService';

interface RolesState {
  roles: IRole[];
  loading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
};

export const loadRoles = createAsyncThunk('roles/loadRoles', async () => {
  return await rolesService.getAll();
});

export const createRole = createAsyncThunk('roles/createRole', async (roleData: any) => {
  return await rolesService.create(roleData);
});

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ id, data }: { id: number; data: any }) => {
    return await rolesService.update(id, data);
  }
);

export const deleteRole = createAsyncThunk('roles/deleteRole', async (id: number) => {
  await rolesService.delete(id);
  return id;
});

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadRoles.fulfilled, (state, action: PayloadAction<IRole[]>) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(loadRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load roles';
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.roles.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
      });
  },
});

export const selectRoles = (state: RootState) => state.roles.roles;
export const selectRolesLoading = (state: RootState) => state.roles.loading;

export default rolesSlice.reducer;
