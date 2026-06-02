import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, Space, Typography,
    Popconfirm, message, Tooltip, Card, Row, Col, Empty
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { companiesService } from '../../../services/companiesService';
import PermissionGuard from '../../../components/PermissionGuard';
import type { Company } from '../../../types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const CompaniesPage: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const editingCompany = React.useMemo(() =>
        companies.find(c => c.id === editingId) || null,
        [companies, editingId]
    );

    const [form] = Form.useForm();

    const loadCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const data = await companiesService.getAll();
            setCompanies(data);
        } catch (error) {
            console.error('Error al cargar empresas:', error);
            message.error('Error al cargar empresas. Es posible que el backend no tenga este servicio activo aún.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    const openCreate = () => {
        setEditingId(null);
        setModalOpen(true);
    };

    const openEdit = (company: Company) => {
        setEditingId(company.id);
        setModalOpen(true);
    };

    useEffect(() => {
        if (modalOpen) {
            if (editingCompany) {
                form.setFieldsValue({
                    name: editingCompany.name,
                });
            } else {
                form.resetFields();
            }
        }
    }, [modalOpen, editingCompany, form]);

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (editingId) {
                const updated = await companiesService.update(editingId, values);
                message.success('Empresa actualizada correctamente');
                setCompanies(prev => prev.map(c => c.id === editingId ? updated : c));
            } else {
                const created = await companiesService.create(values);
                message.success('Empresa creada correctamente');
                setCompanies(prev => [...prev, created]);
            }
            setModalOpen(false);
        } catch {
            message.error('Error al guardar la empresa');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await companiesService.delete(id);
            message.success('Empresa eliminada');
            setCompanies(prev => prev.filter(c => c.id !== id));
        } catch {
            message.error('Error al eliminar la empresa');
        }
    };

    const columns: ColumnsType<Company> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Nombre de la Empresa',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <Text strong>{name}</Text>,
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <PermissionGuard module="companies" action="edit">
                        <Tooltip title="Editar">
                            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                        </Tooltip>
                    </PermissionGuard>
                    <PermissionGuard module="companies" action="delete">
                        <Popconfirm
                            title="¿Eliminar esta empresa?"
                            description="Esta acción no se puede deshacer."
                            onConfirm={() => handleDelete(record.id)}
                            okText="Sí, eliminar"
                            cancelText="Cancelar"
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
                            <BankOutlined style={{ color: '#2b457c' }} />
                            Gestión de Empresas
                        </Title>
                        <Text type="secondary">Administra las empresas asociadas a la plataforma</Text>
                    </Col>
                    <Col>
                        <Space>
                            
                            <PermissionGuard module="companies" action="create">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    size="large"
                                    style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(24,144,255,0.3)' }}
                                    onClick={openCreate}
                                >
                                    Nueva Empresa
                                </Button>
                            </PermissionGuard>
                        </Space>
                    </Col>
                </Row>

                
                {/* Filters */}
                <Card
                    style={{ marginBottom: '20px', borderRadius: '12px' }}
                    bodyStyle={{ padding: '16px 20px' }}
                >
                    <Row gutter={[16, 8]} align="middle">
                        <Col>
                            <span style={{ color: '#8c8c8c' }}><i className="anticon anticon-filter" /></span>
                            <Text type="secondary" style={{ marginLeft: '6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                                Acciones Rápidas
                            </Text>
                        </Col>
                        <Col flex="auto">
                        </Col>
                        <Col>
                            <Button icon={<ReloadOutlined />} onClick={loadCompanies}>
                                Actualizar
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Content: Table */}
                <Card
                    style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}
                    bodyStyle={{ padding: 0 }}
                >
                    <Table
                        columns={columns}
                        dataSource={companies}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                        locale={{ emptyText: <Empty description="No se encontraron empresas" /> }}
                        style={{ borderRadius: '12px', overflow: 'hidden' }}
                    />
                </Card>
            </motion.div>

            {/* Create / Edit Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            width: 40, height: 40, background: '#e6f7ff', 
                            borderRadius: '8px', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center' 
                        }}>
                            {editingCompany ? <EditOutlined style={{ fontSize: 20, color: '#1890ff' }} /> : <PlusOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 600 }}>
                                {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 400 }}>
                                {editingCompany ? 'Modifica los datos de la empresa' : 'Ingresa los datos para la nueva empresa'}
                            </div>
                        </div>
                    </div>
                }
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()}
                okText={editingCompany ? 'Guardar Cambios' : 'Crear Empresa'}
                cancelText="Cancelar"
                confirmLoading={saving}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: '16px' }}>
                    <Form.Item
                        name="name"
                        label="Nombre de la Empresa"
                        rules={[{ required: true, message: 'El nombre es requerido' }]}
                    >
                        <Input placeholder="Ej: Prisma" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CompaniesPage;
