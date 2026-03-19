import React from 'react';
import { Drawer, Typography, Descriptions, Badge, Button, Space, Divider, List, Avatar, Tag } from 'antd';
import { Requisition } from '../../../types';
import {
    ClockCircleOutlined,
    UsergroupAddOutlined,
    EnvironmentOutlined,
    StopOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../../app/store';
import { selectCandidate } from '../../candidates/store/candidatesSlice';
import RequisitionApplicantsModal from './RequisitionApplicantsModal';

const { Title, Text } = Typography;

interface RequisitionDrawerProps {
    open: boolean;
    onClose: () => void;
    requisition: Requisition | null;
}

const RequisitionDrawer: React.FC<RequisitionDrawerProps> = ({ open, onClose, requisition }) => {
    const dispatch = useAppDispatch();
    const [showApplicants, setShowApplicants] = React.useState(false);

    if (!requisition) return null;

    const daysOpen = Math.floor((new Date().getTime() - new Date(requisition.createdDate).getTime()) / (1000 * 3600 * 24));

    const handleViewApplicants = () => {
        setShowApplicants(true);
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
                {requisition.route && (
                    <Descriptions.Item label="Ruta" span={2}>{requisition.route}</Descriptions.Item>
                )}
            </Descriptions>

            <Descriptions title="Métricas" bordered column={2}>
                <Descriptions.Item label="Postulantes Totales">
                    <UsergroupAddOutlined style={{ marginRight: 8 }} />
                    {requisition.applicants}
                </Descriptions.Item>
                <Descriptions.Item label="Entrevistados">
                    {Math.floor(requisition.applicants * 0.4)}
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
                                                Etapa Actual: <Tag color="blue">{candidate.applications?.[0]?.subStatus || 'N/A'}</Tag>
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

            <div style={{ marginTop: 48, background: '#fff1f0', padding: 24, borderRadius: 8, border: '1px solid #ffa39e' }}>
                <Title level={5} type="danger">Zona de Peligro</Title>
                <Text>Cerrar esta requisición detendrá la recepción de nuevos postulantes.</Text>
                <div style={{ marginTop: 16 }}>
                    <Button danger icon={<StopOutlined />}>Cerrar Requisición</Button>
                </div>
            </div>
            <RequisitionApplicantsModal
                open={showApplicants}
                onClose={() => setShowApplicants(false)}
                requisition={requisition}
            />
        </Drawer>
    );
};

export default RequisitionDrawer;
