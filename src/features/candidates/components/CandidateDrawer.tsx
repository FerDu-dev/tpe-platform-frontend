import React, { useState, useEffect } from 'react';
import { Drawer, Typography, Descriptions, Tag, Button, Space, Divider, message, Timeline, Modal, Input, Badge, Row, Col, Card, Tooltip, DatePicker, Upload } from 'antd';
import {
    FilePdfOutlined,
    VideoCameraOutlined,
    ArrowRightOutlined,
    ArrowLeftOutlined,
    HistoryOutlined,
    FolderOpenOutlined,
    UserOutlined,
    InfoCircleOutlined,
    WhatsAppOutlined,
    SearchOutlined,
    TrophyOutlined,
    BulbOutlined, CarOutlined, BankOutlined,
    TeamOutlined,
    UploadOutlined,
    MailOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Candidate, Requisition } from '../../../types';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loadCandidateById, selectSelectedCandidate, removeCandidate } from '../store/candidatesSlice';
import { selectStages } from '../../../store/workflowSlice';
import { candidateService, STAGE_COLORS } from '../../../services/candidateService';

import HiringAnimation from './HiringAnimation';
import PermissionGuard from '../../../components/PermissionGuard';
import CandidateRequisitionMatchingModal from './CandidateRequisitionMatchingModal';

const { Title, Text, Paragraph } = Typography;
// ... (lines 31-525) ...: I will use multi_replace for this if its too big, but let's try to target the footer carefully.

interface CandidateDrawerProps {
    open: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    requisition?: Requisition | null;
}

const CandidateDrawer: React.FC<CandidateDrawerProps> = ({ open, onClose, candidate, requisition }) => {
    const dispatch = useAppDispatch();
    const stages = useAppSelector(selectStages);
    const richCandidate = useAppSelector(selectSelectedCandidate);

    // Select the best data available for the current candidate ID
    const activeCandidate = (richCandidate && richCandidate.id === candidate?.id) ? richCandidate : candidate;

    const [submitting, setSubmitting] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [hireModalOpen, setHireModalOpen] = useState(false);
    const [hireComment, setHireComment] = useState('');
    const [isAnimatingHire, setIsAnimatingHire] = useState(false);
    const [hireCompleted, setHireCompleted] = useState(false);
    const [effectiveStartDate, setEffectiveStartDate] = useState<any>(null);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendCVSuccess, setResendCVSuccess] = useState(false);
    const [matchingModalOpen, setMatchingModalOpen] = useState(false);

    useEffect(() => {
        if (open && candidate?.id) {
            dispatch(loadCandidateById(candidate.id));
        }
    }, [open, candidate?.id, dispatch]);

    useEffect(() => {
        if (infoModalOpen) {
            setResendSuccess(false);
            setResendCVSuccess(false);
        }
    }, [infoModalOpen]);


    const handleAssignRequisition = async (requisitionId: string | null) => {
        if (!activeCandidate) return;
        const id = requisitionId === null ? null : Number(requisitionId);
        await handleAction(() => candidateService.updateApplicationRequisition(activeCandidate.id, id));
    };

    if (!activeCandidate) return null;

    const currentApp = activeCandidate.applications?.[0];
    const currentStageId = currentApp?.currentStageId;
    const currentStepIndex = stages.findIndex(s => s.id === currentStageId);

    const targetRequisition = requisition || currentApp?.jobRequisition;
    const companyDisplay = typeof targetRequisition?.company === 'object' ? targetRequisition.company.name : (targetRequisition?.company || 'N/A');
    const zoneDisplay = typeof targetRequisition?.zone === 'object' ? targetRequisition.zone.name : (targetRequisition?.zone || 'N/A');
    const idxDisplay = targetRequisition?.idx || targetRequisition?.id || 'N/A';

    const handlePsychTestUpload = async (info: any) => {
        const { file } = info;
        if (!activeCandidate) return;

        setSubmitting(true);
        try {
            await candidateService.uploadCandidateDocument(activeCandidate.id, 'PsychTest', file);
            message.success('Prueba psicotécnica cargada exitosamente');
            await dispatch(loadCandidateById(activeCandidate.id));
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al cargar la prueba');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAction = async (actionFn: () => Promise<any>) => {
        setSubmitting(true);
        try {
            await actionFn();
            message.success('Acción realizada con éxito');
            if (activeCandidate) dispatch(loadCandidateById(activeCandidate.id));
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al procesar la acción');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdvance = () => {
        const nextStage = stages[currentStepIndex + 1];
        if (!nextStage) return;

        // Validation: Must have a requisition to advance
        if (!currentApp?.jobRequisitionId) {
            return message.error('La vacante que tenía este candidato ya no está disponible. Por favor, asigne una nueva vacante para continuar.');
        }

        // Validation: Assigned requisition must be OPEN to advance at any stage (except rejection/hire)
        if (currentApp?.jobRequisition?.status !== 'OPEN') {
            const statusLabel = currentApp?.jobRequisition?.status === 'PAUSED' ? 'Pausada' :
                currentApp?.jobRequisition?.status === 'CANCELLED' ? 'Cancelada' : 'Cerrada';
            return message.error(`No se puede avanzar: La vacante asignada está ${statusLabel}. Por favor, asigne una nueva vacante abierta.`);
        }

        if (nextStage.id === 3) {
            Modal.confirm({
                title: 'Programar Prueba Psicotécnica',
                content: (
                    <div style={{ marginTop: '16px' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Link de la prueba:</Text>
                            <Input id="test-link-input" placeholder="https://ejemplo.com/test" />
                            <Text strong style={{ marginTop: '8px' }}>Código de Acceso (Opcional):</Text>
                            <Input id="test-code-input" placeholder="ID12345" />
                            <Text strong style={{ marginTop: '8px' }}>¿Desea dejar algún comentario? (opcional):</Text>
                            <Input.TextArea id="transition-comment-input" placeholder="Escribe un comentario si lo deseas..." rows={2} />
                        </Space>
                    </div>
                ),
                okText: 'Enviar y Avanzar',
                cancelText: 'Cancelar',
                onOk: async () => {
                    const link = (document.getElementById('test-link-input') as HTMLInputElement).value;
                    const code = (document.getElementById('test-code-input') as HTMLInputElement).value;
                    const comment = (document.getElementById('transition-comment-input') as HTMLTextAreaElement).value;
                    if (!link) return message.error('El link es obligatorio');
                    await handleAction(() => candidateService.updateCandidateStage(activeCandidate.id, nextStage.id, {
                        testLink: link,
                        testCode: code,
                        comment: comment || undefined
                    }));
                }
            });
            return;
        }

        if (nextStage.id === 4) {
            Modal.confirm({
                title: 'Pasar a Etapa de Entrevista',
                content: (
                    <div style={{ marginTop: '16px' }}>
                        <Text strong>¿Desea dejar algún comentario? (opcional):</Text>
                        <Input.TextArea id="transition-comment-input" placeholder="Coordinando entrevista..." style={{ marginTop: '8px' }} />
                    </div>
                ),
                okText: 'Avanzar',
                cancelText: 'Cancelar',
                onOk: async () => {
                    const comment = (document.getElementById('transition-comment-input') as HTMLTextAreaElement).value;
                    await handleAction(() => candidateService.updateCandidateStage(activeCandidate.id, nextStage.id, { comment: comment || 'Iniciado flujo de entrevista' }));
                }
            });
            return;
        }

        // Generic transition with optional comment
        Modal.confirm({
            title: `Avanzar a ${nextStage.name}`,
            content: (
                <div style={{ marginTop: '16px' }}>
                    <Text strong>¿Desea dejar algún comentario? (opcional):</Text>
                    <Input.TextArea id="transition-comment-input" placeholder="Escribe un comentario si lo deseas..." style={{ marginTop: '8px' }} />
                </div>
            ),
            okText: 'Avanzar',
            cancelText: 'Cancelar',
            onOk: async () => {
                const comment = (document.getElementById('transition-comment-input') as HTMLTextAreaElement).value;
                await handleAction(() => candidateService.updateCandidateStage(activeCandidate.id, nextStage.id, { comment: comment || undefined }));
            }
        });
    };

    const handleBack = () => {
        const prevStage = stages[currentStepIndex - 1];
        if (!prevStage) return;

        Modal.confirm({
            title: '¿Regresar a la etapa anterior?',
            content: (
                <div style={{ marginTop: '16px' }}>
                    <Text>El candidato volverá a la etapa de "{prevStage.name}".</Text>
                    <div style={{ marginTop: '16px' }}>
                        <Text strong>¿Desea dejar algún comentario? (opcional):</Text>
                        <Input.TextArea id="transition-comment-input" placeholder="Escribe un motivo si lo deseas..." style={{ marginTop: '8px' }} />
                    </div>
                </div>
            ),
            okText: 'Regresar',
            cancelText: 'Cancelar',
            onOk: () => {
                const comment = (document.getElementById('transition-comment-input') as HTMLTextAreaElement).value;
                handleAction(() => candidateService.updateCandidateStage(activeCandidate.id, prevStage.id, { comment: comment || 'Regresado a etapa anterior manualmente' }));
            }
        });
    };

    const handleReject = () => {
        Modal.confirm({
            title: '¿Estás seguro de rechazar a este candidato?',
            content: (
                <div style={{ marginTop: '16px' }}>
                    <Text>Indica brevemente el motivo:</Text>
                    <Input.TextArea id="reject-reason-input" rows={3} style={{ marginTop: '8px' }} />
                </div>
            ),
            okText: 'Rechazar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                const reason = (document.getElementById('reject-reason-input') as HTMLTextAreaElement).value;
                if (!reason) return message.error('El motivo es obligatorio');
                await handleAction(async () => { await candidateService.rejectCandidate(activeCandidate.id, reason); });
            }
        });
    };

    const handleHire = () => {
        const targetRequisition = requisition || activeCandidate.applications?.[0]?.jobRequisition;
        if (!targetRequisition) {
            return message.error('No se puede contratar sin una requisición asignada.');
        }
        setEffectiveStartDate(null); // Reset date
        setHireModalOpen(true);
    };

    const confirmHire = async () => {
        const targetRequisition = requisition || activeCandidate.applications?.[0]?.jobRequisition;
        if (!targetRequisition || !activeCandidate || !effectiveStartDate) {
            return message.error('Por favor selecciona una fecha de inicio efectiva');
        }

        setIsAnimatingHire(true);
        try {
            // Backend hire call
            await candidateService.hireCandidate(
                activeCandidate.id,
                effectiveStartDate.toISOString(),
                hireComment || 'Contratación formalizada exitosamente.'
            );
            // We don't close here, we let the animation run and signal onComplete
            setHireCompleted(true);
        } catch (e) {
            setIsAnimatingHire(false);
            console.error(e);
            message.error('Error al procesar la contratación');
        }
    };

    const finalizeHire = () => {
        setHireModalOpen(false);
        setIsAnimatingHire(false);
        setHireCompleted(false);
        message.success('Candidato contratado exitosamente');

        // Update candidate data, remove from active list, and close drawer
        dispatch(loadCandidateById(activeCandidate.id));
        dispatch(removeCandidate(activeCandidate.id));
        onClose();
    };

    const renderInfoModal = () => (
        <Modal
            title={<Title level={3}><UserOutlined /> Información Completa</Title>}
            open={infoModalOpen}
            onCancel={() => setInfoModalOpen(false)}
            footer={[<Button key="close" type="primary" onClick={() => setInfoModalOpen(false)}>Cerrar</Button>]}
            width={900}
        >
            <div style={{ padding: '0px 10px', maxHeight: '70vh', overflowY: 'auto' }}>
                <Row gutter={[16, 16]}>
                    {/* Access Management - Move to TOP and Span 24 */}
                    <Col span={24}>
                        <Card
                            title={<Space><InfoCircleOutlined /> Gestión de Acceso al Sistema</Space>}
                            size="small"
                            variant="borderless"
                            style={{ background: '#e6f7ff', borderRadius: 12, border: '1px solid #91d5ff' }}
                        >
                            <div style={{ padding: '4px' }}>
                                <Paragraph style={{ fontSize: '13px', marginBottom: '8px' }}>
                                    En caso de que el candidato no haya recibido sus datos de acceso, puede reenviarlos con este botón.
                                    <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                                        (Se generará una nueva contraseña y un enlace de acceso directo que se enviarán por correo)
                                    </Text>
                                </Paragraph>
                                <Button
                                    type="primary"
                                    icon={<MailOutlined />}
                                    style={{ backgroundColor: (resendSuccess || submitting) ? '#bfbfbf' : '#2b457c', borderColor: (resendSuccess || submitting) ? '#d9d9d9' : '#2b457c' }}
                                    onClick={() => {
                                        Modal.confirm({
                                            title: '¿Reenviar credenciales de acceso?',
                                            content: 'Se reseteará la contraseña actual y se enviará un nuevo correo con los datos de acceso al candidato.',
                                            okText: 'Sí, Reenviar',
                                            cancelText: 'Cancelar',
                                            onOk: async () => {
                                                await handleAction(() => candidateService.resendAccessCredentials(activeCandidate.id));
                                                setResendSuccess(true);
                                            }
                                        });
                                    }}
                                    loading={submitting}
                                    disabled={resendSuccess}
                                >
                                    {resendSuccess ? 'Credenciales Reenviadas' : 'Reenviar Credenciales de Acceso'}
                                </Button>
                            </div>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card title={<Space><UserOutlined /> Datos Personales</Space>} size="small" variant="borderless" style={{ background: '#f5f5f5', borderRadius: 12, height: '100%' }}>
                            <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                                <Descriptions.Item label="Nombre">{activeCandidate.firstName} {activeCandidate.lastName}</Descriptions.Item>
                                <Descriptions.Item label="Cédula">{activeCandidate.nationalId}</Descriptions.Item>
                                <Descriptions.Item label="Nivel Académico">{activeCandidate.educationLevel || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Email">{activeCandidate.email}</Descriptions.Item>
                                <Descriptions.Item label="Teléfono">{activeCandidate.phone}</Descriptions.Item>
                                <Descriptions.Item label="Teléfono Alt.">{activeCandidate.altPhone || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Fecha Nacimiento">{activeCandidate.birthDate ? dayjs(activeCandidate.birthDate).format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Género">{activeCandidate.gender || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Estado Civil">{activeCandidate.maritalStatus || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Hijos">{activeCandidate.hasChildren ? `Sí (${activeCandidate.childrenCount || 0})` : 'No'}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Card title={<Space><InfoCircleOutlined /> Ubicación</Space>} size="small" variant="borderless" style={{ background: '#f5f5f5', borderRadius: 12 }}>
                                <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                                    <Descriptions.Item label="Estado">{activeCandidate.municipality?.state?.name || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Municipio">{activeCandidate.municipality?.name || 'N/A'}</Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card title={<Space><CarOutlined /> Vehículo</Space>} size="small" variant="borderless" style={{ background: '#f5f5f5', borderRadius: 12 }}>
                                <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                                    <Descriptions.Item label="¿Tiene vehículo?">{activeCandidate.hasVehicle ? 'Sí' : 'No'}</Descriptions.Item>
                                    {activeCandidate.hasVehicle && (
                                        <>
                                            <Descriptions.Item label="Tipo">{activeCandidate.vehicleType || 'N/A'}</Descriptions.Item>
                                            <Descriptions.Item label="Modelo">{activeCandidate.vehicleBrandModelYear || 'N/A'}</Descriptions.Item>
                                            <Descriptions.Item label="¿Es propio?">{activeCandidate.isVehicleOwner ? 'Sí' : 'No'}</Descriptions.Item>
                                            {!activeCandidate.isVehicleOwner && (
                                                <Descriptions.Item label="Relación dueño">{activeCandidate.vehicleOwnerRelationship || 'N/A'}</Descriptions.Item>
                                            )}
                                        </>
                                    )}
                                </Descriptions>
                            </Card>
                        </Space>
                    </Col>

                    <Col span={12}>
                        <Card title={<Space><BulbOutlined /> Experiencia en Ventas</Space>} size="small" variant="borderless" style={{ background: '#f5f5f5', borderRadius: 12, height: '100%' }}>
                            <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                                <Descriptions.Item label="Exp. Ventas">{activeCandidate.salesExperienceYears ? 'Sí' : 'No'}</Descriptions.Item>
                                {activeCandidate.salesExperienceYears && (
                                    <>
                                        <Descriptions.Item label="Años">{activeCandidate.salesExperienceYears} años</Descriptions.Item>
                                        <Descriptions.Item label="Tipos">{Array.isArray(activeCandidate.salesExperienceTypes) ? activeCandidate.salesExperienceTypes.join(', ') : (activeCandidate.salesExperienceTypes || 'N/A')}</Descriptions.Item>
                                        <Descriptions.Item label="Bienes">{Array.isArray(activeCandidate.commercializedGoodsTypes) ? activeCandidate.commercializedGoodsTypes.join(', ') : (activeCandidate.commercializedGoodsTypes || 'N/A')}</Descriptions.Item>
                                    </>
                                )}
                                <Descriptions.Item label="Profesión">{activeCandidate.profession || 'Sin especificar'}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card title={<Space><BankOutlined /> Situación Económica y Laboral</Space>} size="small" variant="borderless" style={{ background: '#f5f5f5', borderRadius: 12, height: '100%' }}>
                            <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                                <Descriptions.Item label="Empresa Actual">{activeCandidate.currentCompany || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Empresas Previas">{activeCandidate.previousCompanies || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Ingreso Actual">{activeCandidate.currentMonthlyIncome ? `${activeCandidate.currentMonthlyIncome} USD` : 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Aspiración">{activeCandidate.salaryAspiration ? `${activeCandidate.salaryAspiration} USD` : 'N/A'}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card title={<Space><TeamOutlined /> Referencias</Space>} size="small" variant="borderless" style={{ background: '#f0f2f5', borderRadius: 12 }}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Title level={5} style={{ fontSize: 13, color: '#2b457c', marginBottom: 8 }}>Personales</Title>
                                    {(Array.isArray(activeCandidate.personalReferences) ? activeCandidate.personalReferences : []).map((ref: any, i: number) => (
                                        <div key={i} style={{ marginBottom: 8, padding: 8, background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                                            <Text strong style={{ fontSize: 12 }}>{ref.name}</Text><br />
                                            <Text type="secondary" style={{ fontSize: 11 }}>📞 {ref.phone} {ref.company ? `| 🏢 ${ref.company}` : ''}</Text>
                                        </div>
                                    ))}
                                    {(!activeCandidate.personalReferences || (activeCandidate.personalReferences as any[]).length === 0) && <Text type="secondary">Sin referencias</Text>}
                                </Col>
                                <Col span={12}>
                                    <Title level={5} style={{ fontSize: 13, color: '#2b457c', marginBottom: 8 }}>Laborales</Title>
                                    {(Array.isArray(activeCandidate.workReferences) ? activeCandidate.workReferences : []).map((ref: any, i: number) => (
                                        <div key={i} style={{ marginBottom: 8, padding: 8, background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                                            <Text strong style={{ fontSize: 12 }}>{ref.name}</Text><br />
                                            <Text type="secondary" style={{ fontSize: 11 }}>📞 {ref.phone} {ref.company ? `| 🏢 ${ref.company}` : ''}</Text>
                                        </div>
                                    ))}
                                    {(!activeCandidate.workReferences || (activeCandidate.workReferences as any[]).length === 0) && <Text type="secondary">Sin referencias</Text>}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Modal>
    );

    const renderHistoryModal = () => (
        <Modal
            title={<Title level={3}><HistoryOutlined /> Historial Detallado del Proceso</Title>}
            open={historyModalOpen}
            onCancel={() => setHistoryModalOpen(false)}
            footer={[<Button key="close" type="primary" onClick={() => setHistoryModalOpen(false)}>Cerrar</Button>]}
            width={700}
        >
            <div style={{ padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
                <Timeline
                    mode="left"
                    items={(currentApp?.logs || []).map((log: any, index: number) => {
                        const stage = stages.find(s => s.id === log.stageId);
                        const date = new Date(log.createdAt);
                        const isLatest = index === 0;
                        let statusColor = '#52c41a';
                        if (log.status === 'REJECTED') statusColor = '#ff4d4f';
                        if (isLatest && log.status !== 'REJECTED' && log.status !== 'HIRED') statusColor = '#fa8c16';

                        let displayStatus = log.status;
                        if (log.status === 'ACTIVE') {
                            displayStatus = 'COMPLETADO';
                        } else if (log.status === 'REJECTED') {
                            displayStatus = 'RECHAZADO';
                        } else if (log.status === 'HIRED') {
                            displayStatus = 'CONTRATADO';
                        }

                        return {
                            children: (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                            {date.toLocaleDateString()} - {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        {isLatest && log.status === 'ACTIVE' && (
                                            <Badge status="processing" color="orange" text={<Text strong style={{ fontSize: '10px', color: '#fa8c16' }}>ETAPA ANTERIOR</Text>} />
                                        )}
                                    </div>
                                    <Card size="small" style={{ borderLeft: `4px solid ${statusColor}`, boxShadow: isLatest ? '0 2px 8px rgba(250, 140, 22, 0.15)' : 'none' }}>
                                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Tag color={isLatest ? 'orange' : '#2b457c'}>{stage?.name || `Etapa ${log.stageId}`}</Tag>
                                                <Badge
                                                    status={log.status === 'REJECTED' ? 'error' : (isLatest && log.status === 'ACTIVE' ? 'processing' : 'success')}
                                                    text={displayStatus}
                                                />
                                            </div>
                                            <Text strong>{log.subStatus || 'Cambio de Etapa'}</Text>
                                            <Text style={{ fontSize: '13px', color: '#595959' }}>{log.comment}</Text>
                                        </Space>
                                    </Card>
                                </div>
                            ),
                            color: statusColor
                        };
                    })}
                />
            </div>
        </Modal>
    );

    const handleRescue = () => {
        const appId = activeCandidate.applications?.[0]?.id;
        if (!appId) return message.error('No se encontró una aplicación para rescatar');

        Modal.confirm({
            title: '¿Rescatar este candidato?',
            content: 'El candidato volverá a estar activo en el proceso.',
            okText: 'Rescatar',
            cancelText: 'Cancelar',
            onOk: async () => {
                await handleAction(async () => {
                    await candidateService.rescueCandidate(appId);
                    message.success('Candidato rescatado exitosamente');
                });
            }
        });
    };

    return (
        <Drawer
            title={
                <Space direction="vertical" size={0}>
                    <Title level={4} style={{ margin: 0 }}>{activeCandidate.firstName} {activeCandidate.lastName}</Title>
                    <Space align="center" size={8} style={{ marginTop: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Cédula: {activeCandidate.nationalId}</Text>
                        <Tag color={activeCandidate.currentStageId ? STAGE_COLORS[activeCandidate.currentStageId] : 'blue'} style={{ borderRadius: '4px' }}>
                            {activeCandidate.currentStageName || 'Postulado'}
                        </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{activeCandidate.profession}</Text>
                </Space>
            }
            open={open}
            onClose={onClose}
            width={650}
            extra={
                <Space>
                    {activeCandidate.driveFolderUrl && (
                        <Tooltip title="Abrir carpeta en Google Drive">
                            <Button
                                type="primary"
                                icon={<FolderOpenOutlined />}
                                href={activeCandidate.driveFolderUrl}
                                target="_blank"
                                style={{
                                    backgroundColor: '#fff7e6',
                                    borderColor: '#ffd591',
                                    color: '#d46b08',
                                    fontWeight: 500
                                }}
                            >
                                Ver carpeta
                            </Button>
                        </Tooltip>
                    )}
                    <Tag color={activeCandidate.hasVehicle ? 'cyan' : 'default'}>
                        {activeCandidate.hasVehicle ? 'Con Vehículo' : 'Sin Vehículo'}
                    </Tag>
                </Space>
            }
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0' }}>
                    <Space size="large">
                        {activeCandidate.rejectionReason || activeCandidate.applications?.[0]?.status === 'REJECTED' ? (
                            <PermissionGuard module="candidates" action="update">
                                <Button
                                    type="primary"
                                    size="large"
                                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', minWidth: 200 }}
                                    onClick={handleRescue}
                                >
                                    Rescatar Candidato
                                </Button>
                            </PermissionGuard>
                        ) : (
                            <>
                                {currentApp?.status !== 'HIRED' && (
                                    <PermissionGuard module="candidates" action="reject">
                                        <Button danger size="large" onClick={handleReject} style={{ minWidth: 120 }}>Rechazar</Button>
                                    </PermissionGuard>
                                )}

                                {currentStepIndex > 0 && currentApp?.status === 'ACTIVE' && (
                                    <PermissionGuard module="candidates" action="update">
                                        <Button
                                            size="large"
                                            icon={<ArrowLeftOutlined />}
                                            onClick={handleBack}
                                            style={{ minWidth: 120 }}
                                        >
                                            Etapa Anterior
                                        </Button>
                                    </PermissionGuard>
                                )}

                                {currentApp?.status === 'ACTIVE' && (
                                    currentStageId >= 7 ? (
                                        <PermissionGuard module="candidates" action="hire">
                                            <Button
                                                type="primary"
                                                size="large"
                                                onClick={handleHire}
                                                loading={submitting}
                                                icon={<TrophyOutlined />}
                                                style={{ minWidth: 160, backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                            >
                                                Contratar 🎉
                                            </Button>
                                        </PermissionGuard>
                                    ) : (
                                        currentStepIndex < stages.length - 1 && (
                                            <PermissionGuard module="candidates" action="advance">
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    onClick={handleAdvance}
                                                    loading={submitting}
                                                    icon={<ArrowRightOutlined />}
                                                    disabled={
                                                        (currentStageId === 1 && !activeCandidate.cvUrl) ||
                                                        (currentStageId === 2 && !activeCandidate.videoUrl) ||
                                                        (currentStageId === 3 && !activeCandidate.psychTestUrl)
                                                    }
                                                    title={
                                                        currentStageId === 1 && !activeCandidate.cvUrl
                                                            ? 'El candidato debe tener un currículum cargado para avanzar'
                                                            : currentStageId === 2 && !activeCandidate.videoUrl
                                                                ? 'El candidato debe subir su video para avanzar'
                                                                : currentStageId === 3 && !activeCandidate.psychTestUrl
                                                                    ? 'Debe subir los resultados de la prueba (PDF) para avanzar'
                                                                    : ''
                                                    }
                                                    style={{ minWidth: 160, backgroundColor: '#2b457c', borderColor: '#2b457c' }}
                                                >
                                                    Siguiente Etapa
                                                </Button>
                                            </PermissionGuard>
                                        )
                                    )
                                )}

                                {currentApp?.status === 'HIRED' && (
                                    <Tag color="green" style={{ fontSize: 16, padding: '8px 16px', borderRadius: 8 }}>
                                        <TrophyOutlined /> CANDIDATO CONTRATADO
                                    </Tag>
                                )}
                            </>
                        )}
                    </Space>
                </div>
            }
        >
            <div style={{ background: '#f0f2f5', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                <Row gutter={16} align="middle">
                    <Col span={14}>
                        <Space direction="vertical" size={2}>
                            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Etapa Actual</Text>
                            <Title level={4} style={{ margin: 0, color: '#2b457c' }}>{stages[currentStepIndex]?.name || 'Bienvenida'}</Title>
                            {currentApp?.logs?.[0]?.subStatus && (
                                <Space size={4}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Estado:</Text>
                                    <Text style={{ fontSize: '12px', color: '#595959', fontWeight: 500 }}>{currentApp.logs[0].subStatus}</Text>
                                </Space>
                            )}
                        </Space>
                    </Col>
                    <Col span={10} style={{ textAlign: 'right' }}>
                        <Button
                            icon={<HistoryOutlined />}
                            onClick={() => setHistoryModalOpen(true)}
                            style={{ borderRadius: '8px' }}
                        >
                            Ver Historial
                        </Button>
                    </Col>
                </Row>

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ marginTop: '8px' }}>
                    <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                        📌 Vacante / Requisición Asignada:
                    </Text>
                    <Card size="small" style={{ borderRadius: '8px', border: '1px solid #d9d9d9', background: '#fff' }}>
                        <Row align="middle" gutter={16}>
                            <Col flex="auto">
                                {currentApp?.jobRequisition ? (
                                    <Space direction="vertical" size={0}>
                                        <Text strong style={{ color: '#2b457c' }}>
                                            {typeof currentApp.jobRequisition.zone === 'object' ? currentApp.jobRequisition.zone?.name : currentApp.jobRequisition.zone} | {currentApp.jobRequisition.title}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {typeof currentApp.jobRequisition.company === 'object' ? currentApp.jobRequisition.company?.name : currentApp.jobRequisition.company}
                                        </Text>
                                    </Space>
                                ) : (
                                    <Text type="secondary" italic>Ninguna vacante asignada</Text>
                                )}
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<SearchOutlined />}
                                    onClick={() => setMatchingModalOpen(true)}
                                    style={{ borderRadius: '6px' }}
                                >
                                    {currentApp?.jobRequisition ? 'Cambiar o Quitar Requisición' : 'Asignar Requisición'}
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </div>

            <Descriptions
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>Información General</span>
                        <Button
                            type="primary"
                            size="small"
                            icon={<InfoCircleOutlined />}
                            onClick={() => setInfoModalOpen(true)}
                            style={{
                                backgroundColor: '#f0f5ff',
                                borderColor: '#adc6ff',
                                color: '#2b457c',
                                fontWeight: 500
                            }}
                        >
                            Ver más detalles
                        </Button>
                    </div>
                }
                bordered
                column={1}
                size="small"
            >
                <Descriptions.Item label="Cédula">{activeCandidate.nationalId}</Descriptions.Item>
                <Descriptions.Item label="Email">{activeCandidate.email}</Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                    <Space>
                        {activeCandidate.phone}
                        <Tooltip title="Contactar por WhatsApp">
                            <Button
                                type="text"
                                icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: '18px' }} />}
                                href={`https://wa.me/${activeCandidate.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                size="small"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            />
                        </Tooltip>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Ubicación">
                    {activeCandidate.municipality ? `${activeCandidate.municipality.state?.name || ''}, ${activeCandidate.municipality.name}` : 'Sin ubicación'}
                </Descriptions.Item>

            </Descriptions>

            <Divider orientation="left">Adjuntos y Herramientas</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
                {activeCandidate.cvUrl ? (
                    <Button block icon={<FilePdfOutlined />} style={{ textAlign: 'left' }} href={activeCandidate.cvUrl} target="_blank">
                        Currículum Vitae (Original)
                    </Button>
                ) : (
                    currentStageId === 1 && (
                        <Card size="small" style={{ background: '#fff2f0', border: '1px solid #ffccc7' }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text type="danger" strong><InfoCircleOutlined /> Currículum no encontrado</Text>
                                <Button
                                    block
                                    type="primary"
                                    danger={!resendCVSuccess}
                                    icon={<MailOutlined />}
                                    loading={submitting}
                                    disabled={resendCVSuccess}
                                    onClick={() => {
                                        Modal.confirm({
                                            title: '¿Re-solicitar Currículum?',
                                            content: 'Se enviará un correo al candidato solicitándole que suba su currículum a través del portal.',
                                            okText: 'Enviar Solicitud',
                                            cancelText: 'Cancelar',
                                            onOk: async () => {
                                                await handleAction(() => candidateService.resendDocumentationRequest(activeCandidate.id, 'CV'));
                                                setResendCVSuccess(true);
                                            }
                                        });
                                    }}
                                >
                                    {resendCVSuccess ? 'Solicitud de CV Enviada' : 'Re-solicitar CV al candidato'}
                                </Button>
                            </Space>
                        </Card>
                    )
                )}
                {activeCandidate.videoUrl && (
                    <Button block icon={<VideoCameraOutlined />} style={{ textAlign: 'left' }} href={activeCandidate.videoUrl} target="_blank">
                        Video Presentación
                    </Button>
                )}

                {/* PsychTest Results - Stage 3 specific or global view if exists */}
                {activeCandidate.psychTestUrl ? (
                    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                        <Button
                            block
                            icon={<FilePdfOutlined />}
                            href={activeCandidate.psychTestUrl}
                            target="_blank"
                            style={{ textAlign: 'left' }}
                        >
                            Resultados Prueba Psicotécnica (PDF)
                        </Button>
                        {currentStageId === 3 && (
                            <div style={{ textAlign: 'center', marginTop: '4px' }}>
                                <Upload
                                    accept=".pdf"
                                    showUploadList={false}
                                    customRequest={handlePsychTestUpload}
                                >
                                    <Button type="link" size="small" loading={submitting}>Actualizar Resultados (PDF)</Button>
                                </Upload>
                            </div>
                        )}
                    </div>
                ) : (
                    currentStageId === 3 && (
                        <Upload
                            accept=".pdf"
                            showUploadList={false}
                            customRequest={handlePsychTestUpload}
                        >
                            <Button
                                block
                                icon={<UploadOutlined />}
                                loading={submitting}
                                style={{
                                    marginTop: '8px',
                                    height: '45px',
                                    border: '2px dashed #2b457c',
                                    color: '#2b457c',
                                    fontWeight: 600
                                }}
                            >
                                Subir Resultados Prueba (PDF)
                            </Button>
                        </Upload>
                    )
                )}

                {currentStageId === 4 && (
                    <Button
                        block
                        type="primary"
                        icon={<WhatsAppOutlined />}
                        style={{ backgroundColor: '#25D366', borderColor: '#25D366', height: '45px', marginTop: '12px' }}
                        href={`https://wa.me/${activeCandidate.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${activeCandidate.firstName}, te contacto de TuPróximoEmpleo para agendar tu entrevista.`)}`}
                        target="_blank"
                    >
                        Agendar entrevista con {activeCandidate.firstName}
                    </Button>
                )}
            </Space>

            {activeCandidate.rejectionReason && (
                <div style={{ marginTop: 24, padding: 12, background: '#fff1f0', borderRadius: 8, border: '1px solid #ffa39e' }}>
                    <Text type="danger" strong>Motivo de Rechazo:</Text>
                    <div style={{ marginTop: 4 }}>{activeCandidate.rejectionReason}</div>
                </div>
            )}

            <Divider />

            {renderInfoModal()}
            {renderHistoryModal()}

            <Modal
                title={null}
                footer={null}
                open={hireModalOpen}
                onCancel={() => !isAnimatingHire && setHireModalOpen(false)}
                width={700}
                className="premium-hire-modal"
                centered
            >
                <div style={{ padding: '24px 0' }}>
                    {isAnimatingHire ? (
                        <HiringAnimation
                            candidate={activeCandidate}
                            requisition={targetRequisition as any}
                            onComplete={finalizeHire}
                            isBackendReady={hireCompleted}
                        />
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                                <Title level={3} style={{ margin: 0 }}>Confirmar Contratación</Title>
                                <Text type="secondary">Estás a punto de finalizar el proceso de selección</Text>
                            </div>

                            <Row gutter={24}>
                                <Col span={11}>
                                    <Card size="small" title="Candidato" bordered={false} style={{ background: '#f6ffed' }}>
                                        <Space direction="vertical" size={2}>
                                            <Text strong style={{ fontSize: 16 }}>{activeCandidate.firstName} {activeCandidate.lastName}</Text>
                                            <Text type="secondary">{activeCandidate.nationalId}</Text>
                                            <Tag color="green">{activeCandidate.profession}</Tag>
                                        </Space>
                                    </Card>
                                </Col>
                                <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowRightOutlined style={{ fontSize: 20, color: '#bfbfbf' }} />
                                </Col>
                                <Col span={11}>
                                    <Card size="small" title="Requisición / Vacante" bordered={false} style={{ background: '#e6f7ff' }}>
                                        <Space direction="vertical" size={2}>
                                            <Text strong style={{ fontSize: 16 }}>{targetRequisition?.title || 'N/A'}</Text>
                                            <Text type="secondary">{companyDisplay}</Text>
                                            <Space>
                                                <Tag color="blue">{idxDisplay}</Tag>
                                                <Tag color="orange">{zoneDisplay}</Tag>
                                            </Space>
                                        </Space>
                                    </Card>
                                </Col>
                            </Row>

                            <div style={{ marginTop: 24, padding: 16, background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                                <Text strong>Detalle Final:</Text>
                                <Paragraph style={{ margin: '8px 0 0' }}>
                                    Al confirmar, el candidato será marcado como <strong>Contratado</strong> y vinculado permanentemente a esta requisición. Se generará un registro en el historial de contrataciones.
                                </Paragraph>
                            </div>

                            <Row gutter={16} style={{ marginTop: 24 }}>
                                <Col span={12}>
                                    <Text strong>Fecha de Inicio Efectiva:</Text>
                                    <DatePicker
                                        style={{ width: '100%', marginTop: 8 }}
                                        placeholder="Selecciona fecha..."
                                        onChange={(date) => setEffectiveStartDate(date)}
                                        value={effectiveStartDate}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Text strong>Comentario de cierre (opcional):</Text>
                                    <Input.TextArea
                                        rows={1}
                                        placeholder="Perfil excelente..."
                                        style={{ marginTop: 8 }}
                                        value={hireComment}
                                        onChange={(e) => setHireComment(e.target.value)}
                                    />
                                </Col>
                            </Row>

                            <div style={{ marginTop: 32, textAlign: 'right' }}>
                                <Space>
                                    <Button onClick={() => setHireModalOpen(false)}>Cancelar</Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={confirmHire}
                                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                    >
                                        Confirmar Contratación 🎉
                                    </Button>
                                </Space>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
            <CandidateRequisitionMatchingModal
                open={matchingModalOpen}
                onClose={() => setMatchingModalOpen(false)}
                candidate={activeCandidate}
                onAssign={handleAssignRequisition}
            />
        </Drawer>
    );
};

export default CandidateDrawer;
