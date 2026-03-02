import React from 'react';
import { Layout, Avatar, Dropdown, Typography, Space } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { logoutUser, selectCurrentUser } from '../features/auth/store/authSlice';
import '../App.css';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

interface CandidateLayoutProps {
    children: React.ReactNode;
}

const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/candidate/login');
    };

    const userMenuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Cerrar Sesión',
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <Header
                style={{
                    padding: '0 24px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    height: '64px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    width: '100%'
                }}
            >
                <div
                    style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1890ff',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/candidate/dashboard')}
                >
                    TPE <span style={{ color: '#52c41a' }}>Portal</span>
                </div>

                <Space size="middle">
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                transition: 'background 0.3s'
                            }}
                        >
                            <Avatar
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#1890ff' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px', lineHeight: '1.2' }}>
                                <Text strong style={{ fontSize: '14px' }}>{currentUser?.firstName || 'Candidato'}</Text>
                                <Text type="secondary" style={{ fontSize: '11px' }}>Mi Proceso</Text>
                            </div>
                        </div>
                    </Dropdown>
                </Space>
            </Header>

            <Content
                style={{
                    padding: '24px 16px',
                    maxWidth: '800px',
                    margin: '0 auto',
                    width: '100%',
                    flex: 1
                }}
            >
                {children}
            </Content>

            <Footer style={{ textAlign: 'center', background: 'transparent', color: 'rgba(0,0,0,0.45)' }}>
                Tu Próximo Empleo ©{new Date().getFullYear()} - Panel de Candidato
            </Footer>
        </Layout>
    );
};

export default CandidateLayout;
