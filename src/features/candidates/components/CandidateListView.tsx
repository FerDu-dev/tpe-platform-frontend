import React from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, CarOutlined } from '@ant-design/icons';
import type { Candidate } from '../../../types';

const { Text } = Typography;

interface CandidateListViewProps {
    candidates: Candidate[];
    onViewCandidate: (candidate: Candidate) => void;
}

const CandidateListView: React.FC<CandidateListViewProps> = ({ candidates, onViewCandidate }) => {



    const columns: ColumnsType<Candidate> = [
        {
            title: 'Candidato',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (_, record) => <Text strong>{record.firstName} {record.lastName}</Text>,
        },
        {
            title: 'Cédula',
            dataIndex: 'nationalId',
            key: 'nationalId',
            width: 120,
            render: (text) => <Text>{text}</Text>,
        },
        {
            title: 'Teléfono',
            dataIndex: 'phone',
            key: 'phone',
            width: 130,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 220,
            render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>,
        },
        {
            title: 'Profesión',
            dataIndex: 'profession',
            key: 'profession',
            width: 180,
        },
        {
            title: 'Etapa',
            dataIndex: 'stage',
            key: 'stage',
            width: 150,
            render: (tag: string, record: Candidate) => {
                const config: Record<string, { label: string; color: string }> = {
                    applied: { label: 'Elegible', color: '#1890ff' },
                    psychotechnical: { label: 'P. Psicotécnica', color: '#faad14' },
                    interview: { label: 'Entrevista', color: '#2b457c' },
                    decision: { label: 'Decisión / Oferta', color: '#52c41a' },
                };

                if (record.applications?.[0]?.status === 'REJECTED') {
                    return (
                        <Tag color="error" style={{ borderRadius: '4px', fontWeight: 500 }}>
                            {record.subStatus === 'No Elegible' ? 'No Elegible' : 'Rechazado'}
                        </Tag>
                    );
                }

                const item = config[tag] || { label: tag, color: 'default' };
                return (
                    <Tag color={item.color} style={{ borderRadius: '4px', fontWeight: 500 }}>
                        {item.label}
                    </Tag>
                );
            }
        },
        {
            title: 'Detalles (Días en Etapa)',
            key: 'details',
            width: 160,
            render: (_, record) => (
                <Space>
                    <Tag>{record.daysInStage || 0}d</Tag>
                    {record.hasVehicle && (
                        <Tooltip title="Vehículo Propio">
                            <Tag color="cyan"><CarOutlined /></Tag>
                        </Tooltip>
                    )}
                </Space>
            )
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="primary"
                    ghost
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onViewCandidate(record)}
                >
                    Ver
                </Button>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={candidates}
            rowKey="id"
            pagination={false}
            size="middle"
            style={{ marginTop: 16, background: '#fff', borderRadius: 8 }}
            onRow={(record) => ({
                onClick: () => onViewCandidate(record),
                style: { cursor: 'pointer' }
            })}
            rowClassName="clickable-row"
        />
    );
};

export default CandidateListView;
