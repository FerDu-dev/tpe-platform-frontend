import React, { useState, useEffect } from 'react';
import {
    Table, Button, Space, Tag, Typography,
    Popconfirm, message, Tooltip, Card, Row, Col, Divider, Input, Modal
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined,
    FilterOutlined, ReloadOutlined, KeyOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loadRoles, deleteRole, selectRoles, selectRolesLoading } from '../store/rolesSlice';
import RoleFormModal from '../components/RoleFormModal';
import PermissionGuard from '../../../components/PermissionGuard';
import { IRole } from '../../../services/rolesService';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const MODULE_TRANSLATIONS: Record<string, string> = {
    candidates: 'Candidatos',
    requisitions: 'Requisiciones',
    hires: 'Contrataciones',
    zones: 'Zonas',
    users: 'Usuarios',
    roles: 'Roles y Permisos',
    dashboard: 'Dashboard',
    workflows: 'Flujos de Trabajo'
};

const RolesPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const loading = useAppSelector(selectRolesLoading);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<IRole | undefined>(undefined);
    const [filterSearch, setFilterSearch] = useState('');
    const [detailRole, setDetailRole] = useState<IRole | null>(null);
    const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);

    useEffect(() => {
        dispatch(loadRoles());
    }, [dispatch]);

    const handleCreate = () => {
        setEditingRole(undefined);
        setModalOpen(true);
    };

    const handleEdit = (role: IRole) => {
        setEditingRole(role);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await dispatch(deleteRole(id)).unwrap();
            message.success('Rol eliminado correctamente');
            if (detailRole?.id === id) setDetailRole(null);
        } catch (error: any) {
            message.error(error.message || 'Error al eliminar rol');
        }
    };

    const filteredRoles = roles.filter(r => {
        const search = filterSearch.toLowerCase();
        return !search || 
            r.name.toLowerCase().includes(search) ||
            (r.description || '').toLowerCase().includes(search);
    });

    const columns: ColumnsType<IRole> = [
        {
            title: 'Rol',
            key: 'name',
            render: (_, record) => (
                <Space onClick={() => setDetailRole(record)} style={{ cursor: 'pointer' }}>
                    <SafetyCertificateOutlined style={{ color: '#2b457c' }} />
                    <Text strong>{record.name}</Text>
                </Space>
            ),
        },
        {
            title: 'Descripción',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Permisos',
            key: 'permissionsCount',
            render: (_, record) => {
                const count = Object.values(record.permissions || {}).reduce((acc: number, val: any) => acc + (val?.length || 0), 0);
                return <Tag color="blue">{count} Acciones</Tag>;
            },
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 100,
            align: 'right',
            render: (_, record) => (
                <Space>
                    <PermissionGuard module="roles" action="edit">
                        <Tooltip title="Editar">
                            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                        </Tooltip>
                    </PermissionGuard>
                    <PermissionGuard module="roles" action="delete">
                        <Popconfirm
                            title="¿Eliminar rol?"
                            onConfirm={() => handleDelete(record.id)}
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
                            <SafetyCertificateOutlined style={{ color: '#2b457c' }} />
                            Gestión de Roles
                        </Title>
                        <Text type="secondary">Define los perfiles de acceso y permisos del sistema</Text>
                    </Col>
                    <Col>
                        <PermissionGuard module="roles" action="create">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            style={{ borderRadius: '8px', background: '#2b457c', borderColor: '#2b457c' }}
                            onClick={handleCreate}
                        >
                            Nuevo Rol
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
                                placeholder="Buscar por nombre o descripción..."
                                allowClear
                                value={filterSearch}
                                onChange={(e: any) => setFilterSearch(e.target.value)}
                                style={{ maxWidth: '400px', borderRadius: '6px' }}
                            />
                        </Col>
                        <Col>
                            <Button icon={<ReloadOutlined />} onClick={() => dispatch(loadRoles())}>
                                Actualizar
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Main Content */}
                <Row gutter={[20, 20]}>
                    <Col xs={24} lg={detailRole ? 16 : 24}>
                        <Card style={{ borderRadius: '12px' }} bodyStyle={{ padding: 0 }}>
                            <Table
                                columns={columns}
                                dataSource={filteredRoles}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 10 }}
                                onRow={(record) => ({
                                    onClick: () => setDetailRole(record),
                                    style: { cursor: 'pointer' }
                                })}
                                rowClassName={(record) => record.id === detailRole?.id ? 'selected-row' : ''}
                            />
                        </Card>
                    </Col>

                    {detailRole && (
                        <Col xs={24} lg={8}>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <Card
                                    title={
                                        <Space>
                                            <KeyOutlined style={{ color: '#2b457c' }} />
                                            <span>Detalle de Rol</span>
                                        </Space>
                                    }
                                    extra={<Button type="text" onClick={() => setDetailRole(null)} size="small">✕</Button>}
                                    style={{ borderRadius: '12px', border: '1px solid #e6f7ff', background: '#fafcff' }}
                                >
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Nombre del Rol</Text>
                                            <Title level={4} style={{ margin: '4px 0 0' }}>{detailRole.name}</Title>
                                        </div>

                                        {detailRole.description && (
                                            <div>
                                                <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Descripción</Text>
                                                <p style={{ margin: '4px 0 0' }}>{detailRole.description}</p>
                                            </div>
                                        )}

                                        <Divider style={{ margin: '8px 0' }} />

                                        <div>
                                            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Resumen de Permisos</Text>
                                            <div style={{ marginTop: '12px' }}>
                                                <Button 
                                                    icon={<KeyOutlined />} 
                                                    onClick={() => setPermissionsModalVisible(true)}
                                                    size="middle"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    Ver detalle de permisos
                                                </Button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <PermissionGuard module="roles" action="edit">
                                                <Button 
                                                    type="primary" 
                                                    icon={<EditOutlined />} 
                                                    block 
                                                    onClick={() => handleEdit(detailRole)}
                                                >
                                                    Editar
                                                </Button>
                                            </PermissionGuard>
                                            <PermissionGuard module="roles" action="delete">
                                                <Popconfirm
                                                    title="¿Eliminar rol?"
                                                    onConfirm={() => handleDelete(detailRole.id)}
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

            <RoleFormModal
                visible={modalOpen}
                role={editingRole}
                onCancel={() => setModalOpen(false)}
                onSuccess={() => {
                    setModalOpen(false);
                    dispatch(loadRoles());
                }}
            />

            {/* Modal de Detalle de Permisos */}
            <Modal
                title={
                    <Space>
                        <SafetyCertificateOutlined style={{ color: '#2b457c' }} />
                        <span>Permisos Asignados: {detailRole?.name}</span>
                    </Space>
                }
                open={permissionsModalVisible}
                onCancel={() => setPermissionsModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setPermissionsModalVisible(false)}>
                        Cerrar
                    </Button>
                ]}
                width={600}
            >
                <div style={{ marginTop: '16px' }}>
                    {detailRole && Object.keys(detailRole.permissions || {}).length > 0 ? (
                        Object.keys(detailRole.permissions).map(module => (
                            detailRole.permissions[module]?.length > 0 && (
                                <div key={module} style={{ marginBottom: '16px' }}>
                                    <Text strong style={{ fontSize: '14px', color: '#1a3d8f' }}>
                                        {MODULE_TRANSLATIONS[module] || module}
                                    </Text>
                                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {detailRole.permissions[module].map((perm: string) => (
                                            <Tag key={perm} color="blue" style={{ border: 'none', background: '#e6f7ff', color: '#1890ff', borderRadius: '4px' }}>
                                                {perm === 'read' ? 'Ver' : 
                                                 perm === 'create' ? 'Crear' :
                                                 perm === 'update' ? 'Editar' :
                                                 perm === 'delete' ? 'Eliminar' : perm}
                                            </Tag>
                                        ))}
                                    </div>
                                    <Divider style={{ margin: '12px 0' }} />
                                </div>
                            )
                        ))
                    ) : (
                        <Text type="secondary">Este rol no tiene permisos asignados.</Text>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default RolesPage;
