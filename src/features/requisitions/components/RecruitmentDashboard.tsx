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
    LineChartOutlined,
    ThunderboltOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { Button, Avatar, Divider, Input, Pagination } from 'antd';
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
    const analyticsLoading = useAppSelector(selectAnalyticsLoading);
    const requisitions = useAppSelector(selectRequisitions);
    const filters = useAppSelector(selectRequisitionsFilters);

    const [fullRequisition, setFullRequisition] = useState<any>(null);
    const [_availableCandidates, setAvailableCandidates] = useState<any[]>([]);
    const [_loadingOps, setLoadingOps] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalTitle, _setModalTitle] = useState('');
    const [selectedStageId, _setSelectedStageId] = useState<number | undefined>(undefined);
    const [isSmartModalVisible, setIsSmartModalVisible] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    useEffect(() => {
        dispatch(loadRecruitmentAnalytics({
            companyId: filters.companyId,
            jobRequisitionId: filters.jobRequisitionId,
            stateId: filters.stateId,
            excludeRejected: true
        }));

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

    const handleViewCandidate = (candidate: any) => {
        setSelectedCandidate(candidate);
        setDrawerVisible(true);
    };

    const handleRefreshData = () => {
        setRefreshKey(prev => prev + 1);
        dispatch(loadRecruitmentAnalytics({
            companyId: filters.companyId,
            jobRequisitionId: filters.jobRequisitionId,
            excludeRejected: true
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
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={8}>
                                <Card style={{ ...gradientCard('#1890ff'), height: '140px' }} bodyStyle={{ padding: '20px' }}>
                                    <Statistic
                                        title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Requisiciones Abiertas</Text>}
                                        value={analytics?.requisitionAnalytics?.status?.OPEN || 0}
                                        prefix={<RocketOutlined />}
                                        valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                    />
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Personal de {COMPANIES.find(c => c.id === Number(filters.companyId))?.name || 'la empresa'}</Text>
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
                                <Card style={{ ...gradientCard('#ff4d4f'), height: '140px' }} bodyStyle={{ padding: '20px' }}>
                                    <Statistic
                                        title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Búsqueda de Alta Prioridad</Text>}
                                        value={analytics?.requisitionAnalytics?.priority?.A || 0}
                                        prefix={<FireOutlined />}
                                        valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                    />
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Requieren atención inmediata</Text>
                                </Card>
                            </Col>
                        </Row>

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
                                            placeholder="Buscar vacante..."
                                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                            style={{ width: 300, borderRadius: '8px' }}
                                            allowClear
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
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

                                if (filteredReqs.length === 0) return <Empty description="No se encontraron vacantes." />;

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
                                                            <Text strong>{p.label}</Text>
                                                            <Tag style={{ borderRadius: '10px' }}>{items.length}</Tag>
                                                        </Space>
                                                    </Divider>
                                                    <Row gutter={[16, 16]}>
                                                        {items.map(req => (
                                                            <Col xs={24} sm={12} lg={8} key={req.id}>
                                                                <Card
                                                                    hoverable
                                                                    style={{ borderRadius: '12px' }}
                                                                    onClick={() => dispatch(setFilters({ jobRequisitionId: Number(req.id) }))}
                                                                >
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                        <Title level={5} style={{ fontSize: '14px', margin: 0 }}>{req.title}</Title>
                                                                        <Tag color={req.priority === 'A' ? 'error' : 'blue'}>{req.priority}</Tag>
                                                                    </div>
                                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                        <GlobalOutlined /> {typeof req.zone === 'object' ? req.zone?.name : req.zone}
                                                                    </Text>
                                                                    <div style={{ marginTop: '12px' }}>
                                                                        <Statistic value={req.applicants || 0} title="Postulantes" valueStyle={{ fontSize: '20px', color: '#1890ff' }} />
                                                                    </div>
                                                                </Card>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </div>
                                            );
                                        })}
                                        <Pagination
                                            current={currentPage}
                                            pageSize={pageSize}
                                            total={filteredReqs.length}
                                            onChange={setCurrentPage}
                                            style={{ textAlign: 'center', marginTop: '24px' }}
                                        />
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
                    <Card style={{ ...glassStyle, marginBottom: -16 }} bodyStyle={{ padding: '12px 24px' }}>
                        <Row justify="space-between" align="middle">
                            <Col style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <Button
                                    icon={<SwapOutlined />}
                                    onClick={() => dispatch(setFilters({ jobRequisitionId: undefined }))}
                                    style={{ borderRadius: '8px', border: '1px solid #1890ff', color: '#1890ff' }}
                                >
                                    Ver Todas las Vacantes
                                </Button>
                                <Divider type="vertical" style={{ height: '24px' }} />
                                <Title level={4} style={{ margin: 0 }}>{fullRequisition?.title}</Title>
                                <Tag color="blue">{fullRequisition?.zone?.name || 'N/A'}</Tag>
                            </Col>
                        </Row>
                    </Card>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={8}>
                            <Card style={{ ...gradientCard('#1890ff') }} bodyStyle={{ padding: '20px' }}>
                                <Statistic
                                    title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Candidatos en Proceso</Text>}
                                    value={analytics?.totalParticipants || 0}
                                    prefix={<TeamOutlined />}
                                    valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                />
                                {fullRequisition?.vacanciesCount > 0 && (
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                        {fullRequisition.filledCount} de {fullRequisition.vacanciesCount} cubiertas
                                    </Text>
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card style={{ ...gradientCard('#722ed1') }} bodyStyle={{ padding: '20px' }} hoverable onClick={() => setIsModalVisible(true)}>
                                <Statistic
                                    title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Candidatos Totales</Text>}
                                    value={analytics?.totalParticipants || 0}
                                    prefix={<TeamOutlined />}
                                    valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                />
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Click para lista completa</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card style={{ ...gradientCard('#ff4d4f') }} bodyStyle={{ padding: '20px' }}>
                                <Statistic
                                    title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Prioridad Vacante</Text>}
                                    value={fullRequisition?.priority || 'N/A'}
                                    prefix={<FireOutlined />}
                                    valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                                />
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Importancia del perfil</Text>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            <Card title="Distribución por Etapas" style={glassStyle}>
                                <div style={{ height: 260, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={70} tick={{ fill: '#8c8c8c', fontSize: 11 }} />
                                            <YAxis tick={{ fill: '#8c8c8c' }} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
                            <Card title="Perfiles por Estado" style={glassStyle}>
                                <List
                                    dataSource={Object.entries(analytics?.countsByState || {}).sort((a: any, b: any) => b[1] - a[1])}
                                    renderItem={([state, count]: any) => (
                                        <List.Item>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <Text strong>{state}</Text>
                                                <Tag color="blue">{count}</Tag>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Card
                        title={fullRequisition ? `Gestión de Candidatos - ${fullRequisition.title}` : 'Gestión de Candidatos'}
                        style={glassStyle}
                    >
                        {fullRequisition?.applications?.length > 0 ? (
                            <List
                                dataSource={fullRequisition.applications}
                                renderItem={(app: any) => (
                                    <List.Item
                                        actions={[
                                            <Button type="primary" ghost size="small" onClick={() => handleViewCandidate(app.candidate)}>
                                                Ver Perfil
                                            </Button>
                                        ]}
                                        style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '8px', margin: '8px 0', padding: '12px' }}
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar icon={<UserOutlined />} />}
                                            title={<Text strong>{app.candidate.firstName} {app.candidate.lastName}</Text>}
                                            description={`Etapa actual: ${STAGES.find(s => s.id === app.currentStageId)?.name || 'N/A'}`}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No hay candidatos asignados" />
                        )}
                    </Card>
                </Space>
            )}

            <CandidateListModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                title={modalTitle}
                filters={{
                    companyId: filters.companyId,
                    jobRequisitionId: filters.jobRequisitionId,
                    stageId: selectedStageId
                }}
            />

            {filters.jobRequisitionId && fullRequisition && (
                <SmartMatchingModal
                    visible={isSmartModalVisible}
                    onClose={() => setIsSmartModalVisible(false)}
                    requisition={fullRequisition}
                    onCandidateLinked={handleRefreshData}
                />
            )}

            <CandidateDrawer
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                candidate={selectedCandidate}
                onActionComplete={handleRefreshData}
            />
        </div>
    );
};

export default RecruitmentDashboard;
