import React, { useState, useEffect } from 'react';
import { Typography, Descriptions, Tag, Button, Space, Divider, message, Timeline, Modal, Select, Avatar, Card } from 'antd';
import {
    FilePdfOutlined,
    VideoCameraOutlined,
    ArrowRightOutlined,
    HistoryOutlined,
    UserOutlined,
    WhatsAppOutlined,
    CloseOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import PermissionGuard from '../../../components/PermissionGuard';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import type { Candidate, Requisition } from '../../../types';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loadCandidateById, selectSelectedCandidate } from '../store/candidatesSlice';
import { selectStages } from '../../../store/workflowSlice';
import { candidateService, STAGE_COLORS } from '../../../services/candidateService';
import { requisitionService } from '../../../services/requisitionService';

const { Title, Text } = Typography;

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
        case 2: return `Hola 👋 te saluda el equipo de captación de Grupo Mayoreo.\n¡Felicidades! 🙌 Ya estás participando en el proceso de selección para ser parte de la Fuerza de Ventas más grande del País.\nAhora queremos conocerte mejor 🎥\nNotamos que aún no hemos recibido tu video.\nPuedes subirlo en tu portal o, si prefieres, enviarlo por aquí 👍\nNo pierdas esta oportunidad de avanzar en el proceso 🚀\n¡Feliz día!`;
        case 3: return `Hola 👋 te saluda el equipo de captación de Grupo Mayoreo.\nTe enviamos las pruebas psicotécnicas a tu correo. También puedes acceder a ellas desde tu portal.\nEstamos a la espera de que las completes para poder continuar con tu proceso.\n🚀 Estás cada vez más cerca de formar parte de una de las fuerzas de ventas más importantes del país.\n¡Feliz día!`;
        case 4:
        case 5: return `Hola 👋 te saluda el equipo de Grupo Mayoreo.\n¡Felicidades! Superaste las pruebas psicotécnicas y sigues avanzando en el proceso.\nNos encantaría invitarte a tu entrevista personal para seguir conociéndote.\n🚀 Estás cada vez más cerca de formar parte de la fuerza de ventas más importante del país.\nCuéntanos tu disponibilidad y la coordinamos.`;
        default: return `Hola 👋 *${firstName}*, te saluda el equipo de captación de Grupo Mayoreo. ¡Felicidades! 🙌 Ya estás participando en el proceso de selección de la fuerza de ventas más grande del país.`;
    }
};

const CandidateDetailPanel: React.FC<CandidateDetailPanelProps> = ({ candidate, onClose }) => {
    const dispatch = useAppDispatch();
    const stages = useAppSelector(selectStages);
    const richCandidate = useAppSelector(selectSelectedCandidate);
    const activeCandidate = (richCandidate && richCandidate.id === candidate?.id) ? richCandidate : candidate;

    const [loading, setLoading] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [loadingRequisitions, setLoadingRequisitions] = useState(false);

    useEffect(() => {
        if (candidate?.id) {
            dispatch(loadCandidateById(candidate.id));
        }
    }, [candidate?.id, dispatch]);

    useEffect(() => {
        setLoadingRequisitions(true);
        requisitionService.fetchRequisitions({ limit: 5, status: 'OPEN' })
            .then(res => setRequisitions(res.data))
            .catch(() => message.error('Error al cargar vacantes'))
            .finally(() => setLoadingRequisitions(false));
    }, []);

    const handleRequisitionChange = async (requisitionId: number) => {
        if (!activeCandidate) return;
        setLoading(true);
        try {
            await candidateService.updateApplicationRequisition(activeCandidate.id, requisitionId);
            message.success('Vacante actualizada');
            dispatch(loadCandidateById(activeCandidate.id));
        } catch (error: any) {
            message.error('Error al actualizar vacante');
        } finally {
            setLoading(false);
        }
    };

    const currentApp = activeCandidate.applications?.[0];
    const currentStageId = currentApp?.currentStageId;
    const currentStepIndex = stages.findIndex(s => s.id === currentStageId);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card
                title={
                    <Space>
                        <UserOutlined style={{ color: '#2b457c' }} />
                        <span>Detalle de Candidato</span>
                    </Space>
                }
                extra={<Button type="text" onClick={onClose} icon={<CloseOutlined />} size="small" />}
                style={{ borderRadius: '12px', border: '1px solid #e6f7ff', background: '#fafcff' }}
                bodyStyle={{ padding: '16px' }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <Avatar size={64} style={{ backgroundColor: '#2b457c', marginBottom: 12 }}>
                            {activeCandidate.firstName?.[0]}
                        </Avatar>
                        <Title level={4} style={{ margin: 0 }}>{activeCandidate.firstName} {activeCandidate.lastName}</Title>
                        <Text type="secondary">{activeCandidate.profession || 'Sin profesión especificada'}</Text>
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
                                value={currentApp?.jobRequisitionId}
                                onChange={handleRequisitionChange}
                                options={requisitions.map(r => ({
                                    value: r.id,
                                    label: `${r.title} - ${r.company}`
                                }))}
                            />
                        </div>
                    </div>

                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Cédula">{activeCandidate.nationalId}</Descriptions.Item>
                        <Descriptions.Item label="Email">{activeCandidate.email}</Descriptions.Item>
                        <Descriptions.Item label="Teléfono">{activeCandidate.phone}</Descriptions.Item>
                        <Descriptions.Item label="Ubicación">
                            {activeCandidate.municipality?.name || 'N/A'}
                        </Descriptions.Item>
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
                                    <PermissionGuard module="candidates" action="advance">
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
                                    <PermissionGuard module="candidates" action="reject">
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

            {/* History Modal (Simplified version for now) */}
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
        </motion.div>
    );
};

export default CandidateDetailPanel;
