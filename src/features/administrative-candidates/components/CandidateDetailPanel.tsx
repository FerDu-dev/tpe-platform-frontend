import React, { useState, useEffect } from 'react';
import { Typography, Descriptions, Tag, Button, Space, Divider, message, Timeline, Modal, Select, Avatar, Card, Form, Input, InputNumber, Switch, DatePicker } from 'antd';
import {
    FilePdfOutlined,
    VideoCameraOutlined,
    ArrowRightOutlined,
    HistoryOutlined,
    UserOutlined,
    WhatsAppOutlined,
    CloseOutlined,
    CloseCircleOutlined,
    EditOutlined
} from '@ant-design/icons';
import PermissionGuard from '../../../components/PermissionGuard';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import type { Candidate, AdministrativeRequisition } from '../../../types';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loadCandidateById, selectSelectedCandidate } from '../store/adminCandidatesSlice';
import { selectStages } from '../../../store/workflowSlice';
import { adminCandidateService, STAGE_COLORS } from '../../../services/adminCandidateService';
import { administrativeRequisitionService } from '../../../services/administrativeRequisitionService';

const { Title, Text } = Typography;
const { Option } = Select;

interface CandidateDetailPanelProps {
    candidate: Candidate;
    onClose: () => void;
}

const formatWhatsAppPhone = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (!cleaned.startsWith('58')) cleaned = '58' + cleaned;
    return cleaned;
};

const getWhatsAppMessage = (candidate: any) => {
    const firstName = candidate.firstName || 'Candidato';
    const currentApp = candidate.applications?.[0];
    const stageId = currentApp?.currentStageId;
    
    switch (stageId) {
        case 2: return `Hola 👋 te saluda el equipo de captación de Grupo Mayoreo.\n¡Felicidades! 🙌 Ya estás participando en el proceso de selección.\nAhora queremos conocerte mejor 🎥\nNotamos que aún no hemos recibido tu video.\nPuedes subirlo en tu portal o, si prefieres, enviarlo por aquí 👍\nNo pierdas esta oportunidad de avanzar en el proceso 🚀\n¡Feliz día!`;
        case 3: return `Hola 👋 te saluda el equipo de captación de Grupo Mayoreo.\nTe enviamos las pruebas psicotécnicas a tu correo. También puedes acceder a ellas desde tu portal.\nEstamos a la espera de que las completes para poder continuar con tu proceso.\n🚀 Estás cada vez más cerca.\n¡Feliz día!`;
        case 4:
        case 5: return `Hola 👋 te saluda el equipo de Grupo Mayoreo.\n¡Felicidades! Superaste las pruebas psicotécnicas y sigues avanzando en el proceso.\nNos encantaría invitarte a tu entrevista personal para seguir conociéndote.\n🚀 Estás cada vez más cerca.\nCuéntanos tu disponibilidad y la coordinamos.`;
        default: return `Hola 👋 *${firstName}*, te saluda el equipo de captación de Grupo Mayoreo. ¡Felicidades! 🙌 Ya estás participando en el proceso de selección.`;
    }
};

const CandidateDetailPanel: React.FC<CandidateDetailPanelProps> = ({ candidate, onClose }) => {
    const dispatch = useAppDispatch();
    const stages = useAppSelector(selectStages);
    const richCandidate = useAppSelector(selectSelectedCandidate);
    const activeCandidate = (richCandidate && richCandidate.id === candidate?.id) ? richCandidate : candidate;

    const [loading, setLoading] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [requisitions, setRequisitions] = useState<AdministrativeRequisition[]>([]);
    const [loadingRequisitions, setLoadingRequisitions] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (candidate?.id) {
            dispatch(loadCandidateById(candidate.id));
        }
    }, [candidate?.id, dispatch]);

    useEffect(() => {
        setLoadingRequisitions(true);
        const reqType = activeCandidate?.category === 'INTERNSHIP' ? 'Pasantía' : 'Profesional';
        administrativeRequisitionService.fetchRequisitions({ limit: 5, status: 'OPEN', type: reqType })
            .then(res => setRequisitions(res.data))
            .catch(() => message.error('Error al cargar vacantes'))
            .finally(() => setLoadingRequisitions(false));
    }, [activeCandidate?.category]);

    const handleRequisitionChange = async (requisitionId: number) => {
        if (!activeCandidate) return;
        setLoading(true);
        try {
            await adminCandidateService.updateApplicationRequisition(activeCandidate.id, requisitionId);
            message.success('Vacante actualizada');
            dispatch(loadCandidateById(activeCandidate.id));
        } catch (error: any) {
            message.error('Error al actualizar vacante');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSave = async () => {
        try {
            const values = await form.validateFields();
            if (values.academicPeriodStart) {
                values.academicPeriodStart = values.academicPeriodStart.toISOString();
            }
            setLoading(true);
            await adminCandidateService.updateCandidate(activeCandidate.id, values);
            message.success('Candidato actualizado');
            dispatch(loadCandidateById(activeCandidate.id));
            setEditModalOpen(false);
        } catch (error) {
            console.error(error);
            message.error('Error al actualizar candidato');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = () => {
        form.setFieldsValue({
            ...activeCandidate,
            academicPeriodStart: activeCandidate.academicPeriodStart ? dayjs(activeCandidate.academicPeriodStart) : null,
        });
        setEditModalOpen(true);
    };

    const currentApp = activeCandidate.applications?.[0];
    const currentStageId = currentApp?.currentStageId;
    const currentStepIndex = stages.findIndex(s => s.id === currentStageId);
    const isIntern = activeCandidate.category === 'INTERNSHIP';

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card
                title={
                    <Space>
                        <UserOutlined style={{ color: '#2b457c' }} />
                        <span>Detalle de Candidato</span>
                    </Space>
                }
                extra={
                    <Space>
                        <Button type="text" icon={<EditOutlined />} onClick={openEditModal} title="Editar Candidato" />
                        <Button type="text" onClick={onClose} icon={<CloseOutlined />} />
                    </Space>
                }
                style={{ borderRadius: '12px', border: '1px solid #e6f7ff', background: '#fafcff' }}
                bodyStyle={{ padding: '16px' }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <Avatar size={64} style={{ backgroundColor: '#2b457c', marginBottom: 12 }}>
                            {activeCandidate.firstName?.[0]}
                        </Avatar>
                        <Title level={4} style={{ margin: 0 }}>{activeCandidate.firstName} {activeCandidate.lastName}</Title>
                        <Tag color={isIntern ? 'purple' : 'geekblue'} style={{ marginTop: '8px', fontWeight: 600 }}>
                            {isIntern ? 'Pasante' : 'Administrador'}
                        </Tag>
                        <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>{activeCandidate.profession || 'Sin profesión especificada'}</Text>
                        <div style={{ marginTop: 8 }}>
                            <Tag color={currentStageId ? STAGE_COLORS[currentStageId] : 'blue'}>
                                {activeCandidate.currentStageName || 'Postulado'}
                            </Tag>
                        </div>
                    </div>

                    <div style={{ background: '#f0f2f5', padding: '12px', borderRadius: '12px' }}>
                        <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Vacante Asignada</Text>
                        <div style={{ marginTop: 8 }}>
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Asignar vacante..."
                                loading={loadingRequisitions}
                                value={currentApp?.administrativeRequisitionId}
                                onChange={handleRequisitionChange}
                                options={requisitions.map(r => ({
                                    value: r.id,
                                    label: `${r.position || 'Sin cargo'} (${r.type || 'N/A'}) - ${r.company}`
                                }))}
                            />
                        </div>
                    </div>

                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Cédula">{activeCandidate.nationalId}</Descriptions.Item>
                        <Descriptions.Item label="Email">{activeCandidate.email}</Descriptions.Item>
                        <Descriptions.Item label="Teléfono">{activeCandidate.phone}</Descriptions.Item>
                        <Descriptions.Item label="Nivel Educativo">{activeCandidate.educationLevel || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Profesión">{activeCandidate.profession || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Nivel de Inglés">{activeCandidate.englishLevel || 'N/A'}</Descriptions.Item>
                        
                        {isIntern ? (
                            <>
                                <Descriptions.Item label="Inicio Período">{activeCandidate.academicPeriodStart ? dayjs(activeCandidate.academicPeriodStart).format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Nivel Estudio Actual">{activeCandidate.currentStudyLevel || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Modalidad">{activeCandidate.studyModality || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Turno">{activeCandidate.classShift || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="¿Pasantía Obligatoria?">{activeCandidate.isInternshipMandatory ? 'Sí' : 'No'}</Descriptions.Item>
                                <Descriptions.Item label="Horas Pasantía">{activeCandidate.internshipHours || 'N/A'}</Descriptions.Item>
                            </>
                        ) : (
                            <>
                                <Descriptions.Item label="Años Experiencia">{activeCandidate.yearsOfExperience || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Áreas Trabajo">{activeCandidate.areasOfWork || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="¿Trabaja Actualmente?">{activeCandidate.isWorkingNow ? 'Sí' : 'No'}</Descriptions.Item>
                                <Descriptions.Item label="Empresa/Cargo Actual">{activeCandidate.currentCompanyAndPosition || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Disponibilidad">{activeCandidate.availability || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Horario Preferido">{activeCandidate.preferredSchedule || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Ingreso Actual">${activeCandidate.currentIncome || 0}</Descriptions.Item>
                                <Descriptions.Item label="Ingreso Esperado">${activeCandidate.expectedIncome || 0}</Descriptions.Item>
                            </>
                        )}
                        
                        {activeCandidate.adminReferences && activeCandidate.adminReferences.length > 0 && (
                            <Descriptions.Item label="Referencias">
                                {activeCandidate.adminReferences.map((ref: any, idx: number) => (
                                    <div key={idx} style={{ marginBottom: 4 }}>
                                        <Text strong>{ref.name}</Text> - {ref.company} ({ref.phone})
                                    </div>
                                ))}
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {activeCandidate.cvUrl && (
                            <Button icon={<FilePdfOutlined />} href={activeCandidate.cvUrl} target="_blank" size="small">CV</Button>
                        )}
                        {activeCandidate.videoUrl && (
                            <Button icon={<VideoCameraOutlined />} href={activeCandidate.videoUrl} target="_blank" size="small">Video</Button>
                        )}
                        <Button icon={<WhatsAppOutlined />} href={`https://wa.me/${formatWhatsAppPhone(activeCandidate.phone)}?text=${encodeURIComponent(getWhatsAppMessage(activeCandidate))}`} target="_blank" size="small" style={{ color: '#25D366' }}>WhatsApp</Button>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <PermissionGuard module="adminCandidates" action="advance">
                            <Button 
                                type="primary" 
                                icon={<ArrowRightOutlined />} 
                                block 
                                style={{ background: '#2b457c', borderColor: '#2b457c' }}
                                disabled={currentStepIndex >= stages.length - 1}
                                loading={loading}
                            >
                                Avanzar
                            </Button>
                        </PermissionGuard>
                        <PermissionGuard module="adminCandidates" action="reject">
                            <Button 
                                danger 
                                icon={<CloseCircleOutlined />} 
                                block
                            >
                                Rechazar
                            </Button>
                        </PermissionGuard>
                    </div>
                    
                    <Button block icon={<HistoryOutlined />} onClick={() => setHistoryModalOpen(true)}>
                        Ver Historial Completo
                    </Button>
                </Space>
            </Card>

            <Modal
                title="Historial de Proceso"
                open={historyModalOpen}
                onCancel={() => setHistoryModalOpen(false)}
                footer={null}
            >
                <Timeline
                    items={(currentApp?.logs || []).map((log: any) => ({
                        children: (
                            <div>
                                <Text strong>{log.subStatus || 'Cambio de Etapa'}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                                {log.comment && <p style={{ margin: '4px 0 0' }}>{log.comment}</p>}
                            </div>
                        )
                    }))}
                />
            </Modal>

            <Modal
                title={`Editar Candidato ${isIntern ? 'Pasante' : 'Administrador'}`}
                open={editModalOpen}
                onCancel={() => setEditModalOpen(false)}
                onOk={handleEditSave}
                confirmLoading={loading}
                width={600}
                destroyOnClose
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <Form.Item label="Nombre" name="firstName" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Apellido" name="lastName" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Teléfono" name="phone" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Nivel Educativo" name="educationLevel">
                            <Input />
                        </Form.Item>
                        <Form.Item label="Profesión" name="profession">
                            <Input />
                        </Form.Item>
                        <Form.Item label="Nivel de Inglés" name="englishLevel">
                            <Select>
                                <Option value="Básico">Básico</Option>
                                <Option value="Medio">Medio</Option>
                                <Option value="Avanzado">Avanzado</Option>
                                <Option value="Nativo">Nativo</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {isIntern ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                            <Form.Item label="Inicio Período Académico" name="academicPeriodStart">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                            <Form.Item label="Nivel Estudio Actual" name="currentStudyLevel">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Modalidad" name="studyModality">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Turno" name="classShift">
                                <Input />
                            </Form.Item>
                            <Form.Item label="¿Pasantía Obligatoria?" name="isInternshipMandatory" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Form.Item label="Horas Pasantía" name="internshipHours">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                            <Form.Item label="Años Experiencia" name="yearsOfExperience">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Áreas de Trabajo" name="areasOfWork">
                                <Input />
                            </Form.Item>
                            <Form.Item label="¿Trabaja Actualmente?" name="isWorkingNow" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Form.Item label="Empresa/Cargo Actual" name="currentCompanyAndPosition">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Disponibilidad" name="availability">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Horario Preferido" name="preferredSchedule">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Ingreso Actual" name="currentIncome">
                                <InputNumber style={{ width: '100%' }} prefix="$" />
                            </Form.Item>
                            <Form.Item label="Ingreso Esperado" name="expectedIncome">
                                <InputNumber style={{ width: '100%' }} prefix="$" />
                            </Form.Item>
                        </div>
                    )}
                </Form>
            </Modal>
        </motion.div>
    );
};

export default CandidateDetailPanel;
