import React, { useEffect, useState } from 'react';
import { Button, Space, Typography, Segmented, Alert, Pagination, Divider, Row, Col } from 'antd';
import { AppstoreOutlined, BarsOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import KanbanBoard from '../components/KanbanBoard';
import FilterBar from '../components/FilterBar';
import CandidateDrawer from '../components/CandidateDrawer';
import CandidateListView from '../components/CandidateListView';
import RejectedCandidatesView from '../components/RejectedCandidatesView';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    loadCandidates,
    selectFilteredCandidates,
    selectFilters,
    setFilters,
} from '../store/adminCandidatesSlice';
import {
    loadRecruitmentAnalytics,
    selectRecruitmentAnalytics,
} from '../../administrative-requisitions/store/adminRequisitionsSlice';
import { loadStages } from '../../../store/workflowSlice';
import type { Candidate } from '../../../types';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const candidates = useAppSelector(selectFilteredCandidates);
    const filters = useAppSelector(selectFilters);
    const meta = useAppSelector(state => state.adminCandidates.meta);
    const analytics = useAppSelector(selectRecruitmentAnalytics);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
    const [category, setCategory] = useState<'eligible' | 'not_eligible' | 'rejected'>('eligible');

    // Load workflow stages on mount
    useEffect(() => {
        dispatch(loadStages(1));
        dispatch(loadRecruitmentAnalytics({}));
    }, [dispatch]);

    // Load candidates on mount or when filters/category change
    useEffect(() => {
        const typeMap = {
            eligible: 'active',
            not_eligible: 'notSelectable',
            rejected: 'rejected'
        } as const;

        dispatch(loadCandidates({
            page: 1,
            limit: meta?.limit || 10,
            type: typeMap[category]
        }));
    }, [dispatch, filters, category]);

    const handlePageChange = (page: number, pageSize?: number) => {
        const typeMap = {
            eligible: 'active',
            not_eligible: 'notSelectable',
            rejected: 'rejected'
        } as const;

        dispatch(loadCandidates({
            page,
            limit: pageSize || meta?.limit || 10,
            type: typeMap[category]
        }));
    };

    // Categories are managed by local state only — no filter flags needed in Redux
    const handleToggleCategory = (targetCategory: 'not_eligible' | 'rejected') => {
        const nextCategory = category === targetCategory ? 'eligible' : targetCategory;
        setCategory(nextCategory);

        // Reset filters when switching category so no stale params carry over
        dispatch(setFilters({}));
    };

    const handleRefresh = (shouldClose: boolean = false) => {
        const typeMap = {
            eligible: 'active',
            not_eligible: 'notSelectable',
            rejected: 'rejected'
        } as const;

        dispatch(loadCandidates({
            page: meta?.page || 1,
            limit: meta?.limit || 10,
            type: typeMap[category]
        }));

        // Close drawer ONLY if requested
        if (shouldClose) {
            setSelectedCandidate(null);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

                {/* Header Area */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <UsergroupAddOutlined style={{ color: '#1890ff' }} />
                            Gestión de Candidatos
                        </Title>
                        <Text type="secondary">Visualiza y gestiona el progreso de los candidatos en el pipeline</Text>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Button
                                type={category === 'not_eligible' ? 'primary' : 'default'}
                                onClick={() => handleToggleCategory('not_eligible')}
                                style={{
                                    backgroundColor: category === 'not_eligible' ? '#faad14' : 'rgba(250, 173, 20, 0.05)',
                                    borderColor: '#faad14',
                                    color: category === 'not_eligible' ? '#fff' : '#faad14',
                                    height: '42px',
                                    borderRadius: '10px',
                                    fontWeight: category === 'not_eligible' ? 600 : 500
                                }}
                            >
                                No Elegibles
                            </Button>
                            <Button
                                type={category === 'rejected' ? 'primary' : 'default'}
                                onClick={() => handleToggleCategory('rejected')}
                                style={{
                                    backgroundColor: category === 'rejected' ? '#ff4d4f' : 'rgba(255, 77, 79, 0.05)',
                                    borderColor: '#ff4d4f',
                                    color: category === 'rejected' ? '#fff' : '#ff4d4f',
                                    height: '42px',
                                    borderRadius: '10px',
                                    fontWeight: category === 'rejected' ? 600 : 500
                                }}
                            >
                                Rechazados
                            </Button>

                            <Divider type="vertical" style={{ height: '32px' }} />

                            <div style={{
                                background: category === 'eligible' ? 'rgba(24, 144, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)',
                                padding: '3px',
                                borderRadius: '10px',
                                border: category === 'eligible' ? '1px solid #1890ff40' : '1px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                height: '42px',
                                transition: 'all 0.3s ease'
                            }}>
                                <Segmented
                                    value={category === 'eligible' ? viewMode : undefined}
                                    onChange={(val) => {
                                        if (category !== 'eligible') {
                                            setCategory('eligible');
                                            dispatch(setFilters({}));
                                        }
                                        setViewMode(val as 'board' | 'list');
                                    }}
                                    options={[
                                        { label: 'Tablero', value: 'board', icon: <AppstoreOutlined /> },
                                        { label: 'Lista', value: 'list', icon: <BarsOutlined /> }
                                    ]}
                                    style={{
                                        background: 'transparent'
                                    }}
                                />
                            </div>
                        </Space>
                    </Col>
                </Row>

                <FilterBar category={category} />

                {/* Filters Active Alert */}
                {(filters.name || filters.profession || filters.location || filters.hasVehicle !== undefined || filters.search) && (
                    <div style={{ marginTop: 8, marginBottom: 8 }}>
                        <Alert
                            message={`Filtros activos: Mostrando ${meta?.total || candidates.length} resultados`}
                            type="info"
                            showIcon
                            style={{ padding: '4px 12px' }}
                        />
                    </div>
                )}

                <Row gutter={[20, 0]} style={{ flex: 1, minHeight: 0, marginTop: 16, width: '100%', margin: 0 }}>
                    <Col span={24} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, padding: 0 }}>
                        {/* Category Summary Indicator */}
                        <div style={{ marginBottom: '12px' }}>
                            <Space align="center" style={{
                                background: category === 'eligible' ? 'rgba(24, 144, 255, 0.05)' : category === 'rejected' ? 'rgba(255, 77, 79, 0.05)' : 'rgba(250, 173, 20, 0.05)',
                                padding: '4px 16px',
                                borderRadius: '20px',
                                border: `1px solid ${category === 'eligible' ? '#1890ff30' : category === 'rejected' ? '#ff4d4f30' : '#faad1430'}`
                            }}>
                                <Text strong style={{
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    color: category === 'eligible' ? '#1890ff' : category === 'rejected' ? '#ff4d4f' : '#faad14',
                                    letterSpacing: '0.5px'
                                }}>
                                    {category === 'eligible' ? 'Candidatos activos' : category === 'rejected' ? 'Candidatos rechazados' : 'Candidatos no elegibles'}
                                </Text>
                                <span style={{
                                    background: category === 'eligible' ? '#1890ff' : category === 'rejected' ? '#ff4d4f' : '#faad14',
                                    color: '#fff',
                                    padding: '0 8px',
                                    borderRadius: '10px',
                                    fontSize: '12px',
                                    fontWeight: 700
                                }}>
                                    {category === 'eligible' ? (analytics?.totalActiveParticipants || 0) : category === 'rejected' ? (analytics?.totalRejected || 0) : (analytics?.totalNotEligible || 0)}
                                </span>
                            </Space>
                        </div>

                        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {category !== 'eligible' ? (
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    <RejectedCandidatesView
                                        candidates={candidates}
                                        category={category as 'not_eligible' | 'rejected'}
                                        onViewCandidate={setSelectedCandidate}
                                    />
                                </div>
                            ) : viewMode === 'board' ? (
                                <KanbanBoard
                                    onCardClick={setSelectedCandidate}
                                    totalCountsByStage={analytics?.countsByStage}
                                />
                            ) : (
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    <CandidateListView
                                        candidates={candidates}
                                        onViewCandidate={(c) => setSelectedCandidate(c)}
                                        selectedId={selectedCandidate?.id}
                                    />
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                <CandidateDrawer
                    open={!!selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    candidate={selectedCandidate}
                    onActionComplete={handleRefresh}
                />

                {/* If in board mode, we might still want a drawer for more detail space, 
                but to follow user request of "unificar" I'll keep the side panel 
                consistent above or use drawer only for board if it looks better. 
                User specifically mentioned the table row click -> side panel. */}

                {selectedCandidate && viewMode === 'board' && (
                    <div style={{ display: 'none' }}> {/* Place holder or keep drawer for board? */} </div>
                )}

                {/* Pagination Footer - Only for List and Rejected views */}
                {meta && viewMode !== 'board' && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                        <Pagination
                            current={meta.page}
                            total={meta.total}
                            pageSize={meta.limit}
                            onChange={handlePageChange}
                            showSizeChanger
                            pageSizeOptions={['10', '20', '50']}
                        />
                    </div>
                )}

                <style>{`
                .selected-row {
                    background-color: #e6f7ff !important;
                }
            `}</style>
            </motion.div>
        </div>
    );
};

export default DashboardPage;
