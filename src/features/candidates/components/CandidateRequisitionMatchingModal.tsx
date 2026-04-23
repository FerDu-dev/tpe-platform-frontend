import React, { useState, useEffect } from 'react';
import { Modal, Table, Select, Space, Button, Typography, Tag, message, Row, Col, Divider, Alert, Popconfirm } from 'antd';
import {
    EnvironmentOutlined,
    BankOutlined,
    GlobalOutlined,
    CheckCircleOutlined,
    UserOutlined,
    DisconnectOutlined
} from '@ant-design/icons';
import { Requisition, Candidate, PaginatedResponse } from '../../../types';
import { requisitionService } from '../../../services/requisitionService';
import { zonesService } from '../../../services/zonesService';
import { useAppSelector } from '../../../app/store';
import { selectPositions } from '../../../store/masterDataSlice';

const { Title, Text } = Typography;
const { Option } = Select;

interface CandidateRequisitionMatchingModalProps {
    open: boolean;
    onClose: () => void;
    candidate: Candidate;
    onAssign: (requisitionId: string | null) => Promise<void>;
}

const COMPANIES = [
    { id: 1, name: 'Febeca' },
    { id: 2, name: 'Beval' },
    { id: 3, name: 'Sillaca' },
    { id: 4, name: 'Grupo' },
];

const CandidateRequisitionMatchingModal: React.FC<CandidateRequisitionMatchingModalProps> = ({
    open,
    onClose,
    candidate,
    onAssign
}) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Requisition[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0
    });

    const positions = useAppSelector(selectPositions);
    const [zones, setZones] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        search: '',
        companyId: undefined as number | undefined,
        zoneId: undefined as number | undefined,
    });

    useEffect(() => {
        if (open) {
            fetchRequisitions();
        }
    }, [open, pagination.current, pagination.pageSize, filters.companyId, filters.zoneId, filters.search]);

    useEffect(() => {
        if (open) {
            fetchAllZones(filters.companyId);
        }
    }, [open, filters.companyId]);

    const fetchAllZones = async (companyId?: number) => {
        try {
            // Fetching zones with a large limit to allow searching
            const res = await zonesService.fetchZones(companyId, undefined, 1, 100);
            setZones(res.data);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const fetchRequisitions = async () => {
        setLoading(true);
        try {
            const res: PaginatedResponse<Requisition> = await requisitionService.fetchRequisitions({
                page: pagination.current,
                limit: pagination.pageSize,
                status: 'OPEN',
                search: filters.search,
                companyId: filters.companyId,
                zoneId: filters.zoneId
            } as any);

            setData(res.data);
            setPagination(prev => ({ ...prev, total: res.meta.total }));
        } catch (error) {
            message.error('Error al cargar requisiciones');
        } finally {
            setLoading(false);
        }
    };


    const handleUnassignClick = async () => {
        try {
            await onAssign(null);
            message.success('Candidato desvinculado exitosamente');
            onClose();
        } catch (error) {
            // Error managed by parent drawer
        }
    };

    const handleTableChange = (newPagination: any) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const handleAssignClick = (requisition: Requisition) => {
        const normalize = (s: any) => {
            if (typeof s !== 'string') return '';
            return s.toLowerCase()
                .trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, ""); // Remove accents
        };

        const candStateName = candidate.municipality?.state?.name || (typeof candidate.state === 'object' ? candidate.state?.name : candidate.state);
        const reqStateName = requisition.state?.name || requisition.location || 'Desconocida';

        const candidateState = normalize(candStateName);
        const reqState = normalize(reqStateName);

        const doAssign = async () => {
            try {
                await onAssign(requisition.id);
                message.success('Candidato asignado exitosamente');
                onClose();
            } catch (error) {
                // Error handled by onAssign/CandidateDrawer
            }
        };

        // Improved "smart" comparison: Match if identical or one contains the other
        const isMatch = !candidateState || !reqState || 
                        candidateState === reqState || 
                        reqState.includes(candidateState) || 
                        candidateState.includes(reqState);

        if (!isMatch) {
            Modal.confirm({
                title: 'Diferencia de Ubicación Geográfica',
                content: (
                    <div>
                        <p><strong>{candidate.firstName} {candidate.lastName}</strong> pertenece al estado: <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{candStateName || 'Desconocido'}</span>.</p>
                        <p>La requisición seleccionada es del estado: <span style={{ color: '#2b457c', fontWeight: 'bold' }}>{reqStateName}</span>.</p>
                        <p>¿Estás seguro de que deseas asignársela?</p>
                    </div>
                ),
                okText: 'Sí, Asignar',
                cancelText: 'Cancelar',
                onOk: doAssign,
            });
        } else {
            doAssign();
        }
    };

    const columns = [
        {
            title: 'Zona / Estado',
            key: 'zone',
            render: (record: Requisition) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{typeof record.zone === 'object' ? record.zone?.name : record.zone}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.location || 'N/A'}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Cargo',
            key: 'title',
            render: (_: any, record: Requisition) => (
                <Space direction="vertical" size={2}>
                    <Tag color="blue">{record.title}</Tag>
                    {record.isConfidential && <Tag color="error" style={{ fontSize: '10px', height: '18px', lineHeight: '16px' }}>CONFIDENCIAL</Tag>}
                </Space>
            )
        },
        {
            title: 'Empresa',
            dataIndex: 'company',
            key: 'company',
            render: (text: string) => (
                <Space>
                    <BankOutlined />
                    {text}
                </Space>
            )
        },
        {
            title: 'Prioridad',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority: string) => (
                <Tag color={priority === 'A' ? 'red' : priority === 'B' ? 'orange' : 'green'}>
                    Prio {priority}
                </Tag>
            )
        },
        {
            title: 'Acción',
            key: 'action',
            render: (_: any, record: Requisition) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleAssignClick(record)}
                >
                    Asignar
                </Button>
            )
        }
    ];

    const candidateStateLabel = typeof candidate.state === 'object' ? candidate.state?.name : candidate.state;

    return (
        <Modal
            title={
                <Space>
                    <GlobalOutlined style={{ color: '#2b457c' }} />
                    <span>Asignación Inteligente de Vacantes</span>
                </Space>
            }
            open={open}
            onCancel={onClose}
            width={900}
            footer={null}
            centered
            bodyStyle={{ padding: '0px' }}
        >
            <div style={{ padding: '24px', background: '#f0f5ff', borderBottom: '1px solid #adc6ff' }}>
                <Row gutter={24} align="middle">
                    <Col flex="auto">
                        <Space direction="vertical" size={2}>
                            <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Candidato Seleccionado</Text>
                            <Title level={4} style={{ margin: 0, color: '#003a8c' }}>{candidate.firstName} {candidate.lastName}</Title>
                            <Space split={<Divider type="vertical" />}>
                                <Text style={{ fontSize: '13px' }}>
                                    <EnvironmentOutlined /> {candidate.municipality?.state?.name || candidateStateLabel || 'Ubicación no especificada'}
                                    {candidate.municipality?.name && `, ${candidate.municipality.name}`}
                                </Text>
                                <Text style={{ fontSize: '13px' }}>
                                    <UserOutlined /> {candidate.profession || 'Profesión no especificada'}
                                </Text>
                                <Tag color="blue" style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}>
                                    Etapa: {candidate.currentStageName || 'Postulado'}
                                </Tag>
                            </Space>
                        </Space>
                    </Col>
                    {candidate.idx && candidate.idx !== 'N/A' && (
                        <Col>
                            <Popconfirm
                                title="¿Desvincular vacante?"
                                description="El candidato quedará sin ninguna vacante asignada. ¿Deseas continuar?"
                                onConfirm={handleUnassignClick}
                                okText="Sí, desvincular"
                                cancelText="Cancelar"
                                okButtonProps={{ danger: true }}
                            >
                                <Button 
                                    danger 
                                    type="dashed" 
                                    icon={<DisconnectOutlined />}
                                    size="large"
                                    style={{ height: '54px', borderRadius: '8px', fontWeight: 600, background: '#fff' }}
                                >
                                    Desvincular Actual
                                </Button>
                            </Popconfirm>
                        </Col>
                    )}
                </Row>
            </div>

            <div style={{ padding: '0 24px', marginTop: '16px' }}>
                {candidate.idx && candidate.idx !== 'N/A' ? (
                    <Alert
                        message="Cambio de Vacante Detectado"
                        description={
                            <span>
                                Este candidato ya tiene vinculada la vacante <b>ID: {candidate.idx}</b> ({candidate.requisitionZoneName || 'Zona no especificada'}). 
                                Al seleccionar una nueva, la anterior se liberará automáticamente.
                            </span>
                        }
                        type="warning"
                        showIcon
                    />
                ) : (
                    <Alert
                        message="Pendiente por Asignar"
                        description="Este candidato no tiene una vacante asignada. Selecciona la más adecuada de la lista inferior para emparejarlo."
                        type="info"
                        showIcon
                    />
                )}
            </div>

            <div style={{ padding: '24px' }}>
                <Row gutter={16} style={{ marginBottom: '20px' }}>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filtrar por Cargo"
                            allowClear
                            showSearch
                            onChange={(val) => {
                                setFilters(prev => ({ ...prev, search: val || '' }));
                                setPagination(prev => ({ ...prev, current: 1 }));
                            }}
                        >
                            {positions.map(p => <Option key={p} value={p}>{p}</Option>)}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filtrar por Empresa"
                            allowClear
                            onChange={(val) => {
                                setFilters(prev => ({ ...prev, companyId: val, zoneId: undefined }));
                                setPagination(prev => ({ ...prev, current: 1 }));
                            }}
                        >
                            {COMPANIES.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filtrar por Zona"
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            onChange={(val) => {
                                setFilters(prev => ({ ...prev, zoneId: val }));
                                setPagination(prev => ({ ...prev, current: 1 }));
                            }}
                            value={filters.zoneId}
                        >
                            {zones.map(z => <Option key={z.id} value={z.id}>{z.name}</Option>)}
                        </Select>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        size: 'small',
                        showTotal: (total) => `Total ${total} vacantes disponibles`
                    }}
                    onChange={handleTableChange}
                    size="middle"
                    className="premium-table"
                    rowClassName={(record) => {
                        const isCurrent = String(record.id) === String(candidate.idx);
                        return isCurrent ? 'current-requisition-row' : '';
                    }}
                />
            </div>

            <style>{`
                .premium-table .ant-table-thead > tr > th {
                    background: #fafafa;
                    font-weight: 700;
                    color: #595959;
                }
                .premium-table .ant-table-tbody > tr:hover > td {
                    background: #f0f5ff !important;
                }
                .current-requisition-row {
                    background-color: #f6ffed !important;
                }
                .current-requisition-row > td {
                    border-top: 2px solid #52c41a !important;
                    border-bottom: 2px solid #52c41a !important;
                }
                .current-requisition-row > td:first-child {
                    border-left: 4px solid #52c41a !important;
                }
            `}</style>
        </Modal>
    );
};

export default CandidateRequisitionMatchingModal;
