import { AuthCredentials, User } from '../types';
import { api } from './api';

export const authService = {
    async login(credentials: AuthCredentials): Promise<User> {
        const response = await api.post('/auth/login', {
            email: credentials.username,
            password: credentials.password,
        });

        const { user, token } = response.data;

        const fullName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : (user.fullName || user.email);

        const authorizedUser: User = {
            id: user.id,
            username: user.email,
            email: user.email,
            role: user.role, // Store the full role object { id, name, permissions }
            token: token,
            entityType: 'staff',
            fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
        };

        localStorage.setItem('user', JSON.stringify(authorizedUser));
        return authorizedUser;
    },

    async loginCandidate(credentials: AuthCredentials): Promise<User> {
        const response = await api.post('/auth/candidate/login', {
            email: credentials.username,
            password: credentials.password,
        });

        const { user, token } = response.data;

        const authorizedUser: User = {
            id: user.nationalId,
            username: user.email,
            email: user.email,
            role: user.role, // Store full role object
            token: token,
            entityType: 'candidate',
            firstName: user.firstName,
            lastName: user.lastName,
            currentProcess: user.currentProcess, // Might be null if no active app
        };

        localStorage.setItem('user', JSON.stringify(authorizedUser));
        return authorizedUser;
    },

    async logout(): Promise<void> {
        // Optional: Call call backend logout if endpoint exists
        localStorage.removeItem('user');
    },
};
