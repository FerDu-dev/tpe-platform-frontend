import React from 'react';
import { Drawer, Typography, Descriptions, Badge, Button, Space, Divider } from 'antd';
import { Requisition } from '../../../types';
import {
    ClockCircleOutlined,
    UsergroupAddOutlined,
    EnvironmentOutlined,
    StopOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../../app/store';
import { setFilters } from '../../candidates/store/candidatesSlice';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface RequisitionDrawerProps {
    open: boolean;
    onClose: () => void;
    requisition: Requisition | null;
}

const RequisitionDrawer: React.FC<RequisitionDrawerProps> = ({ open, onClose, requisition }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    if (!requisition) return null;

    const daysOpen = Math.floor((new Date().getTime() - new Date(requisition.createdDate).getTime()) / (1000 * 3600 * 24));

    const handleViewApplicants = () => {
        // Navigate to candidates dashboard filtering by this requisition IDX
        dispatch(setFilters({ idx: requisition.idx }));
        navigate('/dashboard');
        onClose();
    };

    return (
        <Drawer
            title="Detalles de la Requisición"
            width={640}
            onClose={onClose}
            open={open}
            styles={{ body: { paddingBottom: 80 } }}
            extra={
                <Space>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleViewApplicants} type="primary">
                        Ver Postulantes
                    </Button>
                </Space>
            }
        >
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>{requisition.title}</Title>
                <Text type="secondary">{requisition.idx}</Text>
                <div style={{ marginTop: 12 }}>
                    <Badge
                        status={requisition.status === 'activa' ? 'processing' : 'default'}
                        text={<span style={{ textTransform: 'capitalize' }}>{requisition.status}</span>}
                    />
                    <Divider type="vertical" />
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    <Text>{daysOpen} días abierta</Text>
                </div>
            </div>

            <Descriptions title="Información General" bordered column={2} style={{ marginBottom: 32 }}>
                <Descriptions.Item label="Empresa">{requisition.company}</Descriptions.Item>
                <Descriptions.Item label="Departamento">{requisition.department}</Descriptions.Item>
                <Descriptions.Item label="Prioridad">
                    <Badge
                        color={requisition.priority === 'A' ? '#f5222d' : requisition.priority === 'B' ? '#fa8c16' : '#52c41a'}
                        text={requisition.priority}
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Ubicación">
                    <EnvironmentOutlined /> {requisition.location}
                </Descriptions.Item>
                {requisition.zone && (
                    <Descriptions.Item label="Zona">{requisition.zone}</Descriptions.Item>
                )}
                {requisition.route && (
                    <Descriptions.Item label="Ruta">{requisition.route}</Descriptions.Item>
                )}
            </Descriptions>

            <Descriptions title="Métricas" bordered column={2}>
                <Descriptions.Item label="Postulantes Totales">
                    <UsergroupAddOutlined style={{ marginRight: 8 }} />
                    {requisition.applicants}
                </Descriptions.Item>
                <Descriptions.Item label="Entrevistados">
                    {/* Mock data for interviewed */}
                    {Math.floor(requisition.applicants * 0.4)}
                </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 48, background: '#fff1f0', padding: 24, borderRadius: 8, border: '1px solid #ffa39e' }}>
                <Title level={5} type="danger">Zona de Peligro</Title>
                <Text>Cerrar esta requisición detendrá la recepción de nuevos postulantes.</Text>
                <div style={{ marginTop: 16 }}>
                    <Button danger icon={<StopOutlined />}>Cerrar Requisición</Button>
                </div>
            </div>
        </Drawer>
    );
};

export default RequisitionDrawer;
