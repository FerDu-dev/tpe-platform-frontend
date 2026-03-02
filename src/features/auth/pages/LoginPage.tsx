import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, Typography, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loginUser, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/authSlice';
import type { AuthCredentials } from '../../../types';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
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
            {/* Left side - Login Form */}
            <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <Card style={{ width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <Title level={2} style={{ marginBottom: '8px' }}>
                            Login 👋
                        </Title>
                        <Text type="secondary">Bienvenido a Tu Próximo Empleo</Text>
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
                            label="Email"
                            name="username"
                            rules={[{ required: true, message: 'Please input your email!' }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="admin@tuproximoempleo.com"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Enter your password"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                style={{ height: '48px', fontSize: '16px', fontWeight: 500 }}
                            >
                                Login
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* <div style={{ marginTop: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '6px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            <strong>Demo Credentials:</strong><br />
                            Email: admin@tuproximoempleo.com<br />
                            Password: admin123
                        </Text>
                    </div> */}
                </Card>
            </Col>

            {/* Right side - Hero Section */}
            <Col
                xs={0}
                md={12}
                style={{
                    background: 'linear-gradient(135deg, #2b457c 0%, #4a6fa5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{ textAlign: 'center', color: 'white', zIndex: 1 }}>
                    <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
                        Encuentra al talento<br />ideal para tu equipo 👌
                    </Title>
                    <Title level={3} style={{ color: 'white', fontWeight: 400 }}>
                        Portal de Reclutadores
                    </Title>
                </div>

                {/* Decorative circles */}
                <div
                    style={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        top: '-100px',
                        right: '-100px',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        bottom: '-50px',
                        left: '-50px',
                    }}
                />
            </Col>
        </Row>
    );
};

export default LoginPage;
