import React from 'react';
import { Typography, Empty, Skeleton, Space, Spin } from 'antd';
import CandidateCard from './CandidateCard';
import { selectStages } from '../../../store/workflowSlice';
import { loadKanbanStage } from '../store/candidatesSlice';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import type { Candidate } from '../../../types';
import { STAGE_COLORS } from '../../../services/candidateService';

const { Title, Text } = Typography;
import { Tag, Tooltip } from 'antd';

interface KanbanBoardProps {
    onCardClick?: (candidate: Candidate) => void;
    totalCountsByStage?: Record<number, number>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onCardClick, totalCountsByStage }) => {
    const dispatch = useAppDispatch();
    const stages = useAppSelector(selectStages);
    const kanbanData = useAppSelector(state => state.candidates.kanban);
    const filters = useAppSelector(state => state.candidates.filters);

    // Initial load for all stages when entering board or filters change
    React.useEffect(() => {
        stages.forEach(stage => {
            dispatch(loadKanbanStage({ stageId: stage.id, page: 1, limit: 20 }));
        });
    }, [dispatch, stages, filters]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>, stageId: number) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isNearBottom = scrollHeight - scrollTop <= clientHeight + 100;

        const stageInfo = kanbanData[stageId];
        if (isNearBottom && stageInfo && stageInfo.meta) {
            const { page, lastPage } = stageInfo.meta;
            if (page < lastPage) {
                dispatch(loadKanbanStage({
                    stageId,
                    page: page + 1,
                    limit: 20
                }));
            }
        }
    };


    return (
        <div
            style={{
                display: 'flex',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '4px 4px 12px 4px',
                gap: '16px',
                height: '100%',
                cursor: 'grab'
            }}
        >
            {stages.map((stage) => {
                const stageInfo = kanbanData[stage.id] || { data: [], meta: null };
                const stageCandidates = stageInfo.data;
                const color = STAGE_COLORS[stage.id] || '#d9d9d9';

                return (
                    <div
                        key={stage.id}
                        style={{
                            width: '320px',
                            minWidth: '320px',
                            flex: '0 0 320px',
                            background: '#f5f5f5',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            minHeight: 0
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                paddingBottom: '12px',
                                borderBottom: `3px solid ${color}`,
                            }}
                        >
                            <Space size={8}>
                                <Title level={5} style={{ margin: 0 }}>
                                    {stage.name}
                                </Title>
                                <Tooltip title={totalCountsByStage?.[stage.id] != null
                                    ? `Total de ${totalCountsByStage[stage.id]} candidatos en esta etapa`
                                    : `${stageCandidates.length} cargados`
                                }>
                                    <Tag
                                        color={color}
                                        style={{ borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'default' }}
                                    >
                                        {totalCountsByStage?.[stage.id] != null
                                            ? totalCountsByStage[stage.id]
                                            : stageCandidates.length
                                        }
                                    </Tag>
                                </Tooltip>
                            </Space>
                            <div
                                style={{
                                    background: color,
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                }}
                            />
                        </div>

                        <div
                            onScroll={(e) => handleScroll(e, stage.id)}
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                paddingRight: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                minHeight: 0,
                                width: '100%'
                            }}
                        >
                            {stageInfo.loading && stageCandidates.length === 0 ? (
                                <div>
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} active avatar paragraph={{ rows: 2 }} style={{ marginBottom: '16px' }} />
                                    ))}
                                </div>
                            ) : stageCandidates.length === 0 && !stageInfo.loading ? (
                                <Empty
                                    description={
                                        <Text type="secondary">
                                            Sin candidatos
                                        </Text>
                                    }
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            ) : (
                                <>
                                    {stageCandidates.map(candidate => (
                                        <div key={candidate.id} style={{ width: '100%', flexShrink: 0 }}>
                                            <CandidateCard
                                                candidate={candidate}
                                                onClick={() => onCardClick?.(candidate)}
                                            />
                                        </div>
                                    ))}
                                    {stageInfo.loading && stageCandidates.length > 0 && (
                                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                            <Spin size="small" />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanBoard;