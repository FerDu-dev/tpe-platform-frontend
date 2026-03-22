import React, { useEffect, useState } from 'react';
import { Card, Typography, Result, Button, Alert, Space, Tag, Upload, message } from 'antd';
import {
    CheckCircleOutlined,
    VideoCameraOutlined,
    FormOutlined,
    LinkOutlined,
    LockOutlined,
    TeamOutlined,
    MedicineBoxOutlined,
    AuditOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../../app/store';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { candidateService } from '../../../services/candidateService';
import { Candidate } from '../../../types';

const { Title, Text, Paragraph } = Typography;

const CandidateDashboard: React.FC = () => {
    const currentUser = useAppSelector(selectCurrentUser);
    const [profile, setProfile] = useState<Candidate | null>(null);
    const [uploadingDoc, setUploadingDoc] = useState<'CV' | 'Video' | null>(null);
    const [process, setProcess] = useState<any>(currentUser?.currentProcess);

    const fetchData = async () => {
        try {
            const profileData = await candidateService.fetchCandidateProfile();
            setProfile(profileData);

            const processData = await candidateService.fetchCandidateCurrentProcess();
            setProcess(processData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const handleUpload = async (type: 'CV' | 'Video', file: File) => {
        if (!profile) return;
        setUploadingDoc(type);
        try {
            await candidateService.uploadCandidateDocument(profile.id, type, file);
            message.success(`${type} cargado exitosamente`);
            await fetchData(); // recargar el perfil
        } catch (error: any) {
            message.error(error.response?.data?.message || `Error al subir el ${type}. Intenta de nuevo.`);
        } finally {
            setUploadingDoc(null);
        }
    };

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

    const { currentStageId, testUrl, testCode } = process;
    const stageId = currentStageId || 1;

    // Blind Recruitment: Hide job details until stage 8
    const isHired = stageId === 8;
    const displayJobTitle = isHired ? (process.jobTitle || process.jobRequisition?.title) : "Proceso de Selección TuPróximoEmpleo";

    const stages = [
        { title: 'Bienvenida', icon: <CheckCircleOutlined /> },
        { title: 'Video', icon: <VideoCameraOutlined /> },
        { title: 'P. Psicotécnica', icon: <FormOutlined /> },
        { title: 'Entrevista', icon: <TeamOutlined /> },
        { title: 'Entrevista Técnica', icon: <FormOutlined /> },
        { title: 'Verificaciones', icon: <MedicineBoxOutlined /> },
        { title: 'Oferta', icon: <AuditOutlined /> },
        { title: 'Contratación', icon: <TrophyOutlined /> },
    ];

    // Helper to render stage-specific content
    const renderStageContent = () => {
        switch (stageId) {
            case 1: // Bienvenida
                return (
                    <Alert
                        message="¡Bienvenido a TuPróximoEmpleo!"
                        description="Tu perfil ha sido recibido con éxito. En breve un reclutador revisará tu información y te notificaremos si avanzas a la siguiente etapa."
                        type="info"
                        showIcon
                    />
                );
            case 2: // Video
                return (
                    <Card
                        title={<Space><VideoCameraOutlined /> Presentación de Video</Space>}
                        style={{ borderLeft: '4px solid #1890ff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    >
                        <Paragraph>
                            ¡Felicidades! Has pasado el primer filtro. Para conocerte mejor, por favor carga tu video de presentación siguiendo las pautas enviadas a tu correo.
                        </Paragraph>
                        {profile?.videoUrl ? (
                            <Alert
                                type="success"
                                message="Video enviado"
                                description="Tu video ha sido cargado. Nuestro equipo lo revisará pronto."
                                showIcon
                                icon={<CheckCircleOutlined />}
                            />
                        ) : (
                            <Upload
                                accept="video/*"
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    handleUpload('Video', file);
                                    return false;
                                }}
                            >
                                <Button type="primary" size="large" icon={<VideoCameraOutlined />} loading={uploadingDoc === 'Video'}>
                                    Cargar mi Video de Presentación
                                </Button>
                            </Upload>
                        )}
                    </Card>
                );
            case 3: // Prueba Psicotécnica
                return (
                    <Card
                        title={<Space><FormOutlined /> Prueba Psicotécnica</Space>}
                        style={{ borderLeft: '4px solid #faad14', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    >
                        <Paragraph>
                            Has avanzado a la etapa de pruebas psicotécnicas. Es fundamental que cuentes con al menos 90 minutos de tranquilidad para completarlas.
                        </Paragraph>
                        {testUrl ? (
                            <div style={{ padding: '24px', background: '#fffbe6', borderRadius: '12px', border: '1px solid #ffe58f' }}>
                                <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
                                    <Text strong style={{ fontSize: '16px' }}>Enlace de la prueba:</Text>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<LinkOutlined />}
                                        href={testUrl}
                                        target="_blank"
                                        block
                                        style={{ height: '50px', fontSize: '18px' }}
                                    >
                                        Ir a la Prueba Psicotécnica
                                    </Button>

                                    {testCode && (
                                        <div style={{ marginTop: '16px', padding: '12px', border: '2px dashed #faad14', borderRadius: '8px' }}>
                                            <Text type="secondary" style={{ display: 'block' }}>Usa este código si se solicita:</Text>
                                            <Title level={3} style={{ margin: 0, color: '#d48806' }}>{testCode}</Title>
                                        </div>
                                    )}

                                    <Alert
                                        type="info"
                                        message="Aviso"
                                        description="Una vez finalizada la prueba, el reclutador será notificado automáticamente (o validará tus resultados externamente). No necesitas realizar ninguna otra acción aquí."
                                        style={{ textAlign: 'left', marginTop: '16px' }}
                                    />
                                </Space>
                            </div>
                        ) : (
                            <Alert
                                type="warning"
                                message="Esperando Enlace"
                                description="Un reclutador te proporcionará el enlace y código de acceso muy pronto."
                                showIcon
                            />
                        )}
                    </Card>
                );
            case 4: // Entrevista
            case 5:
                return (
                    <Card title={<Space><TeamOutlined /> Fase de Entrevistas</Space>} style={{ borderRadius: '12px' }}>
                        <Paragraph>
                            ¡Excelente! Estás en la fase de entrevistas. Nuestro equipo de RRHH / Líderes de área se pondrá en contacto contigo vía WhatsApp o correo para agendar la cita.
                        </Paragraph>
                        <Alert
                            type="info"
                            message="Mantente atento"
                            description="Asegúrate de revisar tus mensajes de WhatsApp y correo electrónico."
                            showIcon
                        />
                    </Card>
                );
            case 8: // Contratación
                return (
                    <Result
                        status="success"
                        title="¡Felicidades! Has completado el proceso"
                        subTitle={`Bienvenido a bordo de ${process.jobTitle}. Estamos felices de tenerte con nosotros.`}
                    />
                );
            default:
                return (
                    <Alert
                        message="Proceso en curso"
                        description={`Estás en la etapa: 'En revisión'}. Te mantendremos informado por este medio.`}
                        type="info"
                        showIcon
                    />
                );
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <Title level={2} style={{ marginBottom: '4px' }}>¡Hola, {currentUser?.firstName}!</Title>
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: '18px', color: '#595959' }}>{displayJobTitle}</Text>
                        {!isHired && (
                            <Tag icon={<LockOutlined />} color="default" style={{ marginTop: '8px' }}>
                                Detalles Confidenciales hasta el cierre
                            </Tag>
                        )}
                    </Space>
                </div>

                <Card style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                    <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>Tu Progreso</Title>
                    {/* Custom Progress Tracker */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '8px 0' }}>
                        {stages
                            .filter((_, idx) => idx <= stageId - 1)
                            .map((s, idx) => {
                                const isCurrent = idx === stageId - 1;
                                const isPast = idx < stageId - 1;
                                const isLast = idx === stageId - 1;

                                const circleColor = isPast ? '#52c41a' : '#fa8c16';
                                const textColor = isPast ? '#52c41a' : '#fa8c16';
                                const boxShadow = isCurrent ? '0 0 0 4px rgba(250,140,22,0.2)' : 'none';

                                return (
                                    <React.Fragment key={idx}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 50 }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: '50%',
                                                backgroundColor: circleColor,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, boxShadow,
                                            }}>
                                                {isCurrent
                                                    ? <ClockCircleOutlined style={{ color: '#fff', fontSize: 17 }} />
                                                    : React.cloneElement(s.icon as React.ReactElement, { style: { color: '#fff', fontSize: 17 } })
                                                }
                                            </div>
                                            <span style={{ fontSize: 10, color: textColor, fontWeight: isCurrent ? 700 : 500, whiteSpace: 'nowrap', textAlign: 'center' }}>
                                                {s.title}
                                            </span>
                                        </div>
                                        {!isLast && (
                                            <div style={{
                                                flex: 1, height: 2, marginTop: 16, minWidth: 6,
                                                backgroundColor: '#52c41a',
                                            }} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                    </div>
                </Card>

                <div style={{ marginTop: '16px' }}>
                    {renderStageContent()}
                </div>

                {isHired && (
                    <Card title="Detalles de tu Vacante" size="small">
                        <Paragraph>
                            Has sido seleccionado para la posición de <strong>{process.jobTitle}</strong>.
                            Próximamente recibirás detalles sobre tu Onboarding.
                        </Paragraph>
                    </Card>
                )}
            </Space>
        </div>
    );
};

export default CandidateDashboard;
