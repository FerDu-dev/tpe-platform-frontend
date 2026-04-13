import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, Typography, Alert, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loginUser, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/authSlice';
import type { AuthCredentials } from '../../../types';
import logoSvg from '../../../assets/logo.png';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const onFinish = (values: AuthCredentials) => {
        dispatch(loginUser(values));
    };

    return (
        <Row style={{ minHeight: '100vh' }}>
            {/* Left side - Login Form only */}
            <Col
                xs={24}
                md={12}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    background: '#fff',
                }}
            >
                <Card
                    style={{
                        width: '100%',
                        maxWidth: '440px',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                        padding: '8px',
                        border: '1px solid #f0f0f0',
                    }}
                >
                    <div style={{ marginBottom: '32px' }}>
                        <Title level={2} style={{ marginBottom: '6px', color: '#1a1a2e' }}>
                            Bienvenido 👋
                        </Title>
                        <Text type="secondary" style={{ fontSize: '15px' }}>
                            Inicia sesión en el Portal de Reclutadores
                        </Text>
                    </div>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            closable
                            onClose={() => dispatch(clearError())}
                            style={{ marginBottom: '24px' }}
                        />
                    )}

                    <Form
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            label="Correo electrónico"
                            name="username"
                            rules={[{ required: true, message: 'Por favor ingresa tu email' }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder=""
                                style={{ borderRadius: '8px', height: '48px' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Contraseña"
                            name="password"
                            rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder=""
                                style={{ borderRadius: '8px', height: '48px' }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginTop: '8px' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                style={{
                                    height: '52px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #2B5BB6, #1a3d8f)',
                                    border: 'none',
                                }}
                            >
                                Iniciar Sesión
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>

            {/* Right side - Logo centered + hero text */}
            <Col
                xs={0}
                md={12}
                style={{
                    background: 'linear-gradient(160deg, #1a3d8f 0%, #2B5BB6 60%, #3a6fd8 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 48px',
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'center',
                }}
            >
                {/* Decorative background circles */}
                <div style={{
                    position: 'absolute',
                    width: '420px',
                    height: '420px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    top: '-120px',
                    right: '-130px',
                }} />
                <div style={{
                    position: 'absolute',
                    width: '280px',
                    height: '280px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    bottom: '-60px',
                    left: '-80px',
                }} />

                {/* Logo centered */}
                <div style={{ marginBottom: '40px', zIndex: 1 }}>
                    <img
                        src={logoSvg}
                        alt="TuPróximoEmpleo.com"
                        style={{
                            height: '80px',
                            width: 'auto',
                            filter: 'brightness(0) invert(1)',
                        }}
                    />
                </div>

                {/* Hero text */}
                <div style={{ zIndex: 1 }}>
                    <Title
                        level={1}
                        style={{
                            color: 'white',
                            fontSize: '42px',
                            lineHeight: 1.2,
                            marginBottom: '20px',
                        }}
                    >
                        Encuentra al talento<br />
                        <span style={{ color: '#E91E8C' }}>ideal</span> para tu equipo
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: '18px' }}>
                        Plataforma de Selección y Reclutamiento
                    </Text>
                </div>
            </Col>
        </Row>
    );
};

export default LoginPage;
