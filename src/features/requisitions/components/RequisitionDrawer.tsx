import React from 'react';
import { Drawer, Typography, Descriptions, Badge, Button, Space, Divider, List, Avatar, Tag, Card } from 'antd';
import { Requisition } from '../../../types';
import {
    ClockCircleOutlined,
    UsergroupAddOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    PauseCircleOutlined,
    CloseCircleOutlined,
    PlayCircleOutlined,
    InfoCircleOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { Popconfirm, message } from 'antd';
import { useAppDispatch } from '../../../app/store';
import { selectCandidate } from '../../candidates/store/candidatesSlice';
import { getStatusTagStyle } from '../../../services/candidateService';
import RequisitionApplicantsModal from './RequisitionApplicantsModal';
import PermissionGuard from '../../../components/PermissionGuard';
import { getStatusLabel, getStatusColor } from './RequisitionsTable';
import { deleteRequisition } from '../store/requisitionsSlice';

const { Title, Text } = Typography;

interface RequisitionDrawerProps {
    open: boolean;
    onClose: () => void;
    requisition: Requisition | null;
    onPause: (requisition: Requisition) => void;
    onCancel: (requisition: Requisition) => void;
    onReactivate: (requisition: Requisition) => void;
    onEditClick: (requisition: Requisition) => void;
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

    const daysOpen = Math.floor((new Date().getTime() - new Date(requisition.createdDate).getTime()) / (1000 * 3600 * 24));

    const handleViewApplicants = () => {
        setShowApplicants(true);
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await dispatch(deleteRequisition(requisition.id)).unwrap();
            message.success('Requisición eliminada correctamente');
            onClose();
        } catch (error: any) {
            message.error(`Error al eliminar: ${error}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Drawer
            title="Detalles de la Requisición"
            width={800}
            onClose={onClose}
            open={open}
            styles={{ body: { paddingBottom: 80 } }}
            extra={
                <Space>
                    <PermissionGuard module="requisition" action="edit">
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
                                    console.log('Edit clicked for:', requisition);
                                    if (onEditClick && typeof onEditClick === 'function') {
                                        onEditClick(requisition);
                                    } else {
                                        console.error('onEditClick is not a function:', onEditClick);
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
                        <PermissionGuard module="requisition" action="edit">
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
                        <PermissionGuard module="requisition" action="edit">
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
                <Title level={3} style={{ margin: 0 }}>{requisition.title}</Title>
                <Text type="secondary">{requisition.idx}</Text>
                <div style={{ marginTop: 12 }}>
                    <Tag color={getStatusColor(requisition.status)}>
                        {getStatusLabel(requisition.status)}
                    </Tag>
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

            <Descriptions title="Información General" bordered column={2} style={{ marginBottom: 32 }}>
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
                <Descriptions.Item label="Ubicación" span={2}>
                    <EnvironmentOutlined /> {requisition.location}
                </Descriptions.Item>
                {requisition.zone && (
                    <Descriptions.Item label="Zona" span={2}>
                        <Space direction="vertical" size={0}>
                            <Text strong>{typeof requisition.zone === 'string' ? requisition.zone : requisition.zone.name}</Text>
                            {typeof requisition.zone !== 'string' && (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {requisition.zone.region} | Coor: {requisition.zone.coordinator}
                                </Text>
                            )}
                        </Space>
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Ruta" span={2}>
                    {requisition.zone && typeof requisition.zone !== 'string'
                        ? (requisition.zone.geographicRoute || <span style={{ color: '#bfbfbf' }}>No especificada</span>)
                        : (requisition.route || <span style={{ color: '#bfbfbf' }}>No especificada</span>)}
                </Descriptions.Item>
            </Descriptions>


            {requisition.matchingCandidates && requisition.matchingCandidates.length > 0 && (
                <div style={{ marginTop: 32 }}>
                    <Divider orientation="left">
                        <Space>
                            <TeamOutlined />
                            <span>Candidatos Sugeridos (Misma Zona)</span>
                            <Badge count={requisition.matchingCandidates.length} style={{ backgroundColor: '#52c41a' }} />
                        </Space>
                    </Divider>
                    <List
                        itemLayout="horizontal"
                        dataSource={requisition.matchingCandidates}
                        renderItem={(candidate) => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="view"
                                        type="link"
                                        onClick={() => {
                                            dispatch(selectCandidate(candidate));
                                            onClose();
                                        }}
                                    >
                                        Ver Perfil
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: '#2b457c' }}>{candidate.firstName?.[0]}</Avatar>}
                                    title={<Text strong>{candidate.firstName} {candidate.lastName}</Text>}
                                    description={
                                        <Space split={<Divider type="vertical" />}>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                Estado:
                                                <Tag style={{ ...getStatusTagStyle(candidate.applications?.[0]?.subStatus), fontSize: '11px', marginLeft: 8 }}>
                                                    {candidate.applications?.[0]?.subStatus || 'Pendiente'}
                                                </Tag>
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {candidate.phone}
                                            </Text>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            )}


            <RequisitionApplicantsModal
                open={showApplicants}
                onClose={() => setShowApplicants(false)}
                requisition={requisition}
            />
        </Drawer>
    );
};

export default RequisitionDrawer;
