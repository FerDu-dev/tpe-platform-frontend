import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag, Avatar, Space, Typography, Spin, Empty } from 'antd';
import { UserOutlined, UndoOutlined } from '@ant-design/icons';
import { candidateService, STAGE_COLORS } from '../../../services/candidateService';
import { Candidate } from '../../../types';
import { Button, message, Popconfirm } from 'antd';

const { Text, Title } = Typography;

interface CandidateListModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    filters: {
        companyId?: number;
        jobRequisitionId?: number;
        stageId?: number;
    };
    onViewCandidate?: (candidate: Candidate) => void;
    refreshKey?: number;
    mode?: 'active' | 'rejected';
    onRefresh?: () => void;
}

const CandidateListModal: React.FC<CandidateListModalProps> = ({ 
    visible, 
    onClose, 
    title, 
    filters, 
    onViewCandidate, 
    refreshKey,
    mode = 'active',
    onRefresh
}) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    useEffect(() => {
        if (visible) {
            setLoading(true);
            const fetchMethod = mode === 'active' 
                ? candidateService.fetch_candidates_active({ ...filters, limit: 100 })
                : candidateService.fetch_candidates_rejected({ ...filters, limit: 100 });

            fetchMethod
                .then(res => {
                    setCandidates(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [visible, filters, refreshKey, mode, localRefresh]);

    const handleRescue = async (candidate: Candidate) => {
        if (!candidate.applicationId) {
            message.error('No se puede rescatar: ID de aplicación no encontrado');
            return;
        }

        try {
            await candidateService.rescueCandidate(candidate.applicationId);
            message.success('Candidato rescatado exitosamente');
            setLocalRefresh(prev => prev + 1);
            onRefresh?.();
        } catch (error: any) {
            message.error('Error al rescatar candidato: ' + (error.response?.data?.message || error.message));
        }
    };

    const columns = [
        {
            title: 'Candidato',
            key: 'name',
            render: (_: any, record: Candidate) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <Text strong>{record.firstName} {record.lastName}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>{record.nationalId}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Requisición / Zona',
            key: 'requisition',
            render: (_: any, record: Candidate) => (
                <div>
                    <Text>{record.requisitionZoneName || 'N/A'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {typeof record.zone === 'object' ? record.zone?.name : record.zone}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Etapa Actual',
            key: 'stage',
            render: (_: any, record: Candidate) => (
                <Tag color={STAGE_COLORS[record.currentStageId || 1] || 'blue'}>
                    {record.currentStageName}
                </Tag>
            ),
        },
        ...(mode === 'active' ? [
            {
                title: 'Sub-estado',
                dataIndex: 'subStatus',
                key: 'subStatus',
                render: (text: string) => <Text style={{ fontSize: '13px' }}>{text}</Text>
            }
        ] : [
            {
                title: 'Motivo de Rechazo',
                dataIndex: 'rejectionReason',
                key: 'rejectionReason',
                render: (text: string) => <Text type="danger" style={{ fontSize: '13px' }}>{text || 'Sin motivo especificado'}</Text>
            },
            {
                title: 'Acciones',
                key: 'actions',
                render: (_: any, record: Candidate) => (
                    <Popconfirm
                        title="¿Rescatar candidato?"
                        description="Esto lo devolverá al flujo activo de selección."
                        onConfirm={() => handleRescue(record)}
                        okText="Sí, rescatar"
                        cancelText="No"
                    >
                        <Button 
                            type="primary" 
                            size="small" 
                            icon={<UndoOutlined />}
                            style={{ background: '#52c41a', border: 'none' }}
                        >
                            Rescatar
                        </Button>
                    </Popconfirm>
                )
            }
        ])
    ];

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>{title}</Title>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={mode === 'rejected' ? 1100 : 900}
            styles={{ body: { padding: '0 24px 24px 24px' } }}
        >
            <div style={{ marginTop: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" tip="Cargando candidatos..." />
                    </div>
                ) : candidates.length === 0 ? (
                    <Empty description={mode === 'active' ? "No se encontraron candidatos activos." : "No hay candidatos rechazados."} />
                ) : (
                    <Table 
                        dataSource={candidates} 
                        columns={columns} 
                        rowKey="id" 
                        pagination={{ pageSize: 10 }}
                        size="middle"
                        onRow={(record) => ({
                            onClick: (e: any) => {
                                // Don't trigger view if clicking the rescue button
                                if (e.target.closest('button')) return;
                                onViewCandidate?.(record);
                            },
                            style: { cursor: 'pointer' }
                        })}
                    />
                )}
            </div>
        </Modal>
    );
};

export default CandidateListModal;
