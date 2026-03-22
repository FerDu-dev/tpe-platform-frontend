import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { User } from '../../../types';
import { usersService } from '../../../services/usersService';

interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
};

// Async thunk to load users
export const loadUsers = createAsyncThunk('users/loadUsers', async () => {
    return await usersService.getAll();
});

// Async thunk to create user
export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData: any) => {
        return await usersService.create(userData);
    }
);

// Async thunk to update user
export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, data }: { id: string; data: any }) => {
        return await usersService.update(id, data);
    }
);

// Async thunk to delete user
export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id: string) => {
        await usersService.delete(id);
        return id;
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(loadUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to load users';
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.unshift(action.payload);
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter((u) => u.id !== action.payload);
            });
    },
});

// Selectors
export const selectUsers = (state: RootState) => state.users.users;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;

export default usersSlice.reducer;
