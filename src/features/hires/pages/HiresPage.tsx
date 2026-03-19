import React, { useState, useEffect } from 'react';
import { Table, Input, Typography, Space, Button, Tag, Card } from 'antd';
import { SearchOutlined, EyeOutlined, TrophyOutlined, CalendarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { hiresService, HireRecord } from '../../../services/hiresService';
import CandidateDrawer from '../../candidates/components/CandidateDrawer';

const { Title, Text } = Typography;

const HiresPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [hires, setHires] = useState<HireRecord[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);
    const [selectedHire, setSelectedHire] = useState<HireRecord | null>(null);

    const loadHires = async (p = 1, s = search) => {
        setLoading(true);
        try {
            const res = await hiresService.fetchHires({
                page: p,
                search: s || undefined,
                limit: 10
            });
            setHires(res.data);
            setMeta(res.meta);
        } catch (error) {
            console.error('Error loading hires', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHires(1);
    }, []);

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
        loadHires(1, val);
    };

    const columns: ColumnsType<HireRecord> = [
        {
            title: 'Candidato',
            key: 'candidate',
            render: (_, r) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{r.candidate.firstName} {r.candidate.lastName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{r.candidate.nationalId}</Text>
                </Space>
            )
        },
        {
            title: 'Requisición / Empresa',
            key: 'requisition',
            render: (_, r) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{r.jobRequisition?.title || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{r.jobRequisition?.company || 'N/A'}</Text>
                </Space>
            )
        },
        {
            title: 'Zona',
            key: 'zone',
            render: (_, r) => <Tag color="blue">{r.jobRequisition?.zone || 'N/A'}</Tag>
        },
        {
            title: 'Fecha Inicio',
            dataIndex: 'effectiveStartDate',
            render: (date) => (
                <Space>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    {date ? new Date(date).toLocaleDateString() : 'N/A'}
                </Space>
            )
        },
        {
            title: 'Estado',
            key: 'status',
            render: () => <Tag color="green" icon={<TrophyOutlined />}>CONTRATADO</Tag>
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 100,
            render: (_, r) => (
                <Button 
                    icon={<EyeOutlined />} 
                    type="primary" 
                    ghost 
                    onClick={() => setSelectedHire(r)}
                >
                    Detalles
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Historial de Contrataciones</Title>
                    <Text type="secondary">Registro de todos los candidatos vinculados exitosamente a una vacante</Text>
                </div>
                <TrophyOutlined style={{ fontSize: 32, color: '#faad14' }} />
            </div>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Buscar por nombre o cédula..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        allowClear
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={hires}
                    rowKey="id"
                    loading={loading}
                    pagination={meta ? {
                        current: page,
                        total: meta.total,
                        pageSize: 10,
                        onChange: (p) => {
                            setPage(p);
                            loadHires(p);
                        }
                    } : false}
                />
            </Card>

            {selectedHire && (
                <CandidateDrawer
                    open={!!selectedHire}
                    onClose={() => setSelectedHire(null)}
                    candidate={selectedHire.candidate}
                    requisition={selectedHire.jobRequisition}
                />
            )}
        </div>
    );
};

export default HiresPage;
