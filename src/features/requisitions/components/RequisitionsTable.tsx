import React from 'react';
import { Table, Tag, Typography, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector } from '../../../app/store';
import { selectRequisitions, selectRequisitionsLoading } from '../store/requisitionsSlice';
import { selectCompanies, selectPositions, selectZones } from '../../../store/masterDataSlice';
import type { Requisition, Priority, RequisitionStatus } from '../../../types';

const { Text } = Typography;

interface RequisitionsTableProps {
    onRowClick?: (record: Requisition) => void;
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
    const positions = useAppSelector(selectPositions);
    const zones = useAppSelector(selectZones);

    const columns: ColumnsType<Requisition> = [
        {
            title: 'Empresa',
            dataIndex: 'company',
            key: 'company',
            width: 120,
            filters: companies.map(c => ({ text: c, value: c })),
            onFilter: (value, record) => record.company === value,
            render: (company: string) => (
                <Tag color="purple" style={{ fontWeight: 'bold' }}>
                    {company}
                </Tag>
            ),
        },
        {
            title: 'Cargo',
            dataIndex: 'title',
            key: 'title',
            filters: positions.map(p => ({ text: p, value: p })),
            onFilter: (value, record) => record.title === value,
            render: (title: string) => <Text strong>{title}</Text>,
        },
        {
            title: 'Departamento',
            dataIndex: 'department',
            key: 'department',
            width: 130,
        },
        {
            title: 'Ubicación',
            dataIndex: 'location',
            key: 'location',
            width: 140,
        },
        {
            title: 'Zona',
            dataIndex: 'zone',
            key: 'zone',
            width: 100,
            filters: zones.map(z => ({ text: z, value: z })),
            onFilter: (value, record) => {
                const zoneName = typeof record.zone === 'object' ? record.zone?.name : record.zone;
                return zoneName === value;
            },
            render: (zone: any) => {
                const name = typeof zone === 'object' ? zone?.name : zone;
                return <Tag color="orange">{name || 'N/A'}</Tag>;
            },
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
            sorter: (a, b) => a.applicants - b.applicants,
            render: (applicants: number) => (
                <Tag color={applicants > 0 ? 'green' : 'default'}>{applicants}</Tag>
            ),
        },
        {
            title: 'Días Abierta',
            key: 'daysOpen',
            width: 110,
            render: (_: any, record: Requisition) => {
                const days = Math.floor((new Date().getTime() - new Date(record.createdDate).getTime()) / (1000 * 3600 * 24));
                return <Text>{days} días</Text>;
            },
            sorter: (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
        },
        {
            title: 'Fecha',
            dataIndex: 'createdDate',
            key: 'createdDate',
            width: 110,
            sorter: (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
            render: (date: string) => new Date(date).toLocaleDateString('es-VE'),
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
                        description="No hay requisiciones"
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
