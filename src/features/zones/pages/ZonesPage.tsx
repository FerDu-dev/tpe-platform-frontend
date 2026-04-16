import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, Space, Tag, Typography,
    Popconfirm, message, Tooltip, Card, Row, Col, Descriptions, Divider, Empty
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined,
    FilterOutlined, ReloadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { zonesService } from '../../../services/zonesService';
import { VENEZUELA_STATES } from '../../../constants/venezuela';
import PermissionGuard from '../../../components/PermissionGuard';
import type { Zone } from '../../../types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

const COMPANIES = [
    { id: 1, name: 'Febeca' },
    { id: 2, name: 'Beval' },
    { id: 3, name: 'Sillaca' },
    { id: 4, name: 'Grupo' },
];

const ZonesPage: React.FC = () => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [totalZones, setTotalZones] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // Senior reactive state: use IDs to track selection
    const [editingId, setEditingId] = useState<number | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);

    const [saving, setSaving] = useState(false);
    const [filterCompanyId, setFilterCompanyId] = useState<number | undefined>();
    const [filterStateId, setFilterStateId] = useState<number | undefined>();
    const [filterSearch, setFilterSearch] = useState('');

    // Derived reactive states
    const editingZone = React.useMemo(() =>
        zones.find(z => z.id === editingId) || null,
        [zones, editingId]
    );

    const detailZone = React.useMemo(() =>
        zones.find(z => z.id === detailId) || null,
        [zones, detailId]
    );

    const [form] = Form.useForm();

    const loadZones = useCallback(async () => {
        setLoading(true);
        try {
            const { data, total } = await zonesService.fetchZones(
                filterCompanyId,
                filterSearch,
                currentPage,
                pageSize,
                filterStateId
            );
            setZones(data);
            setTotalZones(Number(total));
            console.log(`[ZonesPage] Loaded ${data.length} zones out of ${total} total.`);
        } catch (error) {
            console.error('Error al cargar zonas:', error);
            message.error('Error al cargar zonas');
        } finally {
            setLoading(false);
        }
    }, [filterCompanyId, filterSearch, filterStateId, currentPage, pageSize]);

    useEffect(() => {
        loadZones();
    }, [loadZones]);

    // Reiniciar a página 1 cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [filterCompanyId, filterSearch, filterStateId]);

    const openCreate = () => {
        setEditingId(null);
        setModalOpen(true);
    };

    const openEdit = (zone: Zone) => {
        setEditingId(zone.id);
        setModalOpen(true);
    };

    // Form population logic
    useEffect(() => {
        if (modalOpen) {
            if (editingZone) {
                form.setFieldsValue({
                    name: editingZone.name,
                    companyId: editingZone.companyId || (editingZone.company as any)?.id,
                    region: editingZone.region,
                    coordinator: editingZone.coordinator,
                    coordinatorNum: editingZone.coordinatorNum,
                    geographicRoute: editingZone.geographicRoute,
                    stateId: editingZone.stateId || (editingZone.state as any)?.id,
                });
            } else {
                form.resetFields();
            }
        }
    }, [modalOpen, editingZone, form]);

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (editingId) {
                const updated = await zonesService.updateZone(editingId, values);
                message.success('Zona actualizada correctamente');

                // Reactive local update: avoids full reload if only editing
                setZones(prev => prev.map(z => z.id === editingId ? updated : z));
            } else {
                await zonesService.createZone(values);
                message.success('Zona creada correctamente');
                loadZones(); // For new zones, reload to get correct position/totals
            }
            setModalOpen(false);
        } catch {
            message.error('Error al guardar la zona');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await zonesService.deleteZone(id);
            message.success('Zona eliminada');

            // Reactive local update: immediate removal from UI
            setZones(prev => prev.filter(z => z.id !== id));
            setTotalZones(prev => Math.max(0, prev - 1));

            if (detailId === id) setDetailId(null);
            if (editingId === id) setEditingId(null);
        } catch {
            message.error('Error al eliminar la zona');
        }
    };


    const companyName = (id: number) => COMPANIES.find(c => c.id === id)?.name || `Empresa ${id}`;
    const stateName = (id?: number) => VENEZUELA_STATES.find(s => s.id === id)?.name;

    const columns: ColumnsType<Zone> = [
        {
            title: 'Zona',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <div>
                    <Text
                        strong
                        style={{ color: '#1890ff', cursor: 'pointer' }}
                        onClick={() => setDetailId(record.id)}
                    >
                        {name}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Empresa',
            dataIndex: 'companyId',
            key: 'companyId',
            render: (id) => <Tag color="blue">{companyName(id)}</Tag>,
        },
        {
            title: 'Región',
            key: 'region',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ textTransform: 'uppercase' }}>
                        {record.region || 'N/A'}
                    </Text>
                    {record.stateId && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            y su {stateName(record.stateId)}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Coordinador',
            key: 'coordinator',
            render: (_, z) => z.coordinator ? (
                <div>
                    <Text>{z.coordinator}</Text>
                    {z.coordinatorNum && <div><Text type="secondary" style={{ fontSize: '12px' }}>{z.coordinatorNum}</Text></div>}
                </div>
            ) : <Text type="secondary">—</Text>,
        },
        {
            title: 'Ruta Geográfica',
            dataIndex: 'geographicRoute',
            key: 'geographicRoute',
            ellipsis: true,
            render: (v) => v ? (
                <Tooltip title={v}><Text style={{ maxWidth: 200 }} ellipsis>{v}</Text></Tooltip>
            ) : <Text type="secondary">—</Text>,
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <PermissionGuard module="zones" action="edit">
                        <Tooltip title="Editar">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => openEdit(record)}
                                style={{ color: '#1890ff' }}
                            />
                        </Tooltip>
                    </PermissionGuard>
                    <PermissionGuard module="zones" action="delete">
                        <Popconfirm
                            title="¿Eliminar esta zona?"
                            description="Esta acción no se puede deshacer. Las requisiciones asociadas perderán su zona."
                            onConfirm={() => handleDelete(record.id)}
                            okText="Sí, eliminar"
                            cancelText="Cancelar"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Eliminar">
                                <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d4f' }} />
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
                            <GlobalOutlined style={{ color: '#1890ff' }} />
                            Gestión de Zonas
                        </Title>
                        <Text type="secondary">Administra las zonas geográficas de cada empresa</Text>
                    </Col>
                    <Col>
                        <PermissionGuard module="zones" action="create">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(24,144,255,0.3)' }}
                                onClick={openCreate}
                            >
                                Nueva Zona
                            </Button>
                        </PermissionGuard>
                    </Col>
                </Row>

                {/* Filters */}
                <Card
                    style={{ marginBottom: '20px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}
                    bodyStyle={{ padding: '16px 20px' }}
                >
                    <Row gutter={[16, 8]} align="middle">
                        <Col>
                            <FilterOutlined style={{ color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ marginLeft: '6px', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>
                                Filtros
                            </Text>
                        </Col>
                        <Col xs={24} sm={7}>
                            <Select
                                placeholder="Filtrar por empresa"
                                allowClear
                                style={{ width: '100%' }}
                                value={filterCompanyId}
                                onChange={(val) => setFilterCompanyId(val)}
                            >
                                {COMPANIES.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={24} sm={7}>
                            <Select
                                placeholder="Filtrar por estado"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                style={{ width: '100%' }}
                                value={filterStateId}
                                onChange={(val) => setFilterStateId(val)}
                            >
                                {VENEZUELA_STATES.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Input
                                placeholder="Buscar zona, coordinador..."
                                allowClear
                                value={filterSearch}
                                onChange={e => setFilterSearch(e.target.value)}
                                style={{ borderRadius: '6px' }}
                            />
                        </Col>
                        <Col>
                            <Button icon={<ReloadOutlined />} onClick={loadZones}>
                                Actualizar
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Content: Table + Detail */}
                <Row gutter={[20, 20]}>
                    <Col xs={24} lg={detailId ? 16 : 24}>
                        <Card
                            style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <Table
                                columns={columns}
                                dataSource={zones}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: totalZones,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10', '20', '50', '100'],
                                    showTotal: (total) => `Total ${total} zonas`,
                                    position: ['bottomRight'],
                                    hideOnSinglePage: false,
                                    onChange: (page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    }
                                }}
                                locale={{ emptyText: <Empty description="No se encontraron zonas" /> }}
                                style={{ borderRadius: '12px', overflow: 'hidden' }}
                                rowClassName={(record) => record.id === detailId ? 'selected-row' : ''}
                                onRow={(record) => ({
                                    onClick: () => setDetailId(record.id),
                                    style: { cursor: 'pointer' }
                                })}
                            />
                        </Card>
                    </Col>

                    {detailZone && (
                        <Col xs={24} lg={8}>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <Card
                                    title={
                                        <Space>
                                            <GlobalOutlined style={{ color: '#1890ff' }} />
                                            <span>Detalle de Zona</span>
                                        </Space>
                                    }
                                    extra={
                                        <Button type="text" onClick={() => setDetailId(null)} size="small">✕</Button>
                                    }
                                    style={{ borderRadius: '12px', border: '1px solid rgba(24,144,255,0.2)', background: '#fafcff' }}
                                >
                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Nombre</Text>
                                            <Title level={4} style={{ margin: '4px 0 0' }}>{detailZone.name}</Title>
                                        </div>

                                        <Descriptions column={1} size="small" bordered>
                                            <Descriptions.Item label="Empresa">
                                                <Tag color="blue">{companyName(detailZone.companyId)}</Tag>
                                            </Descriptions.Item>
                                            {detailZone.region && (
                                                <Descriptions.Item label="Región">{detailZone.region}</Descriptions.Item>
                                            )}
                                            {detailZone.stateId && (
                                                <Descriptions.Item label="Estado">
                                                    {stateName(detailZone.stateId)}
                                                </Descriptions.Item>
                                            )}
                                            {detailZone.coordinator && (
                                                <Descriptions.Item label="Coordinador">{detailZone.coordinator}</Descriptions.Item>
                                            )}
                                            {detailZone.coordinatorNum && (
                                                <Descriptions.Item label="Teléfono">{detailZone.coordinatorNum}</Descriptions.Item>
                                            )}
                                            {detailZone.geographicRoute && (
                                                <Descriptions.Item label="Ruta / Detalles">{detailZone.geographicRoute}</Descriptions.Item>
                                            )}
                                        </Descriptions>

                                        <Divider style={{ margin: '8px 0' }} />

                                        <Space>
                                            <PermissionGuard module="zones" action="edit">
                                                <Button
                                                    type="primary"
                                                    icon={<EditOutlined />}
                                                    onClick={() => openEdit(detailZone)}
                                                    style={{ borderRadius: '8px' }}
                                                >
                                                    Editar
                                                </Button>
                                            </PermissionGuard>
                                            <PermissionGuard module="zones" action="delete">
                                                <Popconfirm
                                                    title="¿Eliminar esta zona?"
                                                    onConfirm={() => handleDelete(detailZone.id)}
                                                    okText="Sí, eliminar"
                                                    cancelText="Cancelar"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <Button danger icon={<DeleteOutlined />} style={{ borderRadius: '8px' }}>
                                                        Eliminar
                                                    </Button>
                                                </Popconfirm>
                                            </PermissionGuard>
                                        </Space>
                                    </Space>
                                </Card>
                            </motion.div>
                        </Col>
                    )}
                </Row>
            </motion.div>

            {/* Create / Edit Modal */}
            <Modal
                title={
                    <Space>
                        {editingZone ? <EditOutlined style={{ color: '#1890ff' }} /> : <PlusOutlined style={{ color: '#1890ff' }} />}
                        <span>{editingZone ? 'Editar Zona' : 'Nueva Zona'}</span>
                    </Space>
                }
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()}
                okText={editingZone ? 'Guardar Cambios' : 'Crear Zona'}
                cancelText="Cancelar"
                confirmLoading={saving}
                width={520}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Form.Item
                            name="name"
                            label="Nombre de la zona"
                            rules={[{ required: true, message: 'El nombre es requerido' }]}
                            style={{ gridColumn: 'span 2' }}
                        >
                            <Input placeholder="Ej: Zona Norte Caracas" />
                        </Form.Item>

                        <Form.Item
                            name="companyId"
                            label="Empresa"
                            rules={[{ required: true, message: 'La empresa es requerida' }]}
                        >
                            <Select placeholder="Seleccionar empresa">
                                {COMPANIES.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item name="stateId" label="Estado de referencia">
                            <Select showSearch placeholder="Seleccionar estado" allowClear optionFilterProp="children">
                                {VENEZUELA_STATES.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item name="region" label="Región">
                            <Input placeholder="Ej: Región Capital" />
                        </Form.Item>

                        <Form.Item name="coordinator" label="Coordinador">
                            <Input placeholder="Nombre del coordinador" />
                        </Form.Item>

                        <Form.Item name="coordinatorNum" label="Teléfono Coordinador">
                            <Input placeholder="Ej: 0412-1234567" />
                        </Form.Item>
                    </div>

                    <Form.Item name="geographicRoute" label="Ruta / Detalles Geográficos">
                        <Input.TextArea
                            rows={3}
                            placeholder="Describe la ruta o cobertura geográfica de esta zona..."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ZonesPage;
