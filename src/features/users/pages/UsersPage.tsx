import React, { useState, useEffect } from 'react';
import {
    Table, Button, Space, Tag, Typography,
    Popconfirm, message, Tooltip, Card, Row, Col, Descriptions, Input
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined,
    FilterOutlined, ReloadOutlined, UserOutlined, MailOutlined, PhoneOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loadUsers, deleteUser, selectUsers, selectUsersLoading } from '../store/usersSlice';
import UserFormModal from '../components/UserFormModal';
import PermissionGuard from '../../../components/PermissionGuard';
import type { User } from '../../../types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const UsersPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const users = useAppSelector(selectUsers);
    const loading = useAppSelector(selectUsersLoading);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [filterSearch, setFilterSearch] = useState('');
    const [detailUser, setDetailUser] = useState<User | null>(null);

    useEffect(() => {
        dispatch(loadUsers());
    }, [dispatch]);

    const handleCreate = () => {
        setEditingUser(undefined);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await dispatch(deleteUser(id)).unwrap();
            message.success('Usuario eliminado corretamente');
            if (detailUser?.id === id) setDetailUser(null);
        } catch (error: any) {
            message.error(error.message || 'Error al eliminar usuario');
        }
    };

    const filteredUsers = users.filter(u => {
        const search = filterSearch.toLowerCase();
        return !search || 
            u.email.toLowerCase().includes(search) ||
            (u.firstName || '').toLowerCase().includes(search) ||
            (u.lastName || '').toLowerCase().includes(search) ||
            (u.username || '').toLowerCase().includes(search);
    });

    const columns: ColumnsType<User> = [
        {
            title: 'Nombre',
            key: 'fullName',
            render: (_, record) => (
                <Space onClick={() => setDetailUser(record)} style={{ cursor: 'pointer' }}>
                    <div style={{ 
                        width: 32, height: 32, background: '#e6f7ff', 
                        borderRadius: '50%', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <UserOutlined style={{ color: '#1890ff' }} />
                    </div>
                    <div>
                        <Text strong>{record.firstName} {record.lastName}</Text>
                        {record.username && (
                            <div><Text type="secondary" style={{ fontSize: '12px' }}>@{record.username}</Text></div>
                        )}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => <Text copyable>{email}</Text>,
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color="cyan" style={{ fontWeight: 600 }}>
                    {(role as any)?.name || role || 'SIN ROL'}
                </Tag>
            ),
        },
        {
            title: 'Estado',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'ACTIVO' : 'INACTIVO'}
                </Tag>
            ),
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 100,
            align: 'right',
            render: (_, record) => (
                <Space>
                    <PermissionGuard module="users" action="edit">
                        <Tooltip title="Editar">
                            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                        </Tooltip>
                    </PermissionGuard>
                    <PermissionGuard module="users" action="delete">
                        <Popconfirm
                            title="¿Eliminar usuario?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Sí"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Eliminar">
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Tooltip>
                        </Popconfirm>
                    </PermissionGuard>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ background: '#f0f2f5', minHeight: '100%' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                    <Col>
                        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <TeamOutlined style={{ color: '#2b457c' }} />
                            Gestión de Usuarios
                        </Title>
                        <Text type="secondary">Administra los usuarios del sistema y sus niveles de acceso</Text>
                    </Col>
                    <Col>
                        <PermissionGuard module="users" action="create">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            style={{ borderRadius: '8px', background: '#2b457c', borderColor: '#2b457c' }}
                            onClick={handleCreate}
                        >
                            Nuevo Usuario
                        </Button>
                    </PermissionGuard>
                    </Col>
                </Row>

                {/* Filters */}
                <Card
                    style={{ marginBottom: '20px', borderRadius: '12px' }}
                    bodyStyle={{ padding: '16px 20px' }}
                >
                    <Row gutter={[16, 8]} align="middle">
                        <Col>
                            <FilterOutlined style={{ color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ marginLeft: '6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                                Filtros
                            </Text>
                        </Col>
                        <Col flex="auto">
                            <Input
                                placeholder="Buscar por nombre, email, usuario..."
                                allowClear
                                value={filterSearch}
                                onChange={(e: any) => setFilterSearch(e.target.value)}
                                style={{ maxWidth: '400px', borderRadius: '6px' }}
                            />
                        </Col>
                        <Col>
                            <Button icon={<ReloadOutlined />} onClick={() => dispatch(loadUsers())}>
                                Actualizar
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Main Content */}
                <Row gutter={[20, 20]}>
                    <Col xs={24} lg={detailUser ? 16 : 24}>
                        <Card style={{ borderRadius: '12px' }} bodyStyle={{ padding: 0 }}>
                            <Table
                                columns={columns}
                                dataSource={filteredUsers}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 10 }}
                                onRow={(record) => ({
                                    onClick: () => setDetailUser(record),
                                    style: { cursor: 'pointer' }
                                })}
                                rowClassName={(record) => record.id === detailUser?.id ? 'selected-row' : ''}
                            />
                        </Card>
                    </Col>

                    {detailUser && (
                        <Col xs={24} lg={8}>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <Card
                                    title={
                                        <Space>
                                            <UserOutlined style={{ color: '#2b457c' }} />
                                            <span>Detalle de Usuario</span>
                                        </Space>
                                    }
                                    extra={<Button type="text" onClick={() => setDetailUser(null)} size="small">✕</Button>}
                                    style={{ borderRadius: '12px', border: '1px solid #e6f7ff', background: '#fafcff' }}
                                >
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ 
                                                width: 64, height: 64, background: '#e6f7ff', 
                                                borderRadius: '50%', display: 'flex', 
                                                alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto 12px'
                                            }}>
                                                <UserOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                                            </div>
                                            <Title level={4} style={{ marginBottom: 4 }}>
                                                {detailUser.firstName} {detailUser.lastName}
                                            </Title>
                                            <Tag color="cyan">{(detailUser.role as any)?.name || 'Sin Rol'}</Tag>
                                        </div>

                                        <Descriptions column={1} size="small" bordered>
                                            <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                                                {detailUser.email}
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<Space><UserOutlined /> Usuario</Space>}>
                                                {detailUser.username || '—'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<Space><PhoneOutlined /> Teléfono</Space>}>
                                                {detailUser.phone || '—'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Estado">
                                                <Tag color={detailUser.isActive ? 'green' : 'red'}>
                                                    {detailUser.isActive ? 'Activo' : 'Inactivo'}
                                                </Tag>
                                            </Descriptions.Item>
                                        </Descriptions>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <PermissionGuard module="users" action="edit">
                                                <Button 
                                                    type="primary" 
                                                    icon={<EditOutlined />} 
                                                    block 
                                                    onClick={() => handleEdit(detailUser)}
                                                >
                                                    Editar
                                                </Button>
                                            </PermissionGuard>
                                            <PermissionGuard module="users" action="delete">
                                                <Popconfirm
                                                    title="¿Eliminar usuario?"
                                                    onConfirm={() => handleDelete(detailUser.id)}
                                                >
                                                    <Button danger icon={<DeleteOutlined />} block>
                                                        Eliminar
                                                    </Button>
                                                </Popconfirm>
                                            </PermissionGuard>
                                        </div>
                                    </Space>
                                </Card>
                            </motion.div>
                        </Col>
                    )}
                </Row>
            </motion.div>

            <UserFormModal
                visible={modalOpen}
                user={editingUser}
                onCancel={() => setModalOpen(false)}
                onSuccess={() => {
                    setModalOpen(false);
                    dispatch(loadUsers());
                }}
            />
        </div>
    );
};

export default UsersPage;
