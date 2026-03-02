import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { User } from '../../../types';
import { MOCK_USERS } from '../../../utils/mockData';

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_USERS;
});

// Async thunk to update user profile
export const updateUserProfile = createAsyncThunk(
    'users/updateProfile',
    async (updatedUser: Partial<User> & { id: string }) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        return updatedUser;
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Load users
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
            // Update user profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = { ...state.users[index], ...action.payload };
                }
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update profile';
            });
    },
});

// Selectors
export const selectUsers = (state: RootState) => state.users.users;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;

export default usersSlice.reducer;
