import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Space } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TeamOutlined,
    FileTextOutlined,
    UsergroupAddOutlined, // For Candidates
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { logoutUser, selectCurrentUser } from '../features/auth/store/authSlice';
import '../App.css'; // Ensure CSS is imported

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Mi Perfil',
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Cerrar Sesión',
            onClick: handleLogout,
        },
    ];

    const menuItems = [
        {
            key: '/dashboard',
            icon: <UsergroupAddOutlined style={{ fontSize: '18px' }} />,
            label: 'Candidatos',
            onClick: () => navigate('/dashboard'),
        },
        {
            key: '/requisitions',
            icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
            label: 'Requisiciones',
            onClick: () => navigate('/requisitions'),
        },
        {
            key: '/users',
            icon: <TeamOutlined style={{ fontSize: '18px' }} />,
            label: 'Usuarios',
            onClick: () => navigate('/users'),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                className="premium-sider"
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >
                <div className="sider-logo">
                    {collapsed ? 'TPE' : 'Tu Próximo Empleo'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    className="premium-menu"
                />

                {/* User Profile Section at Bottom Sidebar */}
                {!collapsed && (
                    <div style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 0,
                        right: 0,
                        padding: '0 24px',
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: '12px'
                    }}>
                        <div style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            TPE Platform v1.0
                        </div>
                    </div>
                )}
            </Sider>
            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 260,
                    transition: 'all 0.2s',
                    background: '#f0f2f5',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Header
                    style={{
                        padding: '0 24px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        height: '64px',
                        zIndex: 1
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 48,
                            height: 48,
                        }}
                    />
                    <Space size="large">
                        {/* We can add notifications bell here later */}
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    transition: 'background 0.3s'
                                }}
                                className="user-dropdown-trigger"
                            >
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{ backgroundColor: '#1890ff', marginRight: '12px' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                    <Text strong style={{ fontSize: '14px' }}>{currentUser?.fullName || currentUser?.username || 'Usuario'}</Text>
                                    <Text type="secondary" style={{ fontSize: '11px' }}>{currentUser?.role || 'Admin'}</Text>
                                </div>
                            </div>
                        </Dropdown>
                    </Space>

                </Header>
                <Content
                    style={{
                        margin: '24px',
                        background: 'transparent',
                        flex: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
