import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthCredentials } from '../../../types';
import { authService } from '../../../services/authService';
import type { RootState } from '../../../app/store';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

// Initialize from local storage
const userStr = localStorage.getItem('user');
let user: User | null = null;
if (userStr) {
    try {
        user = JSON.parse(userStr);
    } catch (e) {
        console.error('Error parsing user from local storage', e);
    }
}

const initialState: AuthState = {
    user: user,
    isAuthenticated: !!user,
    loading: false,
    error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: AuthCredentials, { rejectWithValue }) => {
        try {
            const user = await authService.login(credentials);
            return user;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const loginCandidate = createAsyncThunk(
    'auth/loginCandidate',
    async (credentials: AuthCredentials, { rejectWithValue }) => {
        try {
            const user = await authService.loginCandidate(credentials);
            return user;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await authService.logout();
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload as string;
            })
            // Candidate Login
            .addCase(loginCandidate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginCandidate.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginCandidate.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload as string;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            });
    },
});

export const { setCredentials, clearError } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
