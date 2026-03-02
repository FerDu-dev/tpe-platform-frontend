import React from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loginCandidate, selectAuthLoading, selectAuthError, clearError } from '../store/authSlice';
import { AuthCredentials } from '../../../types';

const { Title, Text } = Typography;

const CandidateLoginPage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);

    const onFinish = async (values: AuthCredentials) => {
        const resultAction = await dispatch(loginCandidate(values));
        if (loginCandidate.fulfilled.match(resultAction)) {
            navigate('/candidate/dashboard');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f0f2f5',
            padding: '20px'
        }}>
            <Card style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
                        Tu Próximo Empleo
                    </div>
                    <Title level={3} style={{ margin: 0 }}>Portal de Candidatos</Title>
                    <Text type="secondary">Ingresa para ver el estado de tu proceso</Text>
                </div>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => dispatch(clearError())}
                        style={{ marginBottom: '24px' }}
                    />
                )}

                <Form
                    form={form}
                    name="candidate_login"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        label="Correo Electrónico"
                        rules={[{ required: true, message: 'Por favor ingresa tu correo!', type: 'email' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="ejemplo@correo.com" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Contraseña"
                        rules={[{ required: true, message: 'Por favor ingresa tu contraseña!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Contraseña temporal" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block style={{ height: '48px', fontSize: '16px', borderRadius: '8px' }}>
                            Ingresar al Portal
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
                        Volver a la web principal
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default CandidateLoginPage;
