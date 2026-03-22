import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag, Avatar, Space, Typography, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { candidateService, STAGE_COLORS } from '../../../services/candidateService';
import { Candidate } from '../../../types';

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
}

const CandidateListModal: React.FC<CandidateListModalProps> = ({ visible, onClose, title, filters, onViewCandidate, refreshKey }) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setLoading(true);
            candidateService.fetch_candidates_active({ ...filters, limit: 100 })
                .then(res => {
                    setCandidates(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [visible, filters, refreshKey]);

    const columns = [
        {
            title: 'Candidato',
            key: 'name',
            render: (_: any, record: Candidate) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={record.videoUrl ? undefined : undefined} />
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
        {
            title: 'Sub-estado',
            dataIndex: 'subStatus',
            key: 'subStatus',
            render: (text: string) => <Text style={{ fontSize: '13px' }}>{text}</Text>
        }
    ];

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>{title}</Title>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            bodyStyle={{ padding: '0 24px 24px 24px' }}
        >
            <div style={{ marginTop: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" tip="Cargando candidatos..." />
                    </div>
                ) : candidates.length === 0 ? (
                    <Empty description="No se encontraron candidatos activos para esta selección." />
                ) : (
                    <Table 
                        dataSource={candidates} 
                        columns={columns} 
                        rowKey="id" 
                        pagination={{ pageSize: 10 }}
                        size="middle"
                        onRow={(record) => ({
                            onClick: () => onViewCandidate?.(record),
                            style: { cursor: 'pointer' }
                        })}
                    />
                )}
            </div>
        </Modal>
    );
};

export default CandidateListModal;
