import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Select, Table, Tag, Button, Space, Typography, Spin, Pagination } from 'antd';
import { EyeOutlined, CarOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Candidate, Requisition } from '../../../types';
import { candidateService, STAGE_COLORS } from '../../../services/candidateService';
import { useAppSelector } from '../../../app/store';
import { selectStages } from '../../../store/workflowSlice';
import CandidateDrawer from '../../candidates/components/CandidateDrawer';

const { Text } = Typography;
const { Option } = Select;

interface RequisitionApplicantsModalProps {
    open: boolean;
    onClose: () => void;
    requisition: Requisition;
}

const RequisitionApplicantsModal: React.FC<RequisitionApplicantsModalProps> = ({ open, onClose, requisition }) => {
    const stages = useAppSelector(selectStages);

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [stageId, setStageId] = useState<number | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    const fetchCandidates = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await candidateService.fetchCandidates({
                jobRequisitionId: Number(requisition.id),
                search: search || undefined,
                stageId: stageId || undefined,
                page: p,
                limit: 10,
            });
            setCandidates(res.data);
            setMeta(res.meta);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [requisition.id, search, stageId]);

    useEffect(() => {
        if (open) {
            setPage(1);
            fetchCandidates(1);
        }
    }, [open, search, stageId]);

    const handlePageChange = (p: number) => {
        setPage(p);
        fetchCandidates(p);
    };

    const columns: ColumnsType<Candidate> = [
        {
            title: 'Candidato',
            key: 'name',
            render: (_, r) => (
                <div>
                    <Text strong>{r.firstName} {r.lastName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{r.nationalId}</Text>
                </div>
            ),
        },
        {
            title: 'Teléfono',
            dataIndex: 'phone',
            width: 130,
        },
        {
            title: 'Profesión',
            dataIndex: 'profession',
            width: 160,
        },
        {
            title: 'Etapa',
            key: 'stage',
            width: 160,
            render: (_, r) => {
                const color = r.currentStageId ? STAGE_COLORS[r.currentStageId] : '#1890ff';
                return <Tag color={color} style={{ borderRadius: 4 }}>{r.currentStageName || 'Postulado'}</Tag>;
            },
        },
        {
            title: 'Días en etapa',
            key: 'days',
            width: 110,
            render: (_, r) => (
                <Space>
                    <Tag>{r.daysInStage || 0}d</Tag>
                    {r.hasVehicle && <Tag color="cyan"><CarOutlined /></Tag>}
                </Space>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            render: (_, r) => (
                <Button
                    type="primary"
                    ghost
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={(e) => { e.stopPropagation(); setSelectedCandidate(r); }}
                >
                    Ver
                </Button>
            ),
        },
    ];

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                title={
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 16 }}>Postulantes</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {requisition.title} · {requisition.company}
                        </Text>
                    </Space>
                }
                width="85%"
                style={{ top: 40 }}
                footer={null}
                destroyOnClose
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%', flexWrap: 'wrap' }} size={8}>
                    <Input
                        placeholder="Buscar por nombre o cédula..."
                        prefix={<SearchOutlined />}
                        allowClear
                        style={{ width: 260 }}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                    <Select
                        placeholder="Filtrar por etapa"
                        allowClear
                        style={{ width: 200 }}
                        value={stageId}
                        onChange={v => { setStageId(v); setPage(1); }}
                    >
                        {stages.map(s => (
                            <Option key={s.id} value={s.id}>{s.name}</Option>
                        ))}
                    </Select>
                    {meta && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                            {meta.total} postulante{meta.total !== 1 ? 's' : ''}
                        </Text>
                    )}
                </Space>

                {/* Table */}
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={candidates}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        style={{ background: '#fff', borderRadius: 8 }}
                        onRow={r => ({
                            onClick: () => setSelectedCandidate(r),
                            style: { cursor: 'pointer' },
                        })}
                        locale={{ emptyText: 'No hay candidatos asignados a esta requisición' }}
                    />
                </Spin>

                {/* Pagination */}
                {meta && meta.total > 10 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                        <Pagination
                            current={page}
                            total={meta.total}
                            pageSize={10}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </Modal>

            {/* Candidate Drawer — hireMode activo */}
            {selectedCandidate && (
                <CandidateDrawer
                    open={!!selectedCandidate}
                    onClose={() => {
                        setSelectedCandidate(null);
                        fetchCandidates(page); // refresh list after changes
                    }}
                    candidate={selectedCandidate}
                    hireMode
                    requisition={requisition}
                />
            )}
        </>
    );
};

export default RequisitionApplicantsModal;
