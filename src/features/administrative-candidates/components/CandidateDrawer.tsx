import React, { useState, useEffect } from 'react';
import { Drawer, Typography, Descriptions, Tag, Button, Space, Divider, message, Timeline, Modal, Input, Badge, Row, Col, Card, Tooltip, DatePicker, Upload, InputNumber, Select, Switch, Collapse } from 'antd';
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
    EditOutlined,
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseOutlined,
    CalendarOutlined,
    CaretRightOutlined,
    CheckCircleFilled,
    ClockCircleFilled,
    MoreOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Candidate, Requisition } from '../../../types';
import { VENEZUELA_STATES } from '../../../constants/venezuela';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loadCandidateById, selectSelectedCandidate, removeCandidate } from '../store/adminCandidatesSlice';
import { selectStages } from '../../../store/workflowSlice';
import { adminCandidateService, STAGE_COLORS } from '../../../services/adminCandidateService';

import HiringAnimation from './HiringAnimation';
import PermissionGuard from '../../../components/PermissionGuard';
import CandidateRequisitionMatchingModal from './CandidateRequisitionMatchingModal';

const { Title, Text, Paragraph } = Typography;

interface CandidateDrawerProps {
    open: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    requisition?: Requisition | null;
    onActionComplete?: (shouldClose?: boolean) => void;
    onUpdate?: () => void;
}

const STATUS_TRANSLATIONS: Record<string, string> = {
    'ACTIVE': 'En Proceso',
    'HIRED': 'Contratado',
    'REJECTED': 'Rechazado',
    'WITHDRAWN': 'Retirado',
};

const getWhatsAppMessage = (candidate: any) => {
    const firstName = candidate.firstName || 'Candidato';
    const currentApp = candidate.applications?.[0];
    const stageId = currentApp?.currentStageId;

    switch (stageId) {
        case 2: // Etapa de video
            return `Hola te saluda el equipo de captación de Grupo Mayoreo.
¡Felicidades! Ya estás participando en el proceso de selección para ser parte de la Fuerza de Ventas más grande del País.
Ahora queremos conocerte mejor
Notamos que aún no hemos recibido tu video.
Puedes subirlo en tu portal o, si prefieres, enviarlo por aquí
No pierdas esta oportunidad de avanzar en el proceso
¡Feliz día!`;

        case 3: // Etapa de pruebas
            return `Hola te saluda el equipo de captación de Grupo Mayoreo.
Te enviamos las pruebas psicotécnicas a tu correo. También puedes acceder a ellas desde tu portal.
Estamos a la espera de que las completes para poder continuar con tu proceso.
Estás cada vez más cerca de formar parte de una de las fuerzas de ventas más importantes del país.
¡Feliz día!`;

        case 4: // Entrevista
        case 5:
            return `Hola te saluda el equipo de Grupo Mayoreo.
¡Felicidades! Superaste las pruebas psicotécnicas y sigues avanzando en el proceso.
Nos encantaría invitarte a tu entrevista personal para seguir conociéndote.
Estás cada vez más cerca de formar parte de la fuerza de ventas más importante del país.
Cuéntanos tu disponibilidad y la coordinamos.`;

        default:
            return `Hola *${firstName}*, te saluda el equipo de captación de Grupo Mayoreo. ¡Felicidades! Ya estás participando en el proceso de selección de la fuerza de ventas más grande del país.`;
    }
};

const formatWhatsAppPhone = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');

    // If it starts with 0 (e.g. 0414...), remove the 0
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }

    // If it doesn't have the 58 prefix, add it
    if (!cleaned.startsWith('58')) {
        cleaned = '58' + cleaned;
    }

    return cleaned;
};

const CandidateDrawer: React.FC<CandidateDrawerProps> = ({ open, onClose, candidate, requisition, onActionComplete, onUpdate: _onUpdate }) => {
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
    const [resendVideoSuccess, setResendVideoSuccess] = useState(false);
    const [resendPsychSuccess, setResendPsychSuccess] = useState(false);
    const [noteComment, setNoteComment] = useState('');
    const [matchingModalOpen, setMatchingModalOpen] = useState(false);
    const [uploadingType, setUploadingType] = useState<string | null>(null);
    const [activeStageModal, setActiveStageModal] = useState<string | null>(null);

    // --- Edit state for the info modal ---
    type EditSection = 'personal' | 'ubicacion' | 'vehiculo' | 'ventas' | 'economica' | 'referencias' | null;
    const [editMunicipalities, setEditMunicipalities] = useState<{ id: number; name: string }[]>([]);
    const [editingSection, setEditingSection] = useState<EditSection>(null);
    const [editForm, setEditForm] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);

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

    useEffect(() => {
        setResendSuccess(false);
        setResendCVSuccess(false);
        setResendVideoSuccess(false);
        setResendPsychSuccess(false);
    }, [candidate?.id]);


    const handleAssignRequisition = async (requisitionId: string | null) => {
        if (!activeCandidate) return;
        const id = requisitionId === null ? null : Number(requisitionId);
        await handleAction(() => adminCandidateService.updateApplicationRequisition(activeCandidate.id, id));
    };

    if (!activeCandidate) return null;

    const currentApp = activeCandidate.applications?.[0];
    const currentStageId = currentApp?.currentStageId;
    const currentStepIndex = stages.findIndex(s => s.id === currentStageId);

    const targetRequisition = requisition || currentApp?.administrativeRequisition;
    const companyDisplay = typeof targetRequisition?.company === 'object' && targetRequisition?.company !== null ? targetRequisition.company.name : (targetRequisition?.company || 'N/A');
    const zoneDisplay = typeof targetRequisition?.zone === 'object' && targetRequisition?.zone !== null ? targetRequisition.zone.name : (targetRequisition?.zone || 'N/A');
    const idxDisplay = targetRequisition?.idx || targetRequisition?.id || 'N/A';

    const handlePsychTestUpload = async (info: any) => {
        const { file } = info;
        if (!activeCandidate) return;

        setUploadingType('PsychTest');
        try {
            await adminCandidateService.uploadCandidateDocument(activeCandidate.id, 'PsychTest', file);
            message.success('Prueba psicotécnica cargada exitosamente');
            await dispatch(loadCandidateById(activeCandidate.id));
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al cargar la prueba');
        } finally {
            setUploadingType(null);
        }
    };
    const handleAction = async (action: () => Promise<any>, shouldRefresh: boolean = true, shouldClose: boolean = false) => {
        setSubmitting(true);
        try {
            await action();
            message.success('Acción completada con éxito');
            if (activeCandidate?.id) {
                dispatch(loadCandidateById(activeCandidate.id));
            }
            if (onActionComplete && shouldRefresh) {
                onActionComplete(shouldClose);
            }
        } catch (error: any) {
            console.error('Action error:', error);
            message.error(error.response?.data?.message || 'Error al procesar la acción');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInterviewUpload = async (info: any, type: 'PersonalInterview' | 'TechnicalInterview' | 'CV' | 'Video' | 'MedicalCheckup' | 'JobOffer') => {
        const { file } = info;
        if (!activeCandidate) return;

        setUploadingType(type);
        try {
            await adminCandidateService.uploadCandidateDocument(activeCandidate.id, type, file);
            message.success('Documento cargado exitosamente');
            await dispatch(loadCandidateById(activeCandidate.id));
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al cargar el documento');
        } finally {
            setUploadingType(null);
        }
    };

    const handleUpdateInterviewDate = async (date: any, type: 'Personal' | 'Technical') => {
        if (!activeCandidate) return;
        const field = type === 'Personal' ? 'personalInterviewDate' : 'technicalInterviewDate';
        try {
            await adminCandidateService.updateCandidate(activeCandidate.id, {
                [field]: date ? date.toISOString() : null
            });
            message.success('Fecha de entrevista actualizada');
            dispatch(loadCandidateById(activeCandidate.id));
        } catch (error: any) {
            message.error('Error al actualizar la fecha');
        }
    };

    const handleAddNote = async () => {
        if (!noteComment.trim()) return message.warning('La nota no puede estar vacía');
        if (!currentApp?.id) return message.error('No hay una aplicación activa para este candidato');

        // Refresh list but DON'T close drawer for notes
        await handleAction(() => adminCandidateService.addApplicationComment(currentApp.id, noteComment), true, false);
        setNoteComment('');
    };

    const handleAdvance = () => {
        const nextStage = stages[currentStepIndex + 1];
        if (!nextStage) return;

        // Validation: Must have a requisition to advance (REMOVED as per user request)
        /* if (!currentApp?.administrativeRequisitionId) {
            return message.error('La vacante que tenía este candidato ya no está disponible. Por favor, asigne una nueva vacante para continuar.');
        } */

        // Validation: Assigned requisition must be OPEN to advance at any stage (REMOVED as per user request)
        /* if (currentApp?.administrativeRequisitionId && currentApp?.administrativeRequisition?.status !== 'OPEN') {
            const statusLabel = currentApp?.administrativeRequisition?.status === 'PAUSED' ? 'Pausada' :
                currentApp?.administrativeRequisition?.status === 'CANCELLED' ? 'Cancelada' : 'Cerrada';
            return message.error(`No se puede avanzar: La vacante asignada está ${statusLabel}. Por favor, asigne una nueva vacante abierta.`);
        } */

        if (nextStage.id === 3) {
            Modal.confirm({
                title: 'Programar Prueba Psicotécnica',
                content: (
                    <div style={{ marginTop: '16px' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Código de Acceso:</Text>
                            <Input id="test-code-input" placeholder="Ingresa el código de acceso del candidato en la plataforma de pruebas..." />
                            <Text strong style={{ marginTop: '8px' }}>¿Desea dejar algún comentario? (opcional):</Text>
                            <Input.TextArea id="transition-comment-input" placeholder="Escribe un comentario si lo deseas..." rows={2} />
                        </Space>
                    </div>
                ),
                okText: 'Enviar y Avanzar',
                cancelText: 'Cancelar',
                onOk: async () => {
                    const code = (document.getElementById('test-code-input') as HTMLInputElement).value;
                    const comment = (document.getElementById('transition-comment-input') as HTMLTextAreaElement).value;
                    if (!code) return message.error('El código de acceso es obligatorio');
                    await handleAction(() => adminCandidateService.updateCandidateStage(activeCandidate.id, nextStage.id, {
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
                    await handleAction(() => adminCandidateService.updateCandidateStage(activeCandidate.id, nextStage.id, { comment: comment || 'Iniciado flujo de entrevista' }));
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
                await handleAction(() => adminCandidateService.updateCandidateStage(activeCandidate.id, nextStage.id, { comment: comment || undefined }));
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
                handleAction(() => adminCandidateService.updateCandidateStage(activeCandidate.id, prevStage.id, { comment: comment || 'Regresado a etapa anterior manualmente' }));
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
                // CLOSE candidate drawer on rejection as they move out of view
                await handleAction(async () => { await adminCandidateService.rejectCandidate(activeCandidate.id, reason); }, true, true);
            }
        });
    };

    const handleHire = () => {
        const targetRequisition = requisition || activeCandidate.applications?.[0]?.administrativeRequisition;
        if (!targetRequisition) {
            return message.error('No se puede contratar sin una requisición asignada.');
        }
        setEffectiveStartDate(null); // Reset date
        setHireModalOpen(true);
    };

    const confirmHire = async () => {
        const targetRequisition = requisition || activeCandidate.applications?.[0]?.administrativeRequisition;
        if (!targetRequisition || !activeCandidate || !effectiveStartDate) {
            return message.error('Por favor selecciona una fecha de inicio efectiva');
        }

        setIsAnimatingHire(true);
        try {
            // Backend hire call
            await adminCandidateService.hireCandidate(
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
        if (onActionComplete) onActionComplete(true);
        onClose();
    };

    // --- Edit helpers ---
    const startEdit = (section: EditSection) => {
        const c = activeCandidate;
        const base: Record<string, any> = {
            firstName: c.firstName,
            lastName: c.lastName,
            nationalId: c.nationalId,
            educationLevel: c.educationLevel || '',
            email: c.email,
            phone: c.phone,
            altPhone: c.altPhone || '',
            birthDate: c.birthDate ? dayjs(c.birthDate) : null,
            gender: c.gender || '',
            maritalStatus: c.maritalStatus || '',
            hasChildren: c.hasChildren ?? false,
            childrenCount: c.childrenCount ?? 0,
            hasVehicle: c.hasVehicle ?? false,
            vehicleType: c.vehicleType || '',
            vehicleBrandModelYear: c.vehicleBrandModelYear || '',
            isVehicleOwner: c.isVehicleOwner ?? false,
            vehicleOwnerRelationship: c.vehicleOwnerRelationship || '',
            salesExperienceYears: c.salesExperienceYears ?? 0,
            salesExperienceTypes: Array.isArray(c.salesExperienceTypes) ? c.salesExperienceTypes : [],
            commercializedGoodsTypes: Array.isArray(c.commercializedGoodsTypes) ? c.commercializedGoodsTypes : [],
            profession: c.profession || '',
            currentCompany: c.currentCompany || '',
            previousCompanies: c.previousCompanies || '',
            currentMonthlyIncome: c.currentMonthlyIncome ?? null,
            salaryAspiration: c.salaryAspiration ?? null,
            address: c.address || '',
            personalReferences: Array.isArray(c.personalReferences) ? JSON.parse(JSON.stringify(c.personalReferences)).filter(Boolean) : [],
            workReferences: Array.isArray(c.workReferences) ? JSON.parse(JSON.stringify(c.workReferences)).filter(Boolean) : [],
            municipalityId: c.municipalityId || null,
            editStateId: c.municipality?.state?.id || null,
        };
        // Pre-load municipalities if editing ubicacion and state is known
        if (section === 'ubicacion' && (c.municipality?.state?.id)) {
            const found = VENEZUELA_STATES.find(s => s.id === c.municipality?.state?.id);
            setEditMunicipalities(found ? found.municipalities : []);
        }
        setEditForm(base);
        setEditingSection(section);
    };

    const cancelEdit = () => setEditingSection(null);

    const handleSaveEdit = async (section: EditSection) => {
        if (!activeCandidate) return;
        setSaving(true);
        try {
            const payload: Record<string, any> = {};
            if (section === 'personal') {
                payload.firstName = editForm.firstName;
                payload.lastName = editForm.lastName;
                payload.nationalId = editForm.nationalId;
                payload.educationLevel = editForm.educationLevel;
                payload.email = editForm.email;
                payload.phone = editForm.phone;
                payload.altPhone = editForm.altPhone;
                payload.birthDate = editForm.birthDate ? editForm.birthDate.toISOString() : undefined;
                payload.gender = editForm.gender;
                payload.maritalStatus = editForm.maritalStatus;
                payload.address = editForm.address;
                payload.hasChildren = editForm.hasChildren;
                payload.childrenCount = editForm.childrenCount;
            } else if (section === 'vehiculo') {
                payload.hasVehicle = editForm.hasVehicle;
                payload.vehicleType = editForm.vehicleType;
                payload.vehicleBrandModelYear = editForm.vehicleBrandModelYear;
                payload.isVehicleOwner = editForm.isVehicleOwner;
                payload.vehicleOwnerRelationship = editForm.vehicleOwnerRelationship;
            } else if (section === 'ventas') {
                payload.salesExperienceYears = editForm.salesExperienceYears;
                payload.salesExperienceTypes = editForm.salesExperienceTypes;
                payload.commercializedGoodsTypes = editForm.commercializedGoodsTypes;
                payload.profession = editForm.profession;
            } else if (section === 'economica') {
                payload.currentCompany = editForm.currentCompany;
                payload.previousCompanies = editForm.previousCompanies;
                payload.currentMonthlyIncome = editForm.currentMonthlyIncome;
                payload.salaryAspiration = editForm.salaryAspiration;
            } else if (section === 'ubicacion') {
                payload.municipalityId = editForm.municipalityId;
            } else if (section === 'referencias') {
                payload.personalReferences = editForm.personalReferences;
                payload.workReferences = editForm.workReferences;
            }
            await adminCandidateService.updateCandidate(activeCandidate.id, payload);
            message.success('Datos actualizados exitosamente');
            setEditingSection(null);
            dispatch(loadCandidateById(activeCandidate.id));
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    const editCardTitle = (icon: React.ReactNode, label: string, section: EditSection) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>{icon}{label}</Space>
            {editingSection === section ? (
                <Space size={4}>
                    <Button size="small" type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSaveEdit(section)} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>Guardar</Button>
                    <Button size="small" icon={<CloseOutlined />} onClick={cancelEdit}>Cancelar</Button>
                </Space>
            ) : (
                <Button size="small" type="text" icon={<EditOutlined />} onClick={() => startEdit(section)} style={{ color: '#2b457c' }} />
            )}
        </div>
    );

    const renderInfoModal = () => (
        <Modal
            title={<Title level={3}><UserOutlined /> Información Completa</Title>}
            open={infoModalOpen}
            onCancel={() => { setInfoModalOpen(false); setEditingSection(null); }}
            footer={[<Button key="close" type="primary" onClick={() => { setInfoModalOpen(false); setEditingSection(null); }}>Cerrar</Button>]}
            width={940}
        >
            <div style={{ padding: '0px 10px', maxHeight: '70vh', overflowY: 'auto' }}>
                <Row gutter={[16, 16]}>
                    {/* Access Management */}
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
                                                await handleAction(() => adminCandidateService.resendAccessCredentials(activeCandidate.id));
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

                    {/* Datos Personales */}
                    <Col span={12}>
                        <Card
                            title={editCardTitle(<UserOutlined />, 'Datos Personales', 'personal')}
                            size="small"
                            variant="borderless"
                            style={{ background: '#f5f5f5', borderRadius: 12, height: '100%' }}
                        >
                            {editingSection === 'personal' ? (
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Nombre</Text>
                                        <Input value={editForm.firstName} onChange={e => setEditForm((f: any) => ({ ...f, firstName: e.target.value }))} size="small" /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Apellido</Text>
                                        <Input value={editForm.lastName} onChange={e => setEditForm((f: any) => ({ ...f, lastName: e.target.value }))} size="small" /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Cédula</Text>
                                        <Input value={editForm.nationalId} onChange={e => setEditForm((f: any) => ({ ...f, nationalId: e.target.value }))} size="small" /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Nivel Académico</Text>
                                        <Select
                                            size="small" style={{ width: '100%' }}
                                            value={editForm.educationLevel || undefined}
                                            onChange={v => setEditForm((f: any) => ({ ...f, educationLevel: v }))}
                                            options={['Secundaria', 'TSU', 'Universitario', 'Postgrado', 'Doctorado', 'Técnico', 'Otro'].map(v => ({ label: v, value: v }))}
                                            placeholder="Seleccionar..."
                                            allowClear
                                        /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Email</Text>
                                        <Input value={editForm.email} onChange={e => setEditForm((f: any) => ({ ...f, email: e.target.value }))} size="small" /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Teléfono</Text>
                                        <Input value={editForm.phone} onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))} size="small" /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Teléfono Alt.</Text>
                                        <Input value={editForm.altPhone} onChange={e => setEditForm((f: any) => ({ ...f, altPhone: e.target.value }))} size="small" /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Dirección Exacta</Text>
                                        <Input.TextArea value={editForm.address} onChange={e => setEditForm((f: any) => ({ ...f, address: e.target.value }))} size="small" autoSize={{ minRows: 2, maxRows: 3 }} /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Fecha de Nacimiento</Text>
                                        <DatePicker
                                            size="small" style={{ width: '100%' }}
                                            value={editForm.birthDate}
                                            onChange={d => setEditForm((f: any) => ({ ...f, birthDate: d }))}
                                            format="DD/MM/YYYY"
                                        /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Género</Text>
                                        <Select
                                            size="small" style={{ width: '100%' }}
                                            value={editForm.gender || undefined}
                                            onChange={v => setEditForm((f: any) => ({ ...f, gender: v }))}
                                            options={['Masculino', 'Femenino', 'Otro'].map(v => ({ label: v, value: v }))}
                                            allowClear placeholder="Seleccionar..."
                                        /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Estado Civil</Text>
                                        <Select
                                            size="small" style={{ width: '100%' }}
                                            value={editForm.maritalStatus || undefined}
                                            onChange={v => setEditForm((f: any) => ({ ...f, maritalStatus: v }))}
                                            options={['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre'].map(v => ({ label: v, value: v }))}
                                            allowClear placeholder="Seleccionar..."
                                        /></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Switch checked={editForm.hasChildren} onChange={v => setEditForm((f: any) => ({ ...f, hasChildren: v }))} size="small" />
                                        <Text style={{ fontSize: 12 }}>¿Tiene hijos?</Text>
                                        {editForm.hasChildren && (
                                            <InputNumber
                                                size="small" min={0} max={20}
                                                value={editForm.childrenCount}
                                                onChange={v => setEditForm((f: any) => ({ ...f, childrenCount: v }))}
                                                style={{ width: 60 }}
                                            />
                                        )}
                                    </div>
                                </Space>
                            ) : (
                                <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                                    <Descriptions.Item label="Nombre">{activeCandidate.firstName} {activeCandidate.lastName}</Descriptions.Item>
                                    <Descriptions.Item label="Cédula">{activeCandidate.nationalId}</Descriptions.Item>
                                    <Descriptions.Item label="Nivel Académico">{activeCandidate.educationLevel || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Email">{activeCandidate.email}</Descriptions.Item>
                                    <Descriptions.Item label="Teléfono">{activeCandidate.phone}</Descriptions.Item>
                                    <Descriptions.Item label="Teléfono Alt.">{activeCandidate.altPhone || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Dirección">{activeCandidate.address || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Fecha Nacimiento">{activeCandidate.birthDate ? dayjs(activeCandidate.birthDate).format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Género">{activeCandidate.gender || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Estado Civil">{activeCandidate.maritalStatus || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Hijos">{activeCandidate.hasChildren ? `Sí (${activeCandidate.childrenCount || 0})` : 'No'}</Descriptions.Item>
                                </Descriptions>
                            )}
                        </Card>
                    </Col>

                    {/* Ubicación (editable) + Vehículo (editable) */}
                    <Col span={12}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Card
                                title={editCardTitle(<InfoCircleOutlined />, 'Ubicación', 'ubicacion')}
                                size="small"
                                variant="borderless"
                                style={{ background: '#f5f5f5', borderRadius: 12 }}
                            >
                                {editingSection === 'ubicacion' ? (
                                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                        <div>
                                            <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Estado</Text>
                                            <Select
                                                value={editForm.editStateId}
                                                onChange={(stateId: number) => {
                                                    const found = VENEZUELA_STATES.find(s => s.id === stateId);
                                                    setEditMunicipalities(found ? found.municipalities : []);
                                                    setEditForm((f: any) => ({ ...f, editStateId: stateId, municipalityId: null }));
                                                }}
                                                placeholder="Seleccione estado"
                                                style={{ width: '100%' }}
                                                showSearch
                                                optionFilterProp="children"
                                                size="small"
                                            >
                                                {VENEZUELA_STATES.map(s => (
                                                    <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Municipio</Text>
                                            <Select
                                                value={editForm.municipalityId}
                                                onChange={(municipalityId: number) => {
                                                    setEditForm((f: any) => ({ ...f, municipalityId }));
                                                }}
                                                placeholder="Seleccione municipio"
                                                style={{ width: '100%' }}
                                                showSearch
                                                optionFilterProp="children"
                                                size="small"
                                                disabled={!editForm.editStateId}
                                            >
                                                {editMunicipalities.map(m => (
                                                    <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </Space>
                                ) : (
                                    <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                                        <Descriptions.Item label="Estado">{activeCandidate.municipality?.state?.name || 'N/A'}</Descriptions.Item>
                                        <Descriptions.Item label="Municipio">{activeCandidate.municipality?.name || 'N/A'}</Descriptions.Item>
                                    </Descriptions>
                                )}
                            </Card>

                            <Card
                                title={editCardTitle(<CarOutlined />, 'Vehículo', 'vehiculo')}
                                size="small"
                                variant="borderless"
                                style={{ background: '#f5f5f5', borderRadius: 12 }}
                            >
                                {editingSection === 'vehiculo' ? (
                                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Switch checked={editForm.hasVehicle} onChange={v => setEditForm((f: any) => ({ ...f, hasVehicle: v }))} size="small" />
                                            <Text style={{ fontSize: 12 }}>¿Tiene vehículo?</Text>
                                        </div>
                                        {editForm.hasVehicle && (
                                            <>
                                                <div><Text type="secondary" style={{ fontSize: 11 }}>Tipo de Vehículo</Text>
                                                    <Select
                                                        size="small" style={{ width: '100%' }}
                                                        value={editForm.vehicleType || undefined}
                                                        onChange={v => setEditForm((f: any) => ({ ...f, vehicleType: v }))}
                                                        options={['Moto', 'Carro', 'Camioneta', 'Camión', 'Otro'].map(v => ({ label: v, value: v }))}
                                                        allowClear placeholder="Seleccionar..."
                                                    /></div>
                                                <div><Text type="secondary" style={{ fontSize: 11 }}>Marca / Modelo / Año</Text>
                                                    <Input value={editForm.vehicleBrandModelYear} onChange={e => setEditForm((f: any) => ({ ...f, vehicleBrandModelYear: e.target.value }))} size="small" placeholder="Ej: Toyota Corolla 2018" /></div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Switch checked={editForm.isVehicleOwner} onChange={v => setEditForm((f: any) => ({ ...f, isVehicleOwner: v }))} size="small" />
                                                    <Text style={{ fontSize: 12 }}>¿Es propietario?</Text>
                                                </div>
                                                {!editForm.isVehicleOwner && (
                                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Relación con dueño</Text>
                                                        <Input value={editForm.vehicleOwnerRelationship} onChange={e => setEditForm((f: any) => ({ ...f, vehicleOwnerRelationship: e.target.value }))} size="small" /></div>
                                                )}
                                            </>
                                        )}
                                    </Space>
                                ) : (
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
                                )}
                            </Card>
                        </Space>
                    </Col>

                    {/* Experiencia en Ventas */}
                    <Col span={12}>
                        <Card
                            title={editCardTitle(<BulbOutlined />, 'Experiencia en Ventas', 'ventas')}
                            size="small"
                            variant="borderless"
                            style={{ background: '#f5f5f5', borderRadius: 12, height: '100%' }}
                        >
                            {editingSection === 'ventas' ? (
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Profesión</Text>
                                        <Input value={editForm.profession} onChange={e => setEditForm((f: any) => ({ ...f, profession: e.target.value }))} size="small" /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Años de Experiencia en Ventas</Text>
                                        <InputNumber
                                            size="small" min={0} max={50} style={{ width: '100%' }}
                                            value={editForm.salesExperienceYears}
                                            onChange={v => setEditForm((f: any) => ({ ...f, salesExperienceYears: v }))}
                                        /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Tipos de Venta</Text>
                                        <Select
                                            mode="multiple" size="small" style={{ width: '100%' }}
                                            value={editForm.salesExperienceTypes}
                                            onChange={v => setEditForm((f: any) => ({ ...f, salesExperienceTypes: v }))}
                                            options={['Directa', 'Indirecta', 'Corporativa', 'Retail', 'Telefónica', 'Online', 'Otra'].map(v => ({ label: v, value: v }))}
                                            placeholder="Seleccionar tipos..."
                                        /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Tipo de Bienes Comercializados</Text>
                                        <Select
                                            mode="multiple" size="small" style={{ width: '100%' }}
                                            value={editForm.commercializedGoodsTypes}
                                            onChange={v => setEditForm((f: any) => ({ ...f, commercializedGoodsTypes: v }))}
                                            options={['Alimentos', 'Bebidas', 'Seguros', 'Tecnología', 'Farmacéutico', 'Automotriz', 'Servicios', 'Otro'].map(v => ({ label: v, value: v }))}
                                            placeholder="Seleccionar bienes..."
                                        /></div>
                                </Space>
                            ) : (
                                <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                                    <Descriptions.Item label="Profesión">{activeCandidate.profession || 'Sin especificar'}</Descriptions.Item>
                                    <Descriptions.Item label="Exp. Ventas">{activeCandidate.salesExperienceYears ? `${activeCandidate.salesExperienceYears} año(s)` : 'No'}</Descriptions.Item>
                                    {activeCandidate.salesExperienceYears ? (
                                        <>
                                            <Descriptions.Item label="Tipos">{Array.isArray(activeCandidate.salesExperienceTypes) ? activeCandidate.salesExperienceTypes.join(', ') : (activeCandidate.salesExperienceTypes || 'N/A')}</Descriptions.Item>
                                            <Descriptions.Item label="Bienes">{Array.isArray(activeCandidate.commercializedGoodsTypes) ? activeCandidate.commercializedGoodsTypes.join(', ') : (activeCandidate.commercializedGoodsTypes || 'N/A')}</Descriptions.Item>
                                        </>
                                    ) : null}
                                </Descriptions>
                            )}
                        </Card>
                    </Col>

                    {/* Situación Económica */}
                    <Col span={12}>
                        <Card
                            title={editCardTitle(<BankOutlined />, 'Situación Económica y Laboral', 'economica')}
                            size="small"
                            variant="borderless"
                            style={{ background: '#f5f5f5', borderRadius: 12, height: '100%' }}
                        >
                            {editingSection === 'economica' ? (
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Empresa Actual</Text>
                                        <Input value={editForm.currentCompany} onChange={e => setEditForm((f: any) => ({ ...f, currentCompany: e.target.value }))} size="small" /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Empresas Previas</Text>
                                        <Input.TextArea rows={2} value={editForm.previousCompanies} onChange={e => setEditForm((f: any) => ({ ...f, previousCompanies: e.target.value }))} size="small" /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Ingreso Mensual Actual (USD)</Text>
                                        <InputNumber
                                            size="small" min={0} style={{ width: '100%' }}
                                            value={editForm.currentMonthlyIncome}
                                            onChange={v => setEditForm((f: any) => ({ ...f, currentMonthlyIncome: v }))}
                                            prefix="$"
                                        /></div>
                                    <div><Text type="secondary" style={{ fontSize: 11 }}>Aspiración Salarial (USD)</Text>
                                        <InputNumber
                                            size="small" min={0} style={{ width: '100%' }}
                                            value={editForm.salaryAspiration}
                                            onChange={v => setEditForm((f: any) => ({ ...f, salaryAspiration: v }))}
                                            prefix="$"
                                        /></div>
                                </Space>
                            ) : (
                                <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
                                    <Descriptions.Item label="Empresa Actual">{activeCandidate.currentCompany || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Empresas Previas">{activeCandidate.previousCompanies || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Ingreso Actual">{activeCandidate.currentMonthlyIncome ? `${activeCandidate.currentMonthlyIncome} USD` : 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Aspiración">{activeCandidate.salaryAspiration ? `${activeCandidate.salaryAspiration} USD` : 'N/A'}</Descriptions.Item>
                                </Descriptions>
                            )}
                        </Card>
                    </Col>

                    {/* Referencias */}
                    <Col span={24}>
                        <Card
                            title={editCardTitle(<TeamOutlined />, 'Referencias', 'referencias')}
                            size="small"
                            variant="borderless"
                            style={{ background: '#f0f2f5', borderRadius: 12 }}
                        >
                            {editingSection === 'referencias' ? (
                                <Row gutter={24}>
                                    {(['personalReferences', 'workReferences'] as const).map((field) => (
                                        <Col span={12} key={field}>
                                            <Title level={5} style={{ fontSize: 13, color: '#2b457c', marginBottom: 8 }}>{field === 'personalReferences' ? 'Personales' : 'Laborales'}</Title>
                                            <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                                {(editForm[field] as any[]).map((ref: any, i: number) => (
                                                    <div key={i} style={{ padding: 8, background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                                                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                            <Input
                                                                size="small" placeholder="Nombre"
                                                                value={ref.name}
                                                                onChange={e => {
                                                                    const updated = [...editForm[field]];
                                                                    updated[i] = { ...updated[i], name: e.target.value };
                                                                    setEditForm((f: any) => ({ ...f, [field]: updated }));
                                                                }}
                                                            />
                                                            <Input
                                                                size="small" placeholder="Teléfono"
                                                                value={ref.phone}
                                                                onChange={e => {
                                                                    const updated = [...editForm[field]];
                                                                    updated[i] = { ...updated[i], phone: e.target.value };
                                                                    setEditForm((f: any) => ({ ...f, [field]: updated }));
                                                                }}
                                                            />
                                                            <Input
                                                                size="small" placeholder="Empresa (opcional)"
                                                                value={ref.company || ''}
                                                                onChange={e => {
                                                                    const updated = [...editForm[field]];
                                                                    updated[i] = { ...updated[i], company: e.target.value };
                                                                    setEditForm((f: any) => ({ ...f, [field]: updated }));
                                                                }}
                                                            />
                                                            <Button
                                                                size="small" danger type="text" icon={<DeleteOutlined />}
                                                                onClick={() => {
                                                                    const updated = (editForm[field] as any[]).filter((_: any, idx: number) => idx !== i);
                                                                    setEditForm((f: any) => ({ ...f, [field]: updated }));
                                                                }}
                                                            >Eliminar</Button>
                                                        </Space>
                                                    </div>
                                                ))}
                                                <Button
                                                    size="small" type="dashed" block icon={<PlusOutlined />}
                                                    onClick={() => setEditForm((f: any) => ({ ...f, [field]: [...(f[field] || []), { name: '', phone: '', company: '' }] }))}
                                                >Agregar Referencia</Button>
                                            </Space>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Title level={5} style={{ fontSize: 13, color: '#2b457c', marginBottom: 8 }}>Personales</Title>
                                        {(Array.isArray(activeCandidate.personalReferences) ? activeCandidate.personalReferences : []).filter(Boolean).map((ref: any, i: number) => (
                                            <div key={i} style={{ marginBottom: 8, padding: 8, background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                                                <Text strong style={{ fontSize: 12 }}>{ref?.name || 'N/A'}</Text><br />
                                                <Text type="secondary" style={{ fontSize: 11 }}>📞 {ref?.phone || 'N/A'} {ref?.company ? `| 🏢 ${ref.company}` : ''}</Text>
                                            </div>
                                        ))}
                                        {(!activeCandidate.personalReferences || (activeCandidate.personalReferences as any[]).filter(Boolean).length === 0) && <Text type="secondary">Sin referencias</Text>}
                                    </Col>
                                    <Col span={12}>
                                        <Title level={5} style={{ fontSize: 13, color: '#2b457c', marginBottom: 8 }}>Laborales</Title>
                                        {(Array.isArray(activeCandidate.workReferences) ? activeCandidate.workReferences : []).filter(Boolean).map((ref: any, i: number) => (
                                            <div key={i} style={{ marginBottom: 8, padding: 8, background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                                                <Text strong style={{ fontSize: 12 }}>{ref?.name || 'N/A'}</Text><br />
                                                <Text type="secondary" style={{ fontSize: 11 }}>📞 {ref?.phone || 'N/A'} {ref?.company ? `| 🏢 ${ref.company}` : ''}</Text>
                                            </div>
                                        ))}
                                        {(!activeCandidate.workReferences || (activeCandidate.workReferences as any[]).filter(Boolean).length === 0) && <Text type="secondary">Sin referencias</Text>}
                                    </Col>
                                </Row>
                            )}
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
                <div style={{ marginBottom: '16px', padding: '12px', background: '#f9f0ff', borderRadius: '8px', border: '1px solid #d3adf7' }}>
                    <Text strong style={{ color: '#531dab' }}>
                        <HistoryOutlined /> Resumen de Actividad:
                    </Text>
                    <div style={{ marginTop: '4px' }}>
                        Este candidato se ha postulado un total de <Text strong style={{ fontSize: '16px', color: '#722ed1' }}>{activeCandidate.applications?.length || 0}</Text> veces a diferentes vacantes de la empresa.
                    </div>
                </div>
                <Timeline
                    mode="left"
                    items={(currentApp?.logs || []).map((log: any, index: number) => {
                        const stage = stages.find(s => s.id === log.stageId);
                        const date = new Date(log.createdAt);
                        const isLatest = index === 0;
                        let statusColor = '#52c41a';
                        if (log.status === 'REJECTED') statusColor = '#ff4d4f';
                        if (isLatest && log.status !== 'REJECTED' && log.status !== 'HIRED') statusColor = '#fa8c16';

                        const displayStatus = log.status === 'ACTIVE' ? 'Completado' : (STATUS_TRANSLATIONS[log.status] || log.status);

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
            content: 'El candidato volverá a estar activo en el proceso en la etapa donde quedó.',
            okText: 'Rescatar',
            cancelText: 'Cancelar',
            onOk: async () => {
                await handleAction(async () => {
                    await adminCandidateService.rescueCandidate(appId);
                    message.success('Candidato rescatado exitosamente');
                }, true, false); // DON'T close on rescue, let the user see the current state
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
            width="calc(100vw - 260px)"
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
                            <PermissionGuard module="adminCandidates" action="update">
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
                                    <PermissionGuard module="adminCandidates" action="reject">
                                        <Button danger size="large" onClick={handleReject} style={{ minWidth: 120 }}>Rechazar</Button>
                                    </PermissionGuard>
                                )}

                                {currentStepIndex > 0 && currentApp?.status === 'ACTIVE' && (
                                    <PermissionGuard module="adminCandidates" action="update">
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
                                        <PermissionGuard module="adminCandidates" action="hire">
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
                                            <PermissionGuard module="adminCandidates" action="advance">
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    onClick={handleAdvance}
                                                    loading={submitting}
                                                    icon={<ArrowRightOutlined />}
                                                    disabled={false}
                                                    title={''}
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
            <Row gutter={24}>
                <Col span={12}>
                    <div style={{ background: '#f0f2f5', padding: '16px', borderRadius: '12px', marginBottom: '24px', height: '100%' }}>
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
                                        {currentApp?.administrativeRequisition ? (
                                            <Space direction="vertical" size={0}>
                                                <Text strong style={{ color: '#2b457c' }}>
                                                    {currentApp.administrativeRequisition.department || 'N/A'} | {currentApp.administrativeRequisition.position || 'N/A'}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {typeof currentApp.administrativeRequisition.company === 'object' && currentApp.administrativeRequisition.company !== null ? currentApp.administrativeRequisition.company.name : (currentApp.administrativeRequisition.company || 'N/A')}
                                                    {currentApp.administrativeRequisition.levelAndStep ? ` - ${currentApp.administrativeRequisition.levelAndStep}` : ''}
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
                                            {currentApp?.administrativeRequisition ? 'Cambiar' : 'Asignar'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card>
                        </div>
                    </div>
                </Col>
                
                <Col span={12}>
                    <div style={{ background: '#f0f2f5', padding: '16px', borderRadius: '12px', marginBottom: '24px', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
                            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Información General</Text>
                            <Button
                                type="primary"
                                size="small"
                                icon={<InfoCircleOutlined />}
                                onClick={() => setInfoModalOpen(true)}
                                style={{
                                    backgroundColor: '#fff',
                                    borderColor: '#d9d9d9',
                                    color: '#2b457c',
                                    fontWeight: 500
                                }}
                            >
                                Ver más detalles
                            </Button>
                        </div>
                        <Descriptions
                            bordered
                            column={1}
                            size="small"
                            style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}
                        >
                            <Descriptions.Item label="Cédula">{activeCandidate.nationalId}</Descriptions.Item>
                            <Descriptions.Item label="Nro. Postulaciones">
                                <Badge count={activeCandidate.applications?.length || 0} overflowCount={99} style={{ backgroundColor: '#722ed1' }} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">{activeCandidate.email}</Descriptions.Item>
                            <Descriptions.Item label="Teléfono">
                                <Space>
                                    {activeCandidate.phone}
                                    <Tooltip title="Contactar por WhatsApp">
                                        <Button
                                            type="text"
                                            icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: '18px' }} />}
                                            href={`https://wa.me/${formatWhatsAppPhone(activeCandidate.phone)}?text=${encodeURIComponent(getWhatsAppMessage(activeCandidate))}`}
                                            target="_blank"
                                            rel="noreferrer"
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
                    </div>
                </Col>
            </Row>

            {/* ===== CUSTOM ZIG-ZAG SNAKE TIMELINE ===== */}
            {(() => {
                const timelineStages = [
                    { key: 'cv', stageNum: 1, label: 'Currículum', icon: <FilePdfOutlined />, color: '#1890ff', borderColor: '#1890ff50', bg: '#e6f7ff', done: !!activeCandidate.cvUrl, visible: true },
                    { key: 'video', stageNum: 2, label: 'Video', icon: <VideoCameraOutlined />, color: '#722ed1', borderColor: '#722ed150', bg: '#f9f0ff', done: !!activeCandidate.videoUrl, visible: currentStageId >= 2 || !!activeCandidate.videoUrl },
                    { key: 'psychtest', stageNum: 3, label: 'Psicotécnica', icon: <BulbOutlined />, color: '#eb2f96', borderColor: '#eb2f9650', bg: '#fff0f6', done: !!activeCandidate.psychTestUrl, visible: currentStageId >= 3 },
                    { key: 'personal', stageNum: 4, label: 'Entrev. Personal', icon: <CalendarOutlined />, color: '#13c2c2', borderColor: '#13c2c250', bg: '#e6fffb', done: !!activeCandidate.personalInterviewUrl, visible: currentStageId >= 4 || !!activeCandidate.personalInterviewUrl || !!activeCandidate.personalInterviewDate },
                    { key: 'technical', stageNum: 5, label: 'Entrev. Técnica', icon: <CalendarOutlined />, color: '#2f54eb', borderColor: '#2f54eb50', bg: '#f0f5ff', done: !!activeCandidate.technicalInterviewUrl, visible: currentStageId >= 5 || !!activeCandidate.technicalInterviewUrl || !!activeCandidate.technicalInterviewDate },
                    { key: 'medical', stageNum: 6, label: 'Médicas/AP/Ref', icon: <TeamOutlined />, color: '#52c41a', borderColor: '#52c41a50', bg: '#f6ffed', done: !!activeCandidate.medicalCheckupUrl, visible: currentStageId >= 6 || !!activeCandidate.medicalCheckupUrl },
                    { key: 'joboffer', stageNum: 7, label: 'Oferta Laboral', icon: <SaveOutlined />, color: '#13c2c2', borderColor: '#13c2c250', bg: '#e6fffb', done: !!activeCandidate.jobOfferUrl, visible: currentStageId >= 7 || !!activeCandidate.jobOfferUrl },
                ];
                const visibleStages = timelineStages.filter(s => s.visible);
                const COLS = 4;
                const stageRows: (typeof visibleStages)[] = [];
                for (let i = 0; i < visibleStages.length; i += COLS) {
                    stageRows.push(visibleStages.slice(i, i + COLS));
                }
                const CARD_W = 155;

                return (
                    <div>
                        <Divider orientation="left" style={{ margin: '16px 0 12px 0' }}>Acciones y Documentación</Divider>

                        <div style={{ padding: '8px 0' }}>
                            {stageRows.map((row, rowIdx) => {
                                const lastColCenter = ((row.length - 0.5) / COLS * 100);
                                const firstColCenter = (0.5 / COLS * 100);
                                const hasNextRow = rowIdx < stageRows.length - 1;

                                return (
                                    <React.Fragment key={rowIdx}>
                                        {/* ── Row of timeline nodes ── */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                                            position: 'relative',
                                        }}>
                                            {/* Horizontal connecting line behind all circles */}
                                            {row.length > 1 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '14px',
                                                    left: `calc(${firstColCenter}%)`,
                                                    right: `calc(${(100 - lastColCenter)}%)`,
                                                    height: '3px',
                                                    background: `linear-gradient(90deg, ${row[0].color}, ${row[row.length - 1].color})`,
                                                    zIndex: 0,
                                                }} />
                                            )}

                                            {row.map((stage) => (
                                                <div key={stage.key} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    position: 'relative',
                                                    zIndex: 1,
                                                }}>
                                                    {/* ● Stage number circle on the line */}
                                                    <div style={{
                                                        width: '30px', height: '30px', borderRadius: '50%',
                                                        background: stage.done ? stage.color : '#fff',
                                                        border: `3px solid ${stage.color}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: stage.done ? '#fff' : stage.color,
                                                        fontWeight: 700, fontSize: '13px',
                                                        boxShadow: `0 0 0 4px ${stage.color}20`,
                                                    }}>
                                                        {stage.stageNum}
                                                    </div>

                                                    {/* Thin connector down to card */}
                                                    <div style={{ width: '3px', height: '10px', background: stage.color, flexShrink: 0 }} />

                                                    {/* ▸ Card (fixed size, status inside) */}
                                                    <div
                                                        onClick={() => setActiveStageModal(stage.key)}
                                                        style={{
                                                            position: 'relative',
                                                            width: `${CARD_W}px`, padding: '10px 12px',
                                                            borderRadius: '10px',
                                                            border: `1.5px solid ${stage.borderColor}`,
                                                            background: stage.bg,
                                                            cursor: 'pointer',
                                                            transition: 'box-shadow 0.2s, transform 0.15s',
                                                            textAlign: 'center',
                                                            display: 'flex', flexDirection: 'column',
                                                            alignItems: 'center', gap: '5px',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 14px ${stage.color}30`;
                                                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                                            (e.currentTarget as HTMLElement).style.transform = 'none';
                                                        }}
                                                    >
                                                        {/* 3-dots button at top right */}
                                                        <MoreOutlined style={{ 
                                                            position: 'absolute', 
                                                            top: '6px', 
                                                            right: '6px', 
                                                            color: '#595959', 
                                                            fontSize: '18px', 
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            background: 'rgba(0,0,0,0.03)'
                                                        }} />
                                                        
                                                        <span style={{ color: stage.color, fontSize: '22px', lineHeight: 1 }}>{stage.icon}</span>
                                                        <Text strong style={{ fontSize: '11px', lineHeight: '1.3' }}>{stage.label}</Text>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            {stage.done
                                                                ? <CheckCircleFilled style={{ color: '#52c41a', fontSize: '13px' }} />
                                                                : <ClockCircleFilled style={{ color: '#faad14', fontSize: '13px' }} />
                                                            }
                                                            <Text style={{ fontSize: '10px', color: stage.done ? '#52c41a' : '#faad14' }}>
                                                                {stage.done ? 'Listo' : 'Pendiente'}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── Snake connector (S-curve between rows) ── */}
                                        {hasNextRow && (
                                            <div style={{ position: 'relative', height: '48px', margin: '6px 0' }}>
                                                {/* Vertical drop from last item of this row */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: `${lastColCenter}%`, top: 0,
                                                    width: '3px', height: '22px',
                                                    background: row[row.length - 1].color,
                                                    transform: 'translateX(-1.5px)',
                                                }} />
                                                {/* Horizontal sweep from right to left */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: `${firstColCenter}%`,
                                                    right: `${100 - lastColCenter}%`,
                                                    top: '22px', height: '3px',
                                                    background: `linear-gradient(90deg, ${stageRows[rowIdx + 1][0].color}, ${row[row.length - 1].color})`,
                                                }} />
                                                {/* Vertical drop to first item of next row */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: `${firstColCenter}%`, top: '22px',
                                                    width: '3px', height: '26px',
                                                    background: stageRows[rowIdx + 1][0].color,
                                                    transform: 'translateX(-1.5px)',
                                                }} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* WhatsApp button moved inside interview modals */}

                        {/* ===== STAGE ACTION MODALS ===== */}

                        {/* CV Modal */}
                        <Modal
                            title={<Space><FilePdfOutlined style={{ color: '#1890ff' }} /> <Text strong>Currículum Vitae (CV)</Text></Space>}
                            open={activeStageModal === 'cv'}
                            onCancel={() => setActiveStageModal(null)}
                            footer={null}
                            width={480}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {activeCandidate.cvUrl && (
                                        <Button icon={<FilePdfOutlined />} href={activeCandidate.cvUrl} target="_blank" type="dashed" size="small" style={{ flex: 1 }}>Ver CV</Button>
                                    )}
                                    <Upload accept=".pdf" showUploadList={false} customRequest={(info) => handleInterviewUpload(info, 'CV')} style={{ flex: 1, display: 'flex' }}>
                                        <Button block size="small" icon={<UploadOutlined />} loading={uploadingType === 'CV'}>{activeCandidate.cvUrl ? 'Actualizar' : 'Subir'} CV</Button>
                                    </Upload>
                                </div>
                                <Button block size="small" icon={<MailOutlined />} loading={submitting} disabled={resendCVSuccess}
                                    style={{ backgroundColor: resendCVSuccess ? undefined : '#1890ff20', borderColor: '#1890ff', color: '#1890ff' }}
                                    onClick={() => { Modal.confirm({ title: '¿Enviar recordatorio de CV?', content: 'Se enviará un correo al candidato solicitándole que cargue su CV actualizado.', okText: 'Enviar Recordatorio', cancelText: 'Cancelar', onOk: async () => { await handleAction(() => adminCandidateService.resendDocumentationRequest(activeCandidate.id, 'CV')); setResendCVSuccess(true); } }); }}
                                >{resendCVSuccess ? 'Recordatorio Enviado ✓' : 'Resolicitar CV'}</Button>
                            </Space>
                        </Modal>

                        {/* Video Modal */}
                        <Modal
                            title={<Space><VideoCameraOutlined style={{ color: '#722ed1' }} /> <Text strong>Video de Presentación</Text></Space>}
                            open={activeStageModal === 'video'}
                            onCancel={() => setActiveStageModal(null)}
                            footer={null}
                            width={480}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {activeCandidate.videoUrl && (
                                        <Button icon={<VideoCameraOutlined />} href={activeCandidate.videoUrl} target="_blank" type="dashed" size="small" style={{ flex: 1 }}>Ver Video</Button>
                                    )}
                                    <Upload accept="video/*" showUploadList={false} customRequest={(info) => handleInterviewUpload(info, 'Video')} style={{ flex: 1, display: 'flex' }}>
                                        <Button block size="small" icon={<UploadOutlined />} loading={uploadingType === 'Video'}>{activeCandidate.videoUrl ? 'Actualizar' : 'Subir'} Video</Button>
                                    </Upload>
                                </div>
                                <Button block size="small" icon={<MailOutlined />} loading={submitting} disabled={resendVideoSuccess}
                                    style={{ backgroundColor: resendVideoSuccess ? undefined : '#722ed120', borderColor: '#722ed1', color: '#722ed1' }}
                                    onClick={() => { Modal.confirm({ title: '¿Enviar recordatorio de Video?', content: 'Se enviará un correo al candidato con las pautas para cargar su video de presentación.', okText: 'Enviar Recordatorio', cancelText: 'Cancelar', onOk: async () => { await handleAction(() => adminCandidateService.resendDocumentationRequest(activeCandidate.id, 'Video')); setResendVideoSuccess(true); } }); }}
                                >{resendVideoSuccess ? 'Recordatorio Enviado ✓' : 'Resolicitar Video'}</Button>
                            </Space>
                        </Modal>

                        {/* PsychTest Modal */}
                        <Modal
                            title={<Space><BulbOutlined style={{ color: '#faad14' }} /> <Text strong>Prueba Psicotécnica</Text></Space>}
                            open={activeStageModal === 'psychtest'}
                            onCancel={() => setActiveStageModal(null)}
                            footer={null}
                            width={480}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {activeCandidate.psychTestUrl && (
                                        <Button icon={<FilePdfOutlined />} href={activeCandidate.psychTestUrl} target="_blank" type="dashed" size="small" style={{ flex: 1 }}>Ver Resultados</Button>
                                    )}
                                    <Upload accept=".pdf" showUploadList={false} customRequest={handlePsychTestUpload} style={{ flex: 1, display: 'flex' }}>
                                        <Button block size="small" icon={<UploadOutlined />} loading={uploadingType === 'PsychTest'}>{activeCandidate.psychTestUrl ? 'Actualizar' : 'Subir'} Resultados</Button>
                                    </Upload>
                                </div>
                                <Button block size="small" icon={<MailOutlined />} loading={submitting} disabled={resendPsychSuccess}
                                    style={{ backgroundColor: resendPsychSuccess ? undefined : '#faad1420', borderColor: '#faad14', color: '#faad14' }}
                                    onClick={() => { Modal.confirm({ title: '¿Enviar recordatorio de prueba psicotécnica?', content: 'Se enviará un correo al candidato recordándole que tiene pendiente la prueba psicotécnica.', okText: 'Enviar Recordatorio', cancelText: 'Cancelar', onOk: async () => { await handleAction(() => adminCandidateService.resendDocumentationRequest(activeCandidate.id, 'PsychTest')); setResendPsychSuccess(true); } }); }}
                                >{resendPsychSuccess ? 'Recordatorio Enviado ✓' : 'Resolicitar Prueba'}</Button>
                            </Space>
                        </Modal>

                        {/* Personal Interview Modal */}
                        <Modal
                            title={<Space><CalendarOutlined style={{ color: '#13c2c2' }} /> <Text strong>Entrevista Personal</Text></Space>}
                            open={activeStageModal === 'personal'}
                            onCancel={() => setActiveStageModal(null)}
                            footer={null}
                            width={480}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: '12px' }} type="secondary">Fecha Agendada:</Text>
                                    <DatePicker size="small" placeholder="Seleccionar fecha" value={activeCandidate.personalInterviewDate ? dayjs(activeCandidate.personalInterviewDate) : null} onChange={(date) => handleUpdateInterviewDate(date, 'Personal')} format="DD/MM/YYYY" style={{ width: '160px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {activeCandidate.personalInterviewUrl && (
                                        <Button icon={<FilePdfOutlined />} href={activeCandidate.personalInterviewUrl} target="_blank" type="dashed" size="small" style={{ flex: 1 }}>Ver Resumen</Button>
                                    )}
                                    <Upload accept=".pdf" showUploadList={false} customRequest={(info) => handleInterviewUpload(info, 'PersonalInterview')} style={{ flex: 1, display: 'flex' }}>
                                        <Button block size="small" icon={<UploadOutlined />} loading={uploadingType === 'PersonalInterview'}>{activeCandidate.personalInterviewUrl ? 'Actualizar' : 'Subir'} Resumen</Button>
                                    </Upload>
                                </div>
                                <Button
                                    block type="primary" icon={<WhatsAppOutlined />}
                                    style={{ backgroundColor: '#25D366', borderColor: '#25D366', height: '32px', borderRadius: '6px', marginTop: '4px' }}
                                    href={`https://wa.me/${formatWhatsAppPhone(activeCandidate.phone)}?text=${encodeURIComponent(getWhatsAppMessage(activeCandidate))}`}
                                    target="_blank" rel="noreferrer"
                                >
                                    Agendar entrevista por WhatsApp
                                </Button>
                            </Space>
                        </Modal>

                        {/* Technical Interview Modal */}
                        <Modal
                            title={<Space><CalendarOutlined style={{ color: '#2f54eb' }} /> <Text strong>Entrevista Técnica</Text></Space>}
                            open={activeStageModal === 'technical'}
                            onCancel={() => setActiveStageModal(null)}
                            footer={null}
                            width={480}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: '12px' }} type="secondary">Fecha Agendada:</Text>
                                    <DatePicker size="small" placeholder="Seleccionar fecha" value={activeCandidate.technicalInterviewDate ? dayjs(activeCandidate.technicalInterviewDate) : null} onChange={(date) => handleUpdateInterviewDate(date, 'Technical')} format="DD/MM/YYYY" style={{ width: '160px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {activeCandidate.technicalInterviewUrl && (
                                        <Button icon={<FilePdfOutlined />} href={activeCandidate.technicalInterviewUrl} target="_blank" type="dashed" size="small" style={{ flex: 1 }}>Ver Resumen</Button>
                                    )}
                                    <Upload accept=".pdf" showUploadList={false} customRequest={(info) => handleInterviewUpload(info, 'TechnicalInterview')} style={{ flex: 1, display: 'flex' }}>
                                        <Button block size="small" icon={<UploadOutlined />} loading={uploadingType === 'TechnicalInterview'}>{activeCandidate.technicalInterviewUrl ? 'Actualizar' : 'Subir'} Resumen</Button>
                                    </Upload>
                                </div>
                                <Button
                                    block type="primary" icon={<WhatsAppOutlined />}
                                    style={{ backgroundColor: '#25D366', borderColor: '#25D366', height: '32px', borderRadius: '6px', marginTop: '4px' }}
                                    href={`https://wa.me/${formatWhatsAppPhone(activeCandidate.phone)}?text=${encodeURIComponent(getWhatsAppMessage(activeCandidate))}`}
                                    target="_blank" rel="noreferrer"
                                >
                                    Agendar entrevista por WhatsApp
                                </Button>
                            </Space>
                        </Modal>

                        {/* Medical Checkup Modal */}
                        <Modal
                            title={<Space><TeamOutlined style={{ color: '#52c41a' }} /> <Text strong>Pruebas Médicas/AP/Ref</Text></Space>}
                            open={activeStageModal === 'medical'}
                            onCancel={() => setActiveStageModal(null)}
                            footer={null}
                            width={480}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {activeCandidate.medicalCheckupUrl && (
                                        <Button icon={<FilePdfOutlined />} href={activeCandidate.medicalCheckupUrl} target="_blank" type="dashed" size="small" style={{ flex: 1 }}>Ver Resultados</Button>
                                    )}
                                    <Upload accept=".pdf" showUploadList={false} customRequest={(info) => handleInterviewUpload(info, 'MedicalCheckup')} style={{ flex: 1, display: 'flex' }}>
                                        <Button block size="small" icon={<UploadOutlined />} loading={uploadingType === 'MedicalCheckup'}>{activeCandidate.medicalCheckupUrl ? 'Actualizar' : 'Subir'} Resultados</Button>
                                    </Upload>
                                </div>
                            </Space>
                        </Modal>

                        {/* Job Offer Modal */}
                        <Modal
                            title={<Space><SaveOutlined style={{ color: '#13c2c2' }} /> <Text strong>Oferta Laboral</Text></Space>}
                            open={activeStageModal === 'joboffer'}
                            onCancel={() => setActiveStageModal(null)}
                            footer={null}
                            width={480}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {activeCandidate.jobOfferUrl && (
                                        <Button icon={<FilePdfOutlined />} href={activeCandidate.jobOfferUrl} target="_blank" type="dashed" size="small" style={{ flex: 1 }}>Ver Oferta</Button>
                                    )}
                                    <Upload accept=".pdf" showUploadList={false} customRequest={(info) => handleInterviewUpload(info, 'JobOffer')} style={{ flex: 1, display: 'flex' }}>
                                        <Button block size="small" icon={<UploadOutlined />} loading={uploadingType === 'JobOffer'}>{activeCandidate.jobOfferUrl ? 'Actualizar' : 'Subir'} Oferta</Button>
                                    </Upload>
                                </div>
                            </Space>
                        </Modal>
                    </div>
                );
            })()}

            {activeCandidate.rejectionReason && (
                <div style={{ marginTop: 24, padding: 12, background: '#fff1f0', borderRadius: 8, border: '1px solid #ffa39e' }}>
                    <Text type="danger" strong>Motivo de Rechazo:</Text>
                    <div style={{ marginTop: 4 }}>{activeCandidate.rejectionReason}</div>
                </div>
            )}

            <Divider orientation="left">Notas y Seguimiento</Divider>

            <div style={{ marginBottom: '12px', padding: '0 4px' }}>
                <Space align="center" style={{ 
                    background: '#f9f0ff', 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    border: '1px solid #d3adf7'
                }}>
                    <HistoryOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
                    <Text strong style={{ color: '#531dab', fontSize: '13px' }}>
                        Historial: <Text style={{ color: '#722ed1', fontSize: '15px' }}>{activeCandidate.applications?.length || 0}</Text> { (activeCandidate.applications?.length || 0) === 1 ? 'postulación' : 'postulaciones' } en total
                    </Text>
                </Space>
            </div>

            <Collapse
                ghost
                defaultActiveKey={['0']}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                className="application-history-collapse"
            >
                {(activeCandidate.applications || []).map((app: any, appIndex: number) => {
                    const isCurrent = appIndex === 0;
                    const appLogs = (app.logs || []).filter((log: any) => log.comment);
                    const jobTitle = app.administrativeRequisition?.title || 'Vacante no especificada';
                    const startDate = dayjs(app.createdAt).format('DD/MM/YYYY');

                    return (
                        <Collapse.Panel
                            header={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '10px' }}>
                                    <Space direction="vertical" size={0}>
                                        <Text strong style={{ color: isCurrent ? '#2b457c' : '#595959', fontSize: isCurrent ? '14px' : '13px' }}>
                                            {isCurrent ? `Postulación Actual: ${jobTitle}` : `Postulación Anterior: ${jobTitle}`}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>Iniciada el {startDate}</Text>
                                    </Space>
                                    <Tag color={app.status === 'HIRED' ? 'green' : app.status === 'REJECTED' ? 'red' : 'blue'}>
                                        {app.status === 'ACTIVE' ? (app.subStatus || 'En Proceso') : (STATUS_TRANSLATIONS[app.status] || app.status)}
                                    </Tag>
                                </div>
                            }
                            key={appIndex}
                            style={{
                                marginBottom: '12px',
                                background: isCurrent ? '#ffffff' : '#f5f5f5',
                                borderRadius: '12px',
                                border: isCurrent ? '1px solid #2b457c30' : '1px solid #d9d9d960',
                                overflow: 'hidden',
                                boxShadow: isCurrent ? '0 2px 8px rgba(43, 69, 124, 0.05)' : 'none'
                            }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={16}>
                                <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '4px 8px' }}>
                                    {appLogs.map((log: any, logIndex: number) => (
                                        <div key={log.id || logIndex} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: logIndex === appLogs.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                                <Text strong style={{ fontSize: '12px', color: '#2b457c' }}>{log.subStatus || 'Nota'}</Text>
                                                <Text type="secondary" style={{ fontSize: '10px' }}>{dayjs(log.createdAt).format('DD/MM/YYYY hh:mm A')}</Text>
                                            </div>
                                            <div style={{ padding: '8px 12px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '3px solid #d9d9d9' }}>
                                                <Paragraph style={{ margin: 0, fontSize: '13px', color: '#434343' }}>{log.comment}</Paragraph>
                                            </div>
                                        </div>
                                    ))}
                                    {appLogs.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                            <Text type="secondary" italic>No hay notas o registros para esta postulación.</Text>
                                        </div>
                                    )}
                                </div>

                                {isCurrent && (
                                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                                        <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                            <Input.TextArea
                                                placeholder="Agregar una nota interna para esta postulación..."
                                                rows={2}
                                                value={noteComment}
                                                onChange={e => setNoteComment(e.target.value)}
                                                style={{ borderRadius: '8px', border: '1px solid #d9d9d9' }}
                                            />
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                loading={submitting}
                                                onClick={handleAddNote}
                                                block
                                                style={{ height: '36px', borderRadius: '8px', fontWeight: 500 }}
                                            >
                                                Agregar Nota
                                            </Button>
                                        </Space>
                                    </div>
                                )}
                            </Space>
                        </Collapse.Panel>
                    );
                })}
            </Collapse>

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
