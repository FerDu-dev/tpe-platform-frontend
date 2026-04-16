import React, { useState, useEffect } from 'react';
import {
    Table, Button, Space, Tag, Typography, message, Tooltip,
    Card, Row, Col, Descriptions, Divider, Input
} from 'antd';
import {
    SearchOutlined, EyeOutlined, TrophyOutlined, CalendarOutlined,
    UserOutlined, MailOutlined, PhoneOutlined, FilePdfOutlined,
    VideoCameraOutlined, FolderOpenOutlined,
    IdcardOutlined, EnvironmentOutlined, FilterOutlined, ReloadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { hiresService, HireRecord } from '../../../services/hiresService';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const HiresPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [hires, setHires] = useState<HireRecord[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);
    const [detailHire, setDetailHire] = useState<HireRecord | null>(null);

    const loadHires = async (p = 1, s = search) => {
        setLoading(true);
        try {
            const res = await hiresService.fetchHires({
                page: p,
                search: s || undefined,
                limit: 10
            });
            setHires(res.data);
            setMeta(res.meta);
        } catch (error) {
            console.error('Error loading hires', error);
            message.error('Error al cargar historial de contrataciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHires(1);
    }, []);

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
        loadHires(1, val);
    };

    const columns: ColumnsType<HireRecord> = [
        {
            title: 'Candidato',
            key: 'candidate',
            render: (_, r) => (
                <Space onClick={() => setDetailHire(r)} style={{ cursor: 'pointer' }}>
                    <div style={{ 
                        width: 32, height: 32, background: '#f6ffed', 
                        borderRadius: '50%', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <UserOutlined style={{ color: '#52c41a' }} />
                    </div>
                    <div>
                        <Text strong>{r.candidate.firstName} {r.candidate.lastName}</Text>
                        <div><Text type="secondary" style={{ fontSize: '12px' }}>{r.candidate.nationalId}</Text></div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Requisición / Empresa',
            key: 'requisition',
            render: (_, r) => {
                const company = r.jobRequisition?.company;
                const companyDisplay = typeof company === 'object' ? (company as any).name : (company || 'N/A');
                return (
                    <div>
                        <Text strong>{r.jobRequisition?.title || 'N/A'}</Text>
                        <div><Text type="secondary" style={{ fontSize: '12px' }}>{companyDisplay}</Text></div>
                    </div>
                );
            }
        },
        {
            title: 'Zona',
            key: 'zone',
            render: (_, r) => {
                const zone = r.jobRequisition?.zone;
                const zoneDisplay = typeof zone === 'object' ? (zone as any).name : (zone || 'N/A');
                return <Tag color="blue">{zoneDisplay}</Tag>;
            }
        },
        {
            title: 'Fecha Inicio',
            dataIndex: 'effectiveStartDate',
            render: (date) => (
                <Space>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    <Text>{date ? new Date(date).toLocaleDateString() : 'N/A'}</Text>
                </Space>
            )
        },
        {
            title: 'Estado',
            key: 'status',
            render: () => <Tag color="green" icon={<TrophyOutlined />}>CONTRATADO</Tag>
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 80,
            align: 'right',
            render: (_, r) => (
                <Tooltip title="Ver Detalle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => setDetailHire(r)} 
                        style={{ color: '#1890ff' }}
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <div style={{ minHeight: '100%' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
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
                                placeholder="Buscar por nombre o cédula..."
                                allowClear
                                prefix={<SearchOutlined />}
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                                style={{ maxWidth: '400px', borderRadius: '6px' }}
                            />
                        </Col>
                        <Col>
                            <Button icon={<ReloadOutlined />} onClick={() => loadHires(page)}>
                                Actualizar
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Main Content */}
                <Row gutter={[20, 20]}>
                    <Col xs={24} lg={detailHire ? 16 : 24}>
                        <Card style={{ borderRadius: '12px' }} bodyStyle={{ padding: 0 }}>
                            <Table
                                columns={columns}
                                dataSource={hires}
                                rowKey="id"
                                loading={loading}
                                pagination={meta ? {
                                    current: page,
                                    total: meta.total,
                                    pageSize: 10,
                                    onChange: (p) => {
                                        setPage(p);
                                        loadHires(p);
                                    }
                                } : false}
                                onRow={(record) => ({
                                    onClick: () => setDetailHire(record),
                                    style: { cursor: 'pointer' }
                                })}
                                rowClassName={(record) => record.id === detailHire?.id ? 'selected-row' : ''}
                            />
                        </Card>
                    </Col>

                    {detailHire && (
                        <Col xs={24} lg={8}>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <Card
                                    title={
                                        <Space>
                                            <TrophyOutlined style={{ color: '#faad14' }} />
                                            <span>Detalle de Contratación</span>
                                        </Space>
                                    }
                                    extra={<Button type="text" onClick={() => setDetailHire(null)} size="small">✕</Button>}
                                    style={{ borderRadius: '12px', border: '1px solid #f6ffed', background: '#fafdfa' }}
                                >
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ 
                                                width: 64, height: 64, background: '#f6ffed', 
                                                borderRadius: '50%', display: 'flex', 
                                                alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto 12px'
                                            }}>
                                                <TrophyOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                                            </div>
                                            <Title level={4} style={{ marginBottom: 4 }}>
                                                {detailHire.candidate.firstName} {detailHire.candidate.lastName}
                                            </Title>
                                            <Tag color="green">CONTRATADO</Tag>
                                        </div>

                                        <Divider orientation="left" style={{ margin: '0' }}><EnvironmentOutlined /> Ubicación y Vacante</Divider>
                                        <Descriptions column={1} size="small" bordered>
                                            <Descriptions.Item label="Puesto">{detailHire.jobRequisition?.title}</Descriptions.Item>
                                            <Descriptions.Item label="Empresa">
                                                {typeof detailHire.jobRequisition?.company === 'object' ? (detailHire.jobRequisition.company as any).name : detailHire.jobRequisition?.company}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Zona">
                                                <Tag color="orange" style={{ fontWeight: 'bold' }}>
                                                    {typeof detailHire.jobRequisition?.zone === 'object' ? (detailHire.jobRequisition.zone as any).name : (detailHire.jobRequisition?.zone || 'N/A')}
                                                </Tag>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Fecha Inicio">
                                                <Space>
                                                    <CalendarOutlined style={{ color: '#1890ff' }} />
                                                    {detailHire.effectiveStartDate ? new Date(detailHire.effectiveStartDate).toLocaleDateString() : 'Por definir'}
                                                </Space>
                                            </Descriptions.Item>
                                        </Descriptions>

                                        <Divider orientation="left" style={{ margin: '0' }}><UserOutlined /> Contacto</Divider>
                                        <Descriptions column={1} size="small" bordered>
                                            <Descriptions.Item label={<Space><IdcardOutlined /> Cédula</Space>}>{detailHire.candidate.nationalId}</Descriptions.Item>
                                            <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>{detailHire.candidate.email}</Descriptions.Item>
                                            <Descriptions.Item label={<Space><PhoneOutlined /> Teléfono</Space>}>{detailHire.candidate.phone}</Descriptions.Item>
                                        </Descriptions>

                                        <Divider orientation="left" style={{ margin: '0' }}><FolderOpenOutlined /> Documentos</Divider>
                                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                                            {detailHire.candidate.driveFolderUrl && (
                                                <Button 
                                                    block 
                                                    type="primary" 
                                                    icon={<FolderOpenOutlined />} 
                                                    href={detailHire.candidate.driveFolderUrl} 
                                                    target="_blank"
                                                    style={{ background: '#2b457c', borderColor: '#2b457c' }}
                                                >
                                                    Google Drive
                                                </Button>
                                            )}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <Button 
                                                    disabled={!detailHire.candidate.cvUrl}
                                                    icon={<FilePdfOutlined />} 
                                                    href={detailHire.candidate.cvUrl} 
                                                    target="_blank"
                                                >
                                                    Ver CV
                                                </Button>
                                                <Button 
                                                    disabled={!detailHire.candidate.videoUrl}
                                                    icon={<VideoCameraOutlined />} 
                                                    href={detailHire.candidate.videoUrl} 
                                                    target="_blank"
                                                >
                                                    Ver Video
                                                </Button>
                                            </div>
                                        </Space>

                                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                Registro histórico inalterable.
                                            </Text>
                                        </div>
                                    </Space>
                                </Card>
                            </motion.div>
                        </Col>
                    )}
                </Row>
            </motion.div>
        </div>
    );
};

export default HiresPage;
