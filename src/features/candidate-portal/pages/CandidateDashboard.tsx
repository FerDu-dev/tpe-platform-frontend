import React from 'react';
import { Card, Typography, Steps, Result, Button, Alert, Space, Divider, List } from 'antd';
import {
    CheckCircleOutlined,
    VideoCameraOutlined,
    FormOutlined,
    FileSearchOutlined,
    LinkOutlined
} from '@ant-design/icons';
import { useAppSelector } from '../../../app/store';
import { selectCurrentUser } from '../../auth/store/authSlice';

const { Title, Text, Paragraph } = Typography;

const CandidateDashboard: React.FC = () => {
    const currentUser = useAppSelector(selectCurrentUser);
    const process = currentUser?.currentProcess;

    if (!process) {
        return (
            <Result
                status="info"
                title="No tienes procesos activos"
                subTitle="Actualmente no registras ninguna postulación activa en nuestro sistema."
                extra={[
                    <Button type="primary" key="home" onClick={() => window.location.href = '/'}>
                        Ir al Inicio
                    </Button>
                ]}
            />
        );
    }

    const { stage, testUrl } = process;
    const stageId = stage?.id || 1;

    // Helper to render stage-specific content
    const renderStageContent = () => {
        switch (stageId) {
            case 1: // Aplicado
                return (
                    <Alert
                        message="Tu postulación ha sido recibida"
                        description="Nuestro equipo de reclutamiento está revisando tu perfil. Te notificaremos pronto por este medio y por correo."
                        type="success"
                        showIcon
                    />
                );
            case 2: // Elegible (Video Request)
                return (
                    <Card
                        title={<Space><VideoCameraOutlined /> Presentación de Video</Space>}
                        style={{ borderLeft: '4px solid #1890ff' }}
                    >
                        <Paragraph>
                            ¡Felicidades! Has pasado el primer filtro. Para conocerte mejor, por favor carga tu video de presentación.
                        </Paragraph>
                        <Button type="primary" icon={<VideoCameraOutlined />}>
                            Cargar mi Video
                        </Button>
                    </Card>
                );
            case 3: // Prueba Psicotécnica
                return (
                    <Card
                        title={<Space><FormOutlined /> Prueba Psicotécnica</Space>}
                        style={{ borderLeft: '4px solid #faad14' }}
                    >
                        <Paragraph>
                            Has sido seleccionado para realizar una prueba psicotécnica.
                        </Paragraph>
                        {testUrl ? (
                            <div style={{ padding: '16px', background: '#fffbe6', borderRadius: '8px', border: '1px solid #ffe58f' }}>
                                <Paragraph strong>Sigue este enlace para realizar la prueba:</Paragraph>
                                <Button
                                    type="primary"
                                    icon={<LinkOutlined />}
                                    href={testUrl}
                                    target="_blank"
                                    block
                                >
                                    Realizar Prueba Ahora
                                </Button>
                            </div>
                        ) : (
                            <Alert
                                type="warning"
                                message="Enlace pendiente"
                                description="El reclutador te asignará un enlace para la prueba muy pronto."
                            />
                        )}
                        {stage?.config?.instructions && (
                            <div style={{ marginTop: '16px' }}>
                                <Text strong>Instrucciones:</Text>
                                <Paragraph>{stage.config.instructions}</Paragraph>
                            </div>
                        )}
                    </Card>
                );
            case 4: // Entrevista
                return (
                    <Card title={<Space><TeamOutlined /> Entrevista</Space>}>
                        <Paragraph>
                            Estamos agendando una entrevista contigo. Pronto verás aquí los detalles de fecha y hora.
                        </Paragraph>
                    </Card>
                );
            default:
                return (
                    <Alert
                        message="Proceso en curso"
                        description={`Estás en la etapa: ${stage?.name || 'En revisión'}. Te mantendremos informado.`}
                        type="info"
                        showIcon
                    />
                );
        }
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <Title level={2}>¡Hola, {currentUser?.firstName}!</Title>
                <Text type="secondary">Sigue el estado de tu postulación para <strong>{process.jobTitle}</strong></Text>
            </div>

            <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Steps
                    current={stageId - 1}
                    size="small"
                    responsive={true}
                    items={[
                        { title: 'Aplicado', icon: stageId > 1 ? <CheckCircleOutlined /> : null },
                        { title: 'Video', icon: stageId > 2 ? <CheckCircleOutlined /> : null },
                        { title: 'Pruebas', icon: stageId > 3 ? <CheckCircleOutlined /> : null },
                        { title: 'Entrevista', icon: stageId > 4 ? <CheckCircleOutlined /> : null },
                        { title: 'Decisión' },
                    ]}
                />
            </Card>

            <Divider orientation="left">Actividades Pendientes</Divider>

            {renderStageContent()}

            <Card title="Historial de Actividad" size="small" style={{ marginTop: '16px' }}>
                <List
                    size="small"
                    dataSource={[
                        { date: 'Hoy', text: `Entraste a la etapa: ${stage?.name}` },
                        { date: 'Ayer', text: 'Perfil revisado por reclutamiento' },
                    ]}
                    renderItem={(item) => (
                        <List.Item>
                            <Text type="secondary" style={{ width: '60px' }}>{item.date}</Text>
                            <Text>{item.text}</Text>
                        </List.Item>
                    )}
                />
            </Card>
        </Space>
    );
};

// Placeholder for missing icons
const TeamOutlined = (props: any) => <FileSearchOutlined {...props} />;

export default CandidateDashboard;
