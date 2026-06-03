import axios from 'axios';
import { message } from 'antd';

const API_URL = (import.meta as any).env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (e) {
                console.error('Error parsing user from local storage', e);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                const isLoginRequest = error.config?.url?.includes('/login');
                if (!isLoginRequest) {
                    // Logout if token is invalid
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            } else if (error.response.status >= 500) {
                message.error('Error interno del servidor. Por favor, intenta de nuevo más tarde.');
            }
        } else if (error.request) {
            message.error('No se pudo conectar con el servidor.');
        }
        return Promise.reject(error);
    }
);
