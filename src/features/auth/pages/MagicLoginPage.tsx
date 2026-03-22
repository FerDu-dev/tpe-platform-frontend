import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { api } from '../../../services/api';
import { useAppDispatch } from '../../../app/store';
import { setCredentials } from '../store/authSlice';

const MagicLoginPage: React.FC = () => {
    console.log('MagicLoginPage component rendering...');
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setError('Token de acceso no encontrado');
            setLoading(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await api.get(`/auth/candidate/magic-login?token=${token}`);
                const { user, token: newToken } = response.data;

                const authorizedUser = {
                    id: user.nationalId,
                    username: user.email,
                    email: user.email,
                    role: user.role, // Store full role object
                    token: newToken,
                    entityType: 'candidate' as const,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    currentProcess: user.currentProcess,
                };

                console.log('Magic login successful, user data:', authorizedUser);

                // 1. Sync local storage
                localStorage.setItem('user', JSON.stringify(authorizedUser));
                
                // 2. Update Redux state immediately
                console.log('Dispatching setCredentials...');
                dispatch(setCredentials(authorizedUser));
                
                // 3. Soft navigation to dashboard
                console.log('Navigating to /candidate/dashboard...');
                navigate('/candidate/dashboard', { replace: true });
            } catch (e: any) {
                console.error('Magic login failed:', e);
                setError(e.response?.data?.message || 'El enlace de acceso ha expirado o es inválido');
                setLoading(false);
            }
        };

        verifyToken();
    }, [searchParams]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
                <Spin size="large" />
                <div style={{ fontSize: '18px', color: '#1890ff' }}>Verificando tu acceso seguro...</div>
            </div>
        );
    }

    if (error) {
        return (
            <Result
                status="error"
                title="Error de Acceso"
                subTitle={error}
                extra={[
                    <Button type="primary" key="login" onClick={() => navigate('/candidate/login')}>
                        Ir al Login Manual
                    </Button>,
                    <Button key="home" onClick={() => navigate('/')}>
                        Volver al Inicio
                    </Button>
                ]}
            />
        );
    }

    return null;
};

export default MagicLoginPage;
