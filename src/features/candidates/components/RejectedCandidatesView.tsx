import React from 'react';
import { Table, Tag, Button, Typography, Space, Alert, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, ReloadOutlined, StopOutlined, CarOutlined, ToolOutlined } from '@ant-design/icons';
import type { Candidate } from '../../../types';
import { useAppDispatch } from '../../../app/store';
import { updateCandidateStage } from '../store/candidatesSlice';

const { Text } = Typography;

interface RejectedCandidatesViewProps {
    candidates: Candidate[];
    onViewCandidate: (candidate: Candidate) => void;
}

const RejectedCandidatesView: React.FC<RejectedCandidatesViewProps> = ({ candidates, onViewCandidate }) => {
    const dispatch = useAppDispatch();

    const handleRescue = (candidateId: string) => {
        // Moves candidate to 'applied' and potentially clears rejection reason (logic depends on backend, here we just move stage)
        // For mock, simply updating stage to 'applied' allows them to show up in board if logic permits, 
        // but we might need to handle the 'rejectionReason' display logic so they don't appear rejected anymore.
        // Ideally we would update the candidate object to remove rejectionReason. 
        // Since our slice might not support partial updates easily without api, we assume 'updateCandidateStage' is enough 
        // and we'll handle the UI to ignore rejectionReason if manually moved.

        dispatch(updateCandidateStage({ id: candidateId, newStage: 'applied' }));
        message.success('Candidato rescatado y movido a Elegible');
    };

    const columns: ColumnsType<Candidate> = [
        {
            title: 'Candidato',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.firstName} {record.lastName}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>{record.nationalId}</Text>
                </Space>
            )
        },
        {
            title: 'Motivo de Rechazo',
            dataIndex: 'rejectionReason',
            key: 'rejectionReason',
            width: 300,
            render: (reason) => (
                <Tag color="error" icon={<StopOutlined />}>
                    {reason || 'Filtro Automático'}
                </Tag>
            )
        },
        {
            title: 'Faltante',
            key: 'missing',
            render: (_, record) => {
                if (record.rejectionReason?.includes('vehículo')) return <Tag color="orange"><CarOutlined /> Vehículo</Tag>;
                if (record.rejectionReason?.includes('Perfil')) return <Tag color="warning"><ToolOutlined /> Skills</Tag>;
                return null;
            }
        },
        {
            title: 'Acciones',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => onViewCandidate(record)}
                    >
                        Ver
                    </Button>
                    <Button
                        type="primary"
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={() => handleRescue(record.id)}
                    >
                        Rescatar
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ marginTop: 16 }}>
            <Alert
                message="Zona de Rescate"
                description="Estos candidatos fueron filtrados automáticamente por el sistema. Revísalos y rescata a aquellos que consideres aptos."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
            />
            <Table
                columns={columns}
                dataSource={candidates}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
                style={{ background: '#fff', borderRadius: 8 }}
            />
        </div>
    );
};

export default RejectedCandidatesView;
