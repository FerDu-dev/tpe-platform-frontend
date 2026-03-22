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
} from '../store/candidatesSlice';
import { loadStages } from '../../../store/workflowSlice';
import type { Candidate } from '../../../types';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const candidates = useAppSelector(selectFilteredCandidates); // Now backend filtered
    const filters = useAppSelector(selectFilters);
    const meta = useAppSelector(state => state.candidates.meta);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
    const [category, setCategory] = useState<'eligible' | 'not_eligible' | 'rejected'>('eligible');

    // Load workflow stages on mount
    useEffect(() => {
        dispatch(loadStages(1));
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

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                            backgroundColor: category === 'not_eligible' ? '#faad14' : 'rgba(250, 173, 20, 0.1)',
                            borderColor: '#faad14',
                            color: category === 'not_eligible' ? '#fff' : '#faad14',
                        }}
                    >
                        No Elegibles
                    </Button>
                    <Button
                        type={category === 'rejected' ? 'primary' : 'default'}
                        onClick={() => handleToggleCategory('rejected')}
                        style={{
                            backgroundColor: category === 'rejected' ? '#ff4d4f' : 'rgba(255, 77, 79, 0.1)',
                            borderColor: '#ff4d4f',
                            color: category === 'rejected' ? '#fff' : '#ff4d4f',
                        }}
                    >
                        Rechazados
                    </Button>

                    <Divider type="vertical" style={{ height: '32px' }} />

                    {category === 'eligible' && (
                        <Segmented
                            value={viewMode}
                            onChange={(val) => setViewMode(val as 'board' | 'list')}
                            options={[
                                { label: 'Tablero', value: 'board', icon: <AppstoreOutlined /> },
                                { label: 'Lista', value: 'list', icon: <BarsOutlined /> },
                            ]}
                        />
                    )}
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

            <Row gutter={[20, 20]} style={{ flex: 1, minHeight: 0, marginTop: 16 }}>
                <Col span={24} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
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
                                candidates={candidates}
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
            />

            {/* If in board mode, we might still want a drawer for more detail space, 
                but to follow user request of "unificar" I'll keep the side panel 
                consistent above or use drawer only for board if it looks better. 
                User specifically mentioned the table row click -> side panel. */}
            
            {selectedCandidate && viewMode === 'board' && (
                <div style={{ display: 'none' }}> {/* Place holder or keep drawer for board? */} </div>
            )}

            {/* Pagination Footer */}
            {meta && (
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
