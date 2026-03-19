import React from 'react';
import { Table, Tag, Typography, Space, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, StopOutlined, CarOutlined, ToolOutlined } from '@ant-design/icons';
import type { Candidate } from '../../../types';

const { Text } = Typography;

interface RejectedCandidatesViewProps {
    candidates: Candidate[];
    category: 'not_eligible' | 'rejected';
    onViewCandidate: (candidate: Candidate) => void;
}

const RejectedCandidatesView: React.FC<RejectedCandidatesViewProps> = ({ candidates, category, onViewCandidate }) => {
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
            title: category === 'rejected' ? 'Motivo de Rechazo' : 'Razón de Inelegibilidad',
            dataIndex: 'rejectionReason',
            key: 'rejectionReason',
            width: 300,
            render: (_, record) => (
                <Tag color={category === 'rejected' ? 'error' : 'warning'} icon={<StopOutlined />}>
                    {record.applications?.[0]?.rejectionReason || 'Filtro Automático'}
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
            title: '',
            key: 'view',
            align: 'right',
            render: () => <EyeOutlined style={{ color: '#bfbfbf' }} />
        }
    ];

    return (
        <div style={{ marginTop: 16 }}>
            <Alert
                message={category === 'rejected' ? 'Candidatos Rechazados' : 'Candidatos No Elegibles'}
                description={
                    category === 'rejected'
                        ? 'Estos candidatos fueron rechazados manualmente por un reclutador. Puedes revisar el motivo y rescatarlos si es necesario.'
                        : 'Estos candidatos fueron filtrados automáticamente por el sistema. Revísalos y rescata a aquellos que consideres aptos.'
                }
                type={category === 'rejected' ? 'error' : 'warning'}
                showIcon
                style={{ marginBottom: 16 }}
            />
            <Table
                columns={columns}
                dataSource={candidates}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ background: '#fff', borderRadius: 8 }}
                onRow={(record) => ({
                    onClick: () => onViewCandidate(record),
                    style: { cursor: 'pointer' }
                })}
            />
        </div>
    );
};

export default RejectedCandidatesView;
