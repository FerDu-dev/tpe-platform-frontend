import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Spin, Empty, Tag, List, Space } from 'antd';
import {
    UserOutlined,
    GlobalOutlined,
    BarChartOutlined,
    RocketOutlined,
    SwapOutlined,
    TeamOutlined,
    SearchOutlined,
    FireOutlined,
    ThunderboltOutlined,
    InfoCircleOutlined,
    LineChartOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { Button, message, Avatar, Divider, Input, Pagination } from 'antd';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    loadRecruitmentAnalytics,
    selectRecruitmentAnalytics,
    selectAnalyticsLoading,
    selectRequisitions,
    selectRequisitionsFilters,
    setFilters
} from '../store/requisitionsSlice';
import { STAGE_COLORS } from '../../../services/candidateService';
import { motion } from 'framer-motion';
import { requisitionService } from '../../../services/requisitionService';
import { candidateService } from '../../../services/candidateService';
// import { updateCandidateStage } from '../../candidates/store/candidatesSlice';
import CandidateListModal from './CandidateListModal';
import SmartMatchingModal from './SmartMatchingModal';
import CandidateDrawer from '../../candidates/components/CandidateDrawer';

const { Title, Text, Paragraph } = Typography;


const COMPANIES = [
    { id: 1, name: 'Febeca' },
    { id: 2, name: 'Beval' },
    { id: 3, name: 'Sillaca' },
    { id: 4, name: 'Grupo' },
];

const STAGES = [
    { id: 1, name: 'Bienvenida' },
    { id: 2, name: 'Video' },
    { id: 3, name: 'Pruebas' },
    { id: 4, name: 'Entrev. Pers.' },
    { id: 5, name: 'Entrev. Técn.' },
    { id: 6, name: 'Ref/Médicas' },
    { id: 7, name: 'Oferta' },
    { id: 8, name: 'Contratado' },
];

const RecruitmentDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const analytics = useAppSelector(selectRecruitmentAnalytics);
    const analyticsLoading = useAppSelector(selectAnalyticsLoading); // Renamed from 'loading' to avoid conflict
    const requisitions = useAppSelector(selectRequisitions);

    const filters = useAppSelector(selectRequisitionsFilters);

    // Deep-dive detail for specific requisition fetched on demand
    const [fullRequisition, setFullRequisition] = useState<any>(null);
    const [availableCandidates, setAvailableCandidates] = useState<any[]>([]);
    const [loadingOps, setLoadingOps] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [selectedStageId, setSelectedStageId] = useState<number | undefined>(undefined);
    const [isSmartModalVisible, setIsSmartModalVisible] = useState(false);
    // New state for Drawer
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // New state for Company Dashboard
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    useEffect(() => {
        // Load analytics based on global filters
        dispatch(loadRecruitmentAnalytics({
            companyId: filters.companyId,
            jobRequisitionId: filters.jobRequisitionId,
            stateId: filters.stateId,
            status: 'ACTIVE'
        }));

        // Load available candidates if in Bienvenida
        candidateService.fetch_candidates_active({ stageId: 1 })
            .then(res => {
                const withoutReq = res.data.filter((c: any) => !c.applications?.[0]?.jobRequisitionId);
                setAvailableCandidates(withoutReq);
            });
    }, [dispatch, filters.companyId, filters.jobRequisitionId, filters.stateId, refreshKey]);

    useEffect(() => {
        if (filters.jobRequisitionId) {
            setLoadingOps(true);
            requisitionService.findOne(filters.jobRequisitionId.toString())
                .then(setFullRequisition)
                .finally(() => setLoadingOps(false));
        } else {
            setFullRequisition(null);
        }
    }, [filters.jobRequisitionId]);

    // const handleAdvance = async (candidate: any) => {
    //     const currentApp = candidate.applications?.[0];
    //     const currentStageId = currentApp?.currentStageId;
    //     if (!currentStageId || currentStageId >= 8) return;

    //     // Validation: Must have a requisition to advance
    //     if (!currentApp?.jobRequisitionId) {
    //         return message.error('La vacante que tenía este candidato ya no está disponible. Por favor, asigne una nueva vacante para continuar.');
    //     }

    //     // Validation: Assigned requisition must be OPEN to advance
    //     if (currentApp?.jobRequisition?.status && currentApp?.jobRequisition?.status !== 'OPEN') {
    //         const statusLabel = currentApp?.jobRequisition?.status === 'PAUSED' ? 'Pausada' :
    //             currentApp?.jobRequisition?.status === 'CANCELLED' ? 'Cancelada' : 'Cerrada';
    //         return message.error(`No se puede avanzar: La vacante asignada está ${statusLabel}. Por favor, asigne una nueva vacante abierta.`);
    //     }

    //     try {
    //         await dispatch(updateCandidateStage({ id: candidate.id, newStage: (currentStageId + 1) as any })).unwrap();
    //         message.success(`Candidato ${candidate.firstName} avanzado a la etapa ${currentStageId + 1}`);
    //         // Refresh detailed data
    //         if (selectedRequisitionId) {
    //             const updated = await requisitionService.findOne(selectedRequisitionId.toString());
    //             setFullRequisition(updated);
    //         }
    //         dispatch(loadRecruitmentAnalytics({ companyId: selectedCompanyId, jobRequisitionId: selectedRequisitionId, status: 'ACTIVE' }));
    //     } catch (e: any) {
    //         message.error(e || 'No se pudo avanzar al candidato. Verifique que cumpla los requisitos de la etapa.');
    //     }
    // };

    const handleLinkCandidate = async (candidateId: string) => {
        if (!filters.jobRequisitionId) return;
        try {
            // Find application ID
            const candidate = availableCandidates.find(c => c.id === candidateId);
            const applicationId = candidate?.applications?.[0]?.id;
            if (!applicationId) throw new Error('No se encontró aplicación activa para el candidato');

            await candidateService.updateApplicationRequisition(applicationId, filters.jobRequisitionId);
            message.success('Candidato vinculado correctamente');

            // Refresh
            const updated = await requisitionService.findOne(filters.jobRequisitionId.toString());
            setFullRequisition(updated);
            setAvailableCandidates(prev => prev.filter(c => c.id !== candidateId));
            dispatch(loadRecruitmentAnalytics({ companyId: filters.companyId, jobRequisitionId: filters.jobRequisitionId, status: 'ACTIVE' }));
        } catch (e: any) {
            message.error('Error al vincular candidato');
        }
    };

    const handleViewCandidate = (candidate: any) => {
        setSelectedCandidate(candidate);
        setDrawerVisible(true);
    };

    const handleRefreshData = () => {
        setRefreshKey(prev => prev + 1);
        dispatch(loadRecruitmentAnalytics({
            companyId: filters.companyId,
            jobRequisitionId: filters.jobRequisitionId,
            status: 'ACTIVE'
        }));
        if (filters.jobRequisitionId) {
            requisitionService.findOne(filters.jobRequisitionId.toString()).then(setFullRequisition);
        }
    };

    const chartData = STAGES.map(stage => ({
        name: stage.name,
        count: analytics?.countsByStage[stage.id] || 0,
        color: STAGE_COLORS[stage.id] || '#d9d9d9'
    }));

    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        transition: 'all 0.3s ease'
    };

    const gradientCard = (color: string) => ({
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: '#fff',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    });

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100%' }}>
            {/* Header Area - Now using global filters */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '32px' }}
            >
                <Row gutter={[24, 24]} align="middle">
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                <BarChartOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                                Analítica de Reclutamiento {filters.jobRequisitionId ? '(Detallada)' : '(Vista General)'}
                            </Title>
                            <Space>
                                {filters.jobRequisitionId && (
                                    <Button
                                        type="primary"
                                        size="middle"
                                        icon={<RocketOutlined />}
                                        style={{ borderRadius: '8px', background: '#1890ff', border: 'none', boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)' }}
                                        onClick={() => setIsSmartModalVisible(true)}
                                    >
                                        Emparejamiento Inteligente
                                    </Button>
                                )}
                                <Button icon={<SwapOutlined />} onClick={handleRefreshData}>
                                    Actualizar
                                </Button>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </motion.div>

            {(!filters.companyId) ? (
                <div style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card style={{ ...glassStyle, width: '520px', textAlign: 'center', padding: '40px' }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <Space direction="vertical" size="middle">
                                    <Text strong style={{ fontSize: '22px', color: '#1890ff' }}>
                                        Contexto no seleccionado
                                    </Text>
                                    <Paragraph type="secondary" style={{ fontSize: '16px' }}>
                                        Para visualizar el Dashboard, por favor utiliza la barra de filtros superior para elegir una empresa y, opcionalmente, una vacante.
                                    </Paragraph>
                                    <div style={{ marginTop: '24px' }}>
                                        <div style={{ padding: '16px', background: '#f0f7ff', borderRadius: '12px', border: '1px dashed #1890ff' }}>
                                            <Text type="secondary">
                                                Tip Senior: Si seleccionas una empresa pero no una vacante, verás las métricas acumuladas de toda la empresa.
                                            </Text>
                                        </div>
                                    </div>
                                </Space>
                            }
                        />
                    </Card>
                </div>
            ) : !filters.jobRequisitionId ? (
                <motion.div
                    key="company-dashboard"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Company Summary Metrics */}
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={8}>
                                <Card style={{ ...gradientCard('#1890ff'), height: '140px' }} bodyStyle={{ padding: '20px' }}>
                                    <Statistic
                                        title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Requisiciones Abiertas</Text>}
                                        value={requisitions.filter(r => r.companyId === filters.companyId && r.status === 'OPEN').length}
                                        prefix={<RocketOutlined />}
                                        valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                    />
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Personal de {COMPANIES.find(c => c.id === filters.companyId)?.name}</Text>
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card style={{ ...gradientCard('#722ed1'), height: '140px' }} bodyStyle={{ padding: '20px' }}>
                                    <Statistic
                                        title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Candidatos Totales</Text>}
                                        value={analytics?.totalParticipants || 0}
                                        prefix={<TeamOutlined />}
                                        valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                    />
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Asignados a todas las vacantes</Text>
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card style={{ ...gradientCard('#fa8c16'), height: '140px' }} bodyStyle={{ padding: '20px' }}>
                                    <Statistic
                                        title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Búsquedas de Alta Prioridad</Text>}
                                        value={requisitions.filter(r => r.companyId === filters.companyId && r.status === 'OPEN' && r.priority === 'A').length}
                                        prefix={<FireOutlined />}
                                        valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                    />
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Requieren atención inmediata</Text>
                                </Card>
                            </Col>
                        </Row>

                        {/* Requisition Grid Section */}
                        <Card
                            style={glassStyle}
                            title={
                                <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                                    <Col>
                                        <Space>
                                            <LineChartOutlined style={{ color: '#1890ff' }} />
                                            <span style={{ fontSize: '18px', fontWeight: 600 }}>Vacantes Activas</span>
                                        </Space>
                                    </Col>
                                    <Col>
                                        <Input
                                            placeholder="Buscar vacante por título o zona..."
                                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                            style={{ width: 300, borderRadius: '8px' }}
                                            allowClear
                                            value={searchTerm}
                                            onChange={e => {
                                                setSearchTerm(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </Col>
                                </Row>
                            }
                        >
                            {(() => {
                                const filteredReqs = requisitions.filter(r =>
                                    r.companyId === filters.companyId &&
                                    r.status === 'OPEN' &&
                                    (r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (typeof r.zone === 'object' ? r.zone?.name : r.zone).toLowerCase().includes(searchTerm.toLowerCase()))
                                );

                                if (filteredReqs.length === 0) return <Empty description="No se encontraron vacantes con los filtros aplicados." />;

                                // Group by priority: A (High), B (Medium), C (Low)
                                const paginatedReqs = filteredReqs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

                                const grouped = {
                                    A: paginatedReqs.filter(r => r.priority === 'A'),
                                    B: paginatedReqs.filter(r => r.priority === 'B'),
                                    C: paginatedReqs.filter(r => r.priority === 'C'),
                                };

                                const priorities = [
                                    { key: 'A', label: 'Prioridad Alta', icon: <FireOutlined style={{ color: '#f5222d' }} /> },
                                    { key: 'B', label: 'Prioridad Media', icon: <ThunderboltOutlined style={{ color: '#fa8c16' }} /> },
                                    { key: 'C', label: 'Prioridad Estándar', icon: <InfoCircleOutlined style={{ color: '#1890ff' }} /> },
                                ] as const;

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        {priorities.map(p => {
                                            const items = grouped[p.key as keyof typeof grouped];
                                            if (items.length === 0) return null;

                                            return (
                                                <div key={p.key}>
                                                    <Divider orientation="left" style={{ margin: '0 0 16px 0' }}>
                                                        <Space>
                                                            {p.icon}
                                                            <Text strong style={{ fontSize: '15px', color: '#595959' }}>{p.label}</Text>
                                                            <Tag style={{ borderRadius: '10px', marginLeft: '4px' }}>{items.length}</Tag>
                                                        </Space>
                                                    </Divider>
                                                    <Row gutter={[16, 16]}>
                                                        {items.map(req => (
                                                            <Col xs={24} sm={12} lg={8} key={req.id}>
                                                                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                                                                    <Card
                                                                        hoverable
                                                                        className="requisition-card"
                                                                        style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}
                                                                        bodyStyle={{ padding: '16px' }}
                                                                        onClick={() => dispatch(setFilters({ jobRequisitionId: Number(req.id) }))}
                                                                    >
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                                            <Title level={5} style={{ margin: 0, fontSize: '14px' }}>{req.title}</Title>
                                                                            <Tag color={req.priority === 'A' ? 'error' : req.priority === 'B' ? 'warning' : 'blue'} style={{ borderRadius: '4px', margin: 0 }}>
                                                                                Prio {req.priority}
                                                                            </Tag>
                                                                        </div>
                                                                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                                                            <Space style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                                                <GlobalOutlined /> {typeof req.zone === 'object' ? `${req.zone?.name}, ${req.zone?.region} - ${req.state?.name}` : req.zone}
                                                                            </Space>
                                                                            <div style={{ marginTop: '12px' }}>
                                                                                <Row gutter={12} align="middle">
                                                                                    <Col span={24}>
                                                                                        <Statistic
                                                                                            value={req.applicants || 0}
                                                                                            title={<span style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 500 }}>Postulantes en proceso</span>}
                                                                                            prefix={<TeamOutlined style={{ color: '#1890ff', fontSize: '16px' }} />}
                                                                                            valueStyle={{ fontSize: '24px', fontWeight: 700, color: '#1890ff' }}
                                                                                        />
                                                                                    </Col>
                                                                                </Row>

                                                                                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                    <Space size={8}>
                                                                                        <Tag
                                                                                            color="green"
                                                                                            style={{ borderRadius: '12px', border: 'none', padding: '1px 12px', fontSize: '11px' }}
                                                                                        >
                                                                                            Requisición Abierta
                                                                                        </Tag>
                                                                                        {req.vacanciesCount > 1 && (
                                                                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                                                ({req.filledCount || 0} de {req.vacanciesCount} cubiertas)
                                                                                            </Text>
                                                                                        )}
                                                                                    </Space>
                                                                                    <Button type="link" size="small" style={{ padding: 0, fontWeight: 500 }}>
                                                                                        Ir al Dashboard →
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </Space>
                                                                    </Card>
                                                                </motion.div>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </div>
                                            );
                                        })}

                                        {filteredReqs.length > pageSize && (
                                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                                                <Pagination
                                                    current={currentPage}
                                                    pageSize={pageSize}
                                                    total={filteredReqs.length}
                                                    onChange={page => setCurrentPage(page)}
                                                    showSizeChanger={false}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </Card>
                    </Space>
                </motion.div>
            ) : analyticsLoading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" tip="Cargando analíticas..." />
                </div>
            ) : (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Detailed View Header */}
                    <Card style={{ ...glassStyle, marginBottom: -16 }} bodyStyle={{ padding: '12px 24px' }}>
                        <Row justify="space-between" align="middle">
                            <Col style={{ display: 'flex', gap: '12px' }}>
                                <Space size="large">
                                    <Button
                                        icon={<SwapOutlined />}
                                        onClick={() => dispatch(setFilters({ jobRequisitionId: undefined }))}
                                        style={{ borderRadius: '8px', border: '1px solid #1890ff', color: '#1890ff' }}
                                    >
                                        Ver Todas las Vacantes
                                    </Button>
                                    <Divider type="vertical" style={{ height: '24px' }} />
                                    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                        <RocketOutlined style={{ color: '#1890ff', marginRight: '10px' }} />
                                        {fullRequisition?.title}
                                    </Title>
                                </Space>
                                <Space>
                                    <Text type="secondary">Zona:</Text>
                                    <Tag color="blue" icon={<GlobalOutlined />} style={{ borderRadius: '4px' }}>
                                        {typeof fullRequisition?.zone === 'object' 
                                            ? `${fullRequisition.zone.name}, ${fullRequisition.zone.region} - ${fullRequisition.state?.name}` 
                                            : fullRequisition?.zone}
                                    </Tag>
                                </Space>
                            </Col>

                        </Row>
                    </Card>

                    {/* Metrics Row */}
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={8}>
                            <Card
                                style={{ ...gradientCard('#1890ff'), cursor: 'default' }}
                                bodyStyle={{ padding: '20px' }}
                            >
                                <Statistic
                                    title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        {filters.jobRequisitionId ? 'Candidatos en Proceso' : 'Vacantes Abiertas'}
                                    </Text>}
                                    value={filters.jobRequisitionId
                                        ? (analytics?.totalParticipants || 0)
                                        : requisitions.filter(r => r.companyId === filters.companyId && r.status === 'OPEN').length
                                    }
                                    prefix={filters.jobRequisitionId ? <TeamOutlined /> : <RocketOutlined />}
                                    valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                />
                                {filters.jobRequisitionId && fullRequisition?.vacanciesCount > 1 && (
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                        {fullRequisition?.filledCount || 0} de {fullRequisition?.vacanciesCount || 0} posiciones cubiertas
                                    </Text>
                                )}
                                {filters.jobRequisitionId && fullRequisition?.vacanciesCount === 1 && (
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                        Búsqueda activa de 1 vacante
                                    </Text>
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card
                                style={{ ...gradientCard('#722ed1'), cursor: 'pointer' }}
                                bodyStyle={{ padding: '20px' }}
                                onClick={() => {
                                    setModalTitle(filters.jobRequisitionId ? `Candidatos: ${fullRequisition?.title}` : `Todos los Candidatos Activos: ${COMPANIES.find(c => c.id === filters.companyId)?.name}`);
                                    setIsModalVisible(true);
                                }}
                                hoverable
                            >
                                <Statistic
                                    title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Participantes Activos</Text>}
                                    value={analytics?.totalParticipants || 0}
                                    prefix={<TeamOutlined />}
                                    valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                />
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Click para ver lista completa</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card
                                style={{ ...gradientCard('#52c41a'), cursor: 'default' }}
                                bodyStyle={{ padding: '20px' }}
                            >
                                <Statistic
                                    title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Tasa de Avance</Text>}
                                    value={analytics?.advanceRate || 0}
                                    suffix="%"
                                    prefix={<BarChartOutlined />}
                                    valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                />
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Candidatos que pasaron Etapa 1</Text>
                            </Card>
                        </Col>
                    </Row>

                    {/* Middle Row: Charts & Geo Data */}
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            <Card
                                title={
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <RocketOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                                        Distribución por Etapas
                                    </span>
                                }
                                style={glassStyle}
                                className="dashboard-card"
                            >
                                <div style={{ height: 260, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                            <XAxis
                                                dataKey="name"
                                                angle={-45}
                                                textAnchor="end"
                                                interval={0}
                                                height={70}
                                                tick={{ fill: '#8c8c8c', fontSize: 11 }}
                                                stroke="rgba(0,0,0,0.1)"
                                            />
                                            <YAxis tick={{ fill: '#8c8c8c' }} stroke="rgba(0,0,0,0.1)" />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                radius={[4, 4, 0, 0]}
                                                style={{ cursor: 'pointer' }}
                                                onClick={(data) => {
                                                    const stage = STAGES.find(s => s.name === data.name);
                                                    if (stage) {
                                                        setSelectedStageId(stage.id);
                                                        setModalTitle(`Candidatos en: ${stage.name} (${filters.jobRequisitionId ? fullRequisition?.title : COMPANIES.find(c => c.id === filters.companyId)?.name})`);
                                                        setIsModalVisible(true);
                                                    }
                                                }}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Card
                                title={
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <GlobalOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                        Perfiles por Estado
                                    </span>
                                }
                                style={glassStyle}
                                className="dashboard-card"
                            >
                                <List
                                    dataSource={Object.entries(analytics?.countsByState || {}).sort((a, b) => b[1] - a[1])}
                                    renderItem={([state, count]) => (
                                        <List.Item style={{ padding: '12px 0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                <Text strong>{state}</Text>
                                                <Tag color="blue" style={{ borderRadius: '12px', padding: '0 10px' }}>{count}</Tag>
                                            </div>
                                        </List.Item>
                                    )}
                                    locale={{ emptyText: <Empty description="Sin datos geográficos" /> }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Bottom Section: Operations */}
                    <Card
                        style={glassStyle}
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <SwapOutlined style={{ marginRight: '8px', color: '#13c2c2' }} />
                                    Gestión Activa de Candidatos {fullRequisition ? `- ${fullRequisition.title}` : ''}
                                    {fullRequisition && (
                                        <Tag
                                            color={fullRequisition.priority === 'A' ? 'red' : fullRequisition.priority === 'B' ? 'orange' : 'blue'}
                                            style={{ marginLeft: '12px', borderRadius: '12px' }}
                                        >
                                            Prioridad {fullRequisition.priority}
                                        </Tag>
                                    )}
                                </span>
                                {fullRequisition && (
                                    <Tag color="cyan">{fullRequisition.applications?.length || 0} Asignados</Tag>
                                )}
                            </div>
                        }
                    >
                        {loadingOps ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}><Spin tip="Cargando candidatos..." /></div>
                        ) : fullRequisition ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Row gutter={16} align="middle">
                                        <Col span={18}>
                                            <Space direction="vertical" size={0}>
                                                <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Detalles de Requisición</Text>
                                                <Title level={4} style={{ margin: 0 }}>{fullRequisition.title}</Title>
                                                <Space split={<Divider type="vertical" />} style={{ marginTop: '4px' }}>
                                                    <Text><GlobalOutlined /> {fullRequisition.zone?.name ? `${fullRequisition.zone.name}, ${fullRequisition.zone.region} - ${fullRequisition.state?.name}` : 'N/A'}</Text>
                                                    <Text><TeamOutlined /> {fullRequisition.vacanciesCount} Vacantes</Text>
                                                    <Tag color={fullRequisition.status === 'OPEN' ? 'green' : 'gray'}>{fullRequisition.status}</Tag>
                                                </Space>
                                            </Space>
                                        </Col>
                                        <Col span={6} style={{ textAlign: 'right' }}>
                                            <Statistic title="Progreso" value={Math.round((fullRequisition.filledCount / fullRequisition.vacanciesCount) * 100)} suffix="%" />
                                        </Col>
                                    </Row>
                                </div>
                                {fullRequisition.applications?.length === 0 ? (
                                    <div style={{ background: 'rgba(24, 144, 255, 0.02)', borderRadius: '12px', padding: '64px 32px', border: '1px dashed #1890ff', textAlign: 'center' }}>
                                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                                            <Empty
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                description={
                                                    <Space direction="vertical" size="middle">
                                                        <Text strong style={{ fontSize: '18px' }}>Esta vacante aún no tiene candidatos</Text>
                                                        <Text type="secondary" style={{ fontSize: '14px' }}>
                                                            Utiliza nuestra herramienta de <Text strong color="blue">Emparejamiento Inteligente</Text> para encontrar candidatos en Bienvenida que coincidan con la zona de esta requisición.
                                                        </Text>
                                                        <Button
                                                            type="primary"
                                                            size="large"
                                                            icon={<RocketOutlined />}
                                                            style={{ marginTop: '24px', borderRadius: '12px', height: '52px', padding: '0 40px', boxShadow: '0 4px 14px 0 rgba(24, 144, 255, 0.39)' }}
                                                            onClick={() => setIsSmartModalVisible(true)}
                                                        >
                                                            Abrir Emparejamiento
                                                        </Button>
                                                    </Space>
                                                }
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <Row gutter={24}>
                                        <Col xs={24} lg={14}>
                                            <Title level={5} style={{ marginBottom: '16px' }}>Candidatos en Proceso</Title>
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={fullRequisition.applications || []}
                                                renderItem={(app: any) => (
                                                    <List.Item
                                                        onClick={() => handleViewCandidate(app.candidate)}
                                                        actions={[
                                                            <Button
                                                                type="primary"
                                                                ghost
                                                                size="small"
                                                                icon={<EyeOutlined />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewCandidate(app.candidate);
                                                                }}
                                                            >
                                                                Ver Perfil
                                                            </Button>
                                                        ]}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.4)',
                                                            borderRadius: '8px',
                                                            padding: '12px 16px',
                                                            marginBottom: '8px',
                                                            border: '1px solid rgba(0,0,0,0.03)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        className="hover-card-light"
                                                    >
                                                        <List.Item.Meta
                                                            avatar={<Avatar src={app.candidate.avatarUrl} icon={<UserOutlined />} style={{ backgroundColor: STAGE_COLORS[app.currentStageId] }} />}
                                                            title={<Text strong>{app.candidate.firstName} {app.candidate.lastName}</Text>}
                                                            description={
                                                                <Space split={<Divider type="vertical" />}>
                                                                    <Tag style={{ border: 'none', background: STAGE_COLORS[app.currentStageId] + '22', color: STAGE_COLORS[app.currentStageId] }}>
                                                                        {STAGES.find(s => s.id === app.currentStageId)?.name}
                                                                    </Tag>
                                                                    <Text type="secondary" style={{ fontSize: '12px' }}>{app.subStatus || 'Activo'}</Text>
                                                                </Space>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                                locale={{ emptyText: <Empty description="No hay candidatos asignados a esta vacante" /> }}
                                            />
                                        </Col>
                                        <Col xs={24} lg={10}>
                                            <div style={{ background: 'rgba(24, 144, 255, 0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(24, 144, 255, 0.1)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <Title level={5} style={{ margin: 0, color: '#1890ff' }}>Disponibles (Bienvenida)</Title>
                                                    <Tag color="blue" style={{ borderRadius: '10px' }}>{availableCandidates.length} Total</Tag>
                                                </div>
                                                <List
                                                    dataSource={availableCandidates}
                                                    renderItem={(candidate: any) => (
                                                        <List.Item
                                                            onClick={() => handleViewCandidate(candidate)}
                                                            actions={[
                                                                <Button
                                                                    type="link"
                                                                    size="small"
                                                                    icon={<EyeOutlined />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewCandidate(candidate);
                                                                    }}
                                                                >
                                                                    Ver
                                                                </Button>,
                                                                <Button
                                                                    type="dashed"
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleLinkCandidate(candidate.id);
                                                                    }}
                                                                    style={{ borderRadius: '6px' }}
                                                                >
                                                                    Vincular
                                                                </Button>
                                                            ]}
                                                            style={{
                                                                padding: '12px',
                                                                background: '#fff',
                                                                borderRadius: '8px',
                                                                marginBottom: '8px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            className="hover-card-light"
                                                        >
                                                            <List.Item.Meta
                                                                title={<Text strong style={{ fontSize: '13px' }}>{candidate.firstName} {candidate.lastName}</Text>}
                                                                description={
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                            <GlobalOutlined style={{ marginRight: '4px' }} />
                                                                            {candidate.municipality?.name || 'S/M'}, {candidate.municipality?.state?.name || 'S/E'}
                                                                        </Text>
                                                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                                            {candidate.profession || 'Sin profesión'}
                                                                        </Text>
                                                                        <Tag style={{ fontSize: '9px', width: 'fit-content', marginTop: '4px', borderRadius: '4px' }}>
                                                                            {candidate.subStatus || 'Postulado'}
                                                                        </Tag>
                                                                    </div>
                                                                }
                                                            />
                                                        </List.Item>
                                                    )}
                                                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No hay candidatos en espera" /> }}
                                                    pagination={{ pageSize: 4, size: 'small', simple: true }}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                            </div>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span> Selecciona una requisición específica para gestionar candidatos </span>
                                }
                            />
                        )}
                    </Card>
                </Space>
            )}

            <style>{`
                .premium-select .ant-select-selector {
                    border-radius: 8px !important;
                    background: rgba(255,255,255,0.8) !important;
                    border: 1px solid rgba(0,0,0,0.08) !important;
                }
                .dashboard-card {
                    overflow: hidden;
                }
                .dashboard-card .ant-card-head {
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    padding: 0 24px;
                }
                .dashboard-card .ant-card-head-title {
                    font-size: 16px;
                    font-weight: 600;
                }
            `}</style>

            <CandidateListModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                title={modalTitle}
                filters={{
                    companyId: filters.companyId,
                    jobRequisitionId: filters.jobRequisitionId,
                    stageId: selectedStageId
                }}
                onViewCandidate={handleViewCandidate}
                refreshKey={refreshKey}
            />

            <CandidateDrawer
                open={drawerVisible}
                onClose={() => {
                    setDrawerVisible(false);
                    handleRefreshData();
                }}
                candidate={selectedCandidate}
            />

            <SmartMatchingModal
                visible={isSmartModalVisible}
                onClose={() => setIsSmartModalVisible(false)}
                requisition={fullRequisition}
                onCandidateLinked={async () => {
                    // Refresh requisition data
                    if (filters.jobRequisitionId) {
                        const updated = await requisitionService.findOne(filters.jobRequisitionId.toString());
                        setFullRequisition(updated);
                        dispatch(loadRecruitmentAnalytics({ companyId: filters.companyId, jobRequisitionId: filters.jobRequisitionId, status: 'ACTIVE' }));
                    }
                }}
            />
        </div>
    );
};

export default RecruitmentDashboard;
