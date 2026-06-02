import React from 'react';
import { Table, Tag, Typography, Empty, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector } from '../../../app/store';
import { selectRequisitions, selectRequisitionsLoading } from '../store/adminRequisitionsSlice';
import { selectCompanies, selectStates } from '../../../store/masterDataSlice';
import type { AdministrativeRequisition, Priority, RequisitionStatus } from '../../../types';

const { Text } = Typography;

interface RequisitionsTableProps {
    onRowClick?: (record: AdministrativeRequisition) => void;
    selectedId?: string | number | null;
}

export const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
        case 'A':
            return '#f5222d';
        case 'B':
            return '#fa8c16';
        case 'C':
            return '#52c41a';
        default:
            return '#d9d9d9';
    }
};

export const getStatusColor = (status: RequisitionStatus): string => {
    switch (status) {
        case 'OPEN':
            return 'blue';
        case 'SUSPENDED':
            return 'orange';
        case 'CLOSED':
            return 'green';
        case 'PAUSED':
            return 'warning';
        case 'CANCELLED':
            return 'error';
        default:
            return 'default';
    }
};

export const getStatusLabel = (status: RequisitionStatus): string => {
    switch (status) {
        case 'OPEN':
            return 'ACTIVA';
        case 'SUSPENDED':
            return 'SUSPENDIDA';
        case 'CLOSED':
            return 'CERRADA';
        case 'PAUSED':
            return 'PAUSADA';
        case 'CANCELLED':
            return 'CANCELADA';
        default:
            return (status as string).toUpperCase();
    }
};

const RequisitionsTable: React.FC<RequisitionsTableProps> = ({ onRowClick, selectedId }) => {
    const requisitions = useAppSelector(selectRequisitions);
    const loading = useAppSelector(selectRequisitionsLoading);
    const companies = useAppSelector(selectCompanies);
    const statesList = useAppSelector(selectStates);

    const columns: ColumnsType<AdministrativeRequisition> = [
        {
            title: 'Empresa',
            dataIndex: 'company',
            key: 'company',
            width: 120,
            filters: companies.map(c => ({ text: c.name, value: c.id })),
            onFilter: (value, record) => record.company === value,
            render: (company: string) => (
                <Tag color="purple" style={{ fontWeight: 'bold' }}>
                    {company}
                </Tag>
            ),
        },
        {
            title: 'Cargo',
            dataIndex: 'position',
            key: 'position',
            width: 180,
            render: (position: string, record: AdministrativeRequisition) => (
                <Space direction="vertical" size={2}>
                    <Text strong>
                        {position || 'N/A'}
                    </Text>
                    {record.isConfidential && <Tag color="error" style={{ fontSize: '10px', height: '18px', lineHeight: '16px' }}>CONFIDENCIAL</Tag>}
                </Space>
            ),
        },
        {
            title: 'Departamento',
            dataIndex: 'department',
            key: 'department',
            width: 140,
            render: (department: string) => <Text>{department || 'N/A'}</Text>,
        },
        {
            title: 'Tipo',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            filters: [
                { text: 'Profesional', value: 'Profesional' },
                { text: 'Pasantía', value: 'Pasantía' }
            ],
            onFilter: (value, record) => record.type === value,
            render: (type: string) => (
                <Tag color={type === 'Pasantía' ? 'cyan' : 'geekblue'}>{type || 'N/A'}</Tag>
            ),
        },
        {
            title: 'Solicitado por',
            dataIndex: 'requestedBy',
            key: 'requestedBy',
            width: 130,
        },
        {
            title: 'Estado (Ubi)',
            key: 'state',
            width: 120,
            filters: statesList.map(s => ({ text: s, value: s })),
            onFilter: (value, record) => {
                const stateName = record.state?.name;
                return stateName === value;
            },
            render: (_: any, record: AdministrativeRequisition) => (
                <Text>{record.state?.name || 'N/A'}</Text>
            ),
        },
        {
            title: 'Prioridad',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            filters: [
                { text: 'Alta (A)', value: 'A' },
                { text: 'Media (B)', value: 'B' },
                { text: 'Baja (C)', value: 'C' },
            ],
            onFilter: (value, record) => record.priority === value,
            sorter: (a, b) => a.priority.localeCompare(b.priority),
            render: (priority: Priority) => (
                <Tag
                    color={getPriorityColor(priority)}
                    style={{
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 12px',
                    }}
                >
                    {priority}
                </Tag>
            ),
        },
        {
            title: 'Estatus',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            filters: [
                { text: 'Activa', value: 'OPEN' },
                { text: 'Suspendida', value: 'SUSPENDED' },
                { text: 'Cerrada', value: 'CLOSED' },
                { text: 'Pausada', value: 'PAUSED' },
                { text: 'Cancelada', value: 'CANCELLED' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status: RequisitionStatus) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusLabel(status)}
                </Tag>
            ),
        },
        {
            title: 'Candidatos',
            dataIndex: 'applicants',
            key: 'applicants',
            width: 100,
            align: 'center',
            sorter: (a, b) => (a.applicants || 0) - (b.applicants || 0),
            render: (applicants: number) => (
                <Tag color={(applicants || 0) > 0 ? 'green' : 'default'}>{applicants || 0}</Tag>
            ),
        },
        {
            title: 'Fecha',
            key: 'createdDate',
            width: 110,
            sorter: (a, b) => new Date(a.requestDate || a.createdAt || '').getTime() - new Date(b.requestDate || b.createdAt || '').getTime(),
            render: (_: any, record: AdministrativeRequisition) => {
                const date = record.requestDate || record.createdAt;
                if (!date) return <Text>-</Text>;
                return new Date(date).toLocaleDateString('es-VE');
            },
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={requisitions}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="middle"
            locale={{
                emptyText: (
                    <Empty
                        description="No hay requisiciones administrativas"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ),
            }}
            rowClassName={(record) => {
                let classes = record.priority === 'A' ? 'priority-a-row' : '';
                if (String(record.id) === String(selectedId)) classes += ' selected-row';
                return classes;
            }}
            onRow={(record) => ({
                onClick: () => {
                    if (onRowClick) onRowClick(record);
                },
                style: { cursor: 'pointer' }
            })}
            style={{
                background: 'white',
            }}
            scroll={{ x: 1200 }}
        />
    );
};

export default RequisitionsTable;
