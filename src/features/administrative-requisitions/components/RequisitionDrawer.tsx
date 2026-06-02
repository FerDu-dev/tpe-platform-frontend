import React from 'react';
import { Drawer, Typography, Descriptions, Badge, Button, Space, Divider, Tag, Card } from 'antd';
import { AdministrativeRequisition } from '../../../types';
import {
    ClockCircleOutlined,
    UsergroupAddOutlined,
    EnvironmentOutlined,
    PauseCircleOutlined,
    CloseCircleOutlined,
    PlayCircleOutlined,
    InfoCircleOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { Popconfirm, message } from 'antd';
import { useAppDispatch } from '../../../app/store';
import RequisitionApplicantsModal from './RequisitionApplicantsModal';
import PermissionGuard from '../../../components/PermissionGuard';
import { getStatusLabel, getStatusColor } from './RequisitionsTable';
import { deleteRequisition } from '../store/adminRequisitionsSlice';

const { Title, Text } = Typography;

interface RequisitionDrawerProps {
    open: boolean;
    onClose: () => void;
    requisition: AdministrativeRequisition | null;
    onPause: (requisition: AdministrativeRequisition) => void;
    onCancel: (requisition: AdministrativeRequisition) => void;
    onReactivate: (requisition: AdministrativeRequisition) => void;
    onEditClick: (requisition: AdministrativeRequisition) => void;
}

const RequisitionDrawer: React.FC<RequisitionDrawerProps> = ({
    open,
    onClose,
    requisition,
    onPause,
    onCancel,
    onReactivate,
    onEditClick
}) => {
    const dispatch = useAppDispatch();
    const [showApplicants, setShowApplicants] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    if (!requisition) return null;

    const reqDate = requisition.requestDate || requisition.createdAt || requisition.createdDate;
    const daysOpen = reqDate ? Math.floor((new Date().getTime() - new Date(reqDate).getTime()) / (1000 * 3600 * 24)) : 0;

    const handleViewApplicants = () => {
        setShowApplicants(true);
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await dispatch(deleteRequisition(requisition.id)).unwrap();
            message.success('Requisición administrativa eliminada correctamente');
            onClose();
        } catch (error: any) {
            message.error(`Error al eliminar: ${error}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Drawer
            title="Detalles de la Requisición Administrativa"
            width={800}
            onClose={onClose}
            open={open}
            styles={{ body: { paddingBottom: 80 } }}
            extra={
                <Space>
                    <PermissionGuard module="adminRequisitions" action="edit">
                        <Space>
                            <Popconfirm
                                title="¿Eliminar requisición?"
                                description="Esta acción no se puede deshacer y desvinculará a los candidatos activos."
                                onConfirm={handleDelete}
                                okText="Sí, eliminar"
                                cancelText="No"
                                okButtonProps={{ danger: true, loading: deleting }}
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={deleting}
                                >
                                    Eliminar
                                </Button>
                            </Popconfirm>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => {
                                    if (onEditClick && typeof onEditClick === 'function') {
                                        onEditClick(requisition);
                                    }
                                }}
                            >
                                Editar
                            </Button>

                        </Space>
                    </PermissionGuard>
                    {requisition.status === 'OPEN' && (
                        <Button onClick={handleViewApplicants} type="primary" icon={<UsergroupAddOutlined />}>
                            Ver Postulantes
                        </Button>
                    )}
                </Space>
            }
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    {requisition.status === 'OPEN' && (
                        <PermissionGuard module="adminRequisitions" action="edit">
                            <Button
                                icon={<PauseCircleOutlined />}
                                onClick={() => onPause(requisition)}
                            >
                                Pausar
                            </Button>
                            <Button
                                icon={<CloseCircleOutlined />}
                                onClick={() => onCancel(requisition)}
                                danger
                            >
                                Cancelar
                            </Button>
                        </PermissionGuard>
                    )}
                    {requisition.status === 'PAUSED' && (
                        <PermissionGuard module="adminRequisitions" action="edit">
                            <Button
                                icon={<PlayCircleOutlined />}
                                onClick={() => onReactivate(requisition)}
                                type="primary"
                            >
                                Reactivar
                            </Button>
                        </PermissionGuard>
                    )}
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
            }
        >
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>{requisition.position}</Title>
                <Text type="secondary">{requisition.idx}</Text>
                <div style={{ marginTop: 12 }}>
                    <Tag color={getStatusColor(requisition.status)}>
                        {getStatusLabel(requisition.status)}
                    </Tag>
                    <Tag color={requisition.type === 'Pasantía' ? 'cyan' : 'geekblue'}>
                        {requisition.type}
                    </Tag>
                    {requisition.isConfidential && (
                        <Tag color="error" style={{ marginLeft: 4 }}>CONFIDENCIAL</Tag>
                    )}
                    <Divider type="vertical" />
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    <Text>{daysOpen} días abierta</Text>
                </div>
                {requisition.statusReason && (
                    <div style={{ marginTop: 16 }}>
                        <Card size="small" style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f' }}>
                            <Space align="start">
                                <InfoCircleOutlined style={{ color: '#faad14', marginTop: 4 }} />
                                <div>
                                    <Text strong>Motivo del cambio de estado:</Text>
                                    <br />
                                    <Text>{requisition.statusReason}</Text>
                                    {requisition.statusUpdatedAt && (
                                        <div style={{ marginTop: 4 }}>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                Actualizado el: {new Date(requisition.statusUpdatedAt).toLocaleString()}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Space>
                        </Card>
                    </div>
                )}
            </div>

            <Descriptions title="Información General" bordered column={2} style={{ marginBottom: 24 }}>
                <Descriptions.Item label="Empresa">{requisition.company}</Descriptions.Item>
                <Descriptions.Item label="Prioridad">
                    <Badge
                        color={requisition.priority === 'A' ? '#f5222d' : requisition.priority === 'B' ? '#fa8c16' : '#52c41a'}
                        text={requisition.priority}
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Solicitado por">
                    {requisition.requestedBy || <span style={{ color: '#bfbfbf' }}>No especificado</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de Solicitud">
                    {reqDate ? new Date(reqDate).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Departamento">{requisition.department || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Nivel y Paso">{requisition.levelAndStep || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Horario">{requisition.schedule || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Vacantes">{requisition.vacanciesCount || 1}</Descriptions.Item>
                <Descriptions.Item label="Ubicación" span={2}>
                    <EnvironmentOutlined /> {requisition.state?.name || 'N/A'}, {requisition.country || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Comentarios" span={2}>
                    {requisition.comments || <Text type="secondary" italic>Sin observaciones adicionales</Text>}
                </Descriptions.Item>
            </Descriptions>

            <RequisitionApplicantsModal
                open={showApplicants}
                onClose={() => setShowApplicants(false)}
                requisition={requisition as any}
            />
        </Drawer>
    );
};

export default RequisitionDrawer;
