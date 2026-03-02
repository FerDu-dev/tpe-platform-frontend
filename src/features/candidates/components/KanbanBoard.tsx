import React, { useMemo } from 'react';
import { Typography, Empty, Skeleton, Space } from 'antd';
import CandidateCard from './CandidateCard';
import type { Candidate, KanbanStage } from '../../../types';

const { Title, Text } = Typography;

interface KanbanBoardProps {
    candidates: Candidate[];
    loading?: boolean;
    onCardClick?: (candidate: Candidate) => void;
}

const stages: Array<{ key: KanbanStage; title: string; color: string }> = [
    { key: 'applied', title: 'Elegible', color: '#1890ff' },
    { key: 'psychotechnical', title: 'P. Psicotécnica', color: '#faad14' },
    { key: 'interview', title: 'Entrevista', color: '#2b457c' },
    { key: 'decision', title: 'Decisión / Oferta', color: '#52c41a' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ candidates, loading = false, onCardClick }) => {

    const candidatesByStage = useMemo(() => {
        const groups: Record<string, Candidate[]> = {
            applied: [],
            eligible: [],
            psychotechnical: [],
            interview: [],
            decision: [],
        };

        candidates.forEach(c => {
            // Only show active candidates in the Kanban board
            if (c.stage && groups[c.stage] && c.applications?.[0]?.status === 'ACTIVE') {
                groups[c.stage].push(c);
            }
        });
        return groups;
    }, [candidates]);

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
            {stages.map(stage => {
                const stageCandidates = candidatesByStage[stage.key] || [];

                return (
                    <div
                        key={stage.key}
                        style={{
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
                                borderBottom: `3px solid ${stage.color}`,
                            }}
                        >
                            <Space size={8}>
                                <Title level={5} style={{ margin: 0 }}>
                                    {stage.title}
                                </Title>
                                <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
                                    {stageCandidates.length}
                                </span >
                            </Space>
                            <div
                                style={{
                                    background: stage.color,
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                }}
                            />
                        </div>

                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            paddingRight: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            minHeight: 0,
                            width: '100%'
                        }}>
                            {loading ? (
                                <div>
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} active avatar paragraph={{ rows: 2 }} style={{ marginBottom: '16px' }} />
                                    ))}
                                </div>
                            ) : stageCandidates.length === 0 ? (
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
                                        <CandidateCard
                                            key={candidate.id}
                                            candidate={candidate}
                                            onClick={() => onCardClick?.(candidate)}
                                        />
                                    ))}
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