import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { api } from '../../../services/api';

const MagicLoginPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setError('Token de acceso no encontrado');
            setLoading(false);
            return;
        }

        const verifyToken = async () => {
            try {
                // We use the magic-login backend endpoint
                const response = await api.get(`/auth/candidate/magic-login?token=${token}`);
                const { user, token: newToken } = response.data;

                // Create the user object for the state
                const authorizedUser = {
                    id: user.nationalId,
                    username: user.email,
                    email: user.email,
                    role: user.role.name,
                    token: newToken,
                    entityType: 'candidate',
                    firstName: user.firstName,
                    lastName: user.lastName,
                    currentProcess: user.currentProcess,
                };

                // Store and redirect
                localStorage.setItem('user', JSON.stringify(authorizedUser));
                window.location.href = '/candidate/dashboard'; // Force reload to pick up state properly
            } catch (e: any) {
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
