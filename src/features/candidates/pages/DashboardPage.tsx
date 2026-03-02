import React, { useEffect, useState } from 'react';
import { Button, Space, Typography, Segmented, Alert, Pagination, Divider } from 'antd';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
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
import type { Candidate } from '../../../types';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const candidates = useAppSelector(selectFilteredCandidates); // Now backend filtered
    const filters = useAppSelector(selectFilters);
    const meta = useAppSelector(state => state.candidates.meta);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [category, setCategory] = useState<'eligible' | 'not_eligible' | 'rejected'>('eligible');

    // Load candidates on mount or when filters change
    // Load candidates on mount or when filters change
    useEffect(() => {
        dispatch(loadCandidates({ page: 1, limit: meta?.limit || 10 }));
    }, [dispatch, filters]);
    // Actually, setFilters updates state, but doesn't trigger load. 
    // We should probably trigger load when filters change. 
    // Or simpler: just load on mount, and let FilterBar trigger load.
    // For now, let's assume FilterBar just sets filters. We need to react to filter change.

    const handlePageChange = (page: number, pageSize?: number) => {
        dispatch(loadCandidates({ page, limit: pageSize || meta?.limit || 10 }));
    };

    // Auto-switch to List view when filtering by status
    useEffect(() => {
        if (filters.status && viewMode === 'board') {
            setViewMode('list');
        }
    }, [filters.status, viewMode]);

    // Categories are now handled as individual toggles
    const handleToggleCategory = (targetCategory: 'not_eligible' | 'rejected') => {
        if (category === targetCategory) {
            // Already active, toggle OFF back to eligible
            setCategory('eligible');
            dispatch(setFilters({ ...filters, isNotEligible: false, isManualRejected: false, isRejected: false }));
        } else {
            // Toggle ON
            setCategory(targetCategory);
            if (targetCategory === 'not_eligible') {
                dispatch(setFilters({ ...filters, isNotEligible: true, isManualRejected: false, isRejected: false }));
            } else {
                dispatch(setFilters({ ...filters, isNotEligible: false, isManualRejected: true, isRejected: false }));
            }
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Header Area */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>Gestión de Candidatos</Title>
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
            </div>

            <FilterBar />

            {/* Filters Active Alert */}
            {(filters.name || filters.profession || filters.location || filters.hasVehicle !== undefined || filters.status) && (
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                    <Alert
                        message={`Filtros activos: Mostrando ${meta?.total || candidates.length} resultados`}
                        type="info"
                        showIcon
                        style={{ padding: '4px 12px' }}
                    />
                </div>
            )}

            <div style={{ flex: 1, minHeight: 0, marginTop: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {category !== 'eligible' ? (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <RejectedCandidatesView
                            candidates={candidates}
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
                            onViewCandidate={setSelectedCandidate}
                        />
                    </div>
                )}
            </div>

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

            {selectedCandidate && (
                <CandidateDrawer
                    open={!!selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    candidate={selectedCandidate}
                />
            )}
        </div>
    );
};

export default DashboardPage;
