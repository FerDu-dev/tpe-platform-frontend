import React, { useState } from 'react';
import { Drawer, Typography, Descriptions, Tag, Button, Space, Divider, Steps, message, Timeline, Modal, Input, DatePicker } from 'antd';
import {
    FilePdfOutlined,
    VideoCameraOutlined,
    CloseCircleOutlined,
    ArrowRightOutlined,
    HistoryOutlined,
    FolderOpenOutlined,
} from '@ant-design/icons';
import type { Candidate, KanbanStage } from '../../../types';
import { useAppDispatch } from '../../../app/store';
import { loadCandidates } from '../store/candidatesSlice';
import { candidateService } from '../../../services/candidateService';

const { Title, Text } = Typography;
const { Step } = Steps;

interface CandidateDrawerProps {
    open: boolean;
    onClose: () => void;
    candidate: Candidate | null;
}

const CandidateDrawer: React.FC<CandidateDrawerProps> = ({ open, onClose, candidate }) => {
    const dispatch = useAppDispatch();
    const [submitting, setSubmitting] = useState(false);

    if (!candidate) return null;

    const stages: KanbanStage[] = ['applied', 'eligible', 'psychotechnical', 'interview', 'decision'];
    const currentStepIndex = stages.indexOf(candidate.stage || 'applied');

    const handleAction = async (action: () => Promise<any>) => {
        setSubmitting(true);
        try {
            await action();
            dispatch(loadCandidates({}));
            onClose();
        } catch (error: any) {
            message.error(error.message || 'Error al procesar la acción');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdvance = () => {
        const nextStage = stages[currentStepIndex + 1];
        if (!nextStage) return;

        if (nextStage === 'psychotechnical') {
            Modal.confirm({
                title: 'Mover a Prueba Psicotécnica',
                content: (
                    <div style={{ marginTop: 16 }}>
                        <Text>Ingresa el link de la prueba para el candidato:</Text>
                        <Input id="test-link-input" placeholder="https://..." style={{ marginTop: 8 }} />
                    </div>
                ),
                onOk: async () => {
                    const link = (document.getElementById('test-link-input') as HTMLInputElement).value;
                    if (!link) return message.error('El link es obligatorio');
                    await handleAction(() => candidateService.updateCandidateStage(candidate.id, 'psychotechnical', { testLink: link }));
                }
            });
            return;
        }

        if (nextStage === 'interview') {
            Modal.confirm({
                title: 'Mover a Entrevista',
                content: (
                    <div style={{ marginTop: 16 }}>
                        <Text>Ingresa la fecha y hora de la entrevista:</Text>
                        <DatePicker showTime style={{ width: '100%', marginTop: 8 }} onChange={(val) => (window as any)._interviewDate = val?.toISOString()} />
                    </div>
                ),
                onOk: async () => {
                    const date = (window as any)._interviewDate;
                    if (!date) return message.error('La fecha es obligatoria');
                    await handleAction(() => candidateService.updateCandidateStage(candidate.id, 'interview', { comment: `Entrevista agendada para ${date} ` }));
                }
            });
            return;
        }

        handleAction(() => candidateService.updateCandidateStage(candidate.id, nextStage));
    };

    const handleReject = () => {
        Modal.confirm({
            title: 'Rechazar Candidato',
            content: (
                <div style={{ marginTop: 16 }}>
                    <Text>Indica el motivo del rechazo:</Text>
                    <Input.TextArea id="reject-reason-input" rows={3} style={{ marginTop: 8 }} />
                </div>
            ),
            onOk: async () => {
                const reason = (document.getElementById('reject-reason-input') as HTMLTextAreaElement).value;
                if (!reason) return message.error('El motivo es obligatorio');
                await handleAction(async () => { await candidateService.rejectCandidate(candidate.id, reason); });
            }
        });
    };

    const handleRescue = () => {
        handleAction(async () => { await candidateService.updateCandidateStage(candidate.id, 'applied', { comment: 'Candidato rescatado manualmente' }); });
    };

    return (
        <Drawer
            title={
                <Space direction="vertical" size={0}>
                    <Title level={4} style={{ margin: 0 }}>{candidate.firstName} {candidate.lastName}</Title>
                    <Text type="secondary">{candidate.profession}</Text>
                </Space>
            }
            open={open}
            onClose={onClose}
            width={650}
            extra={
                <Space>
                    <Tag color={candidate.hasVehicle ? 'cyan' : 'default'}>
                        {candidate.hasVehicle ? 'Con Vehículo' : 'Sin Vehículo'}
                    </Tag>
                </Space>
            }
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, paddingBottom: 12 }}>
                    <Space>
                        {candidate.rejectionReason || candidate.applications?.[0]?.status === 'REJECTED' ? (
                            <Button
                                type="primary"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                onClick={handleRescue}
                                loading={submitting}
                                icon={<ArrowRightOutlined />}
                            >
                                Rescatar Candidato
                            </Button>
                        ) : (
                            <>
                                <Button danger onClick={handleReject} loading={submitting} icon={<CloseCircleOutlined />}>
                                    Rechazar
                                </Button>
                                {currentStepIndex < 4 && (
                                    <Button type="primary" onClick={handleAdvance} loading={submitting} icon={<ArrowRightOutlined />}>
                                        {currentStepIndex === 0 ? 'Mover a Video' : 'Siguiente Etapa'}
                                    </Button>
                                )}
                            </>
                        )}
                    </Space>
                </div>
            }
        >
            <Steps current={currentStepIndex} size="small" style={{ marginBottom: 24 }}>
                <Step title="Elegible" />
                <Step title="Video / Revisión" />
                <Step title="Psicotécnica" />
                <Step title="Entrevista" />
                <Step title="Decisión / Oferta" />
            </Steps>

            <Descriptions title="Información General" bordered column={1} size="small">
                <Descriptions.Item label="Cédula">{candidate.nationalId}</Descriptions.Item>
                <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
                <Descriptions.Item label="Teléfono">{candidate.phone}</Descriptions.Item>
                <Descriptions.Item label="Ubicación">
                    {candidate.municipality ? `${candidate.municipality.name} - ${candidate.municipality.state?.name || ''}` : 'Sin ubicación'}
                </Descriptions.Item>
                {candidate.driveFolderUrl && (
                    <Descriptions.Item label="Google Drive">
                        <a href={candidate.driveFolderUrl} target="_blank" rel="noreferrer">
                            <Space><FolderOpenOutlined /> Abrir Carpeta Organizadora</Space>
                        </a>
                    </Descriptions.Item>
                )}
                {candidate.subStatus && (
                    <Descriptions.Item label="Estado Actual">
                        <Tag color="blue">{candidate.subStatus}</Tag>
                    </Descriptions.Item>
                )}
                {candidate.testUrl && (
                    <Descriptions.Item label="Prueba Psicotécnica">
                        <a href={candidate.testUrl} target="_blank" rel="noreferrer">Ver Link de Prueba</a>
                    </Descriptions.Item>
                )}
            </Descriptions>

            <Divider orientation="left"><HistoryOutlined /> Historial del Proceso</Divider>

            <Timeline
                mode="left"
                style={{ marginTop: 16 }}
                items={(candidate.logs || []).map(log => ({
                    label: new Date(log.createdAt).toLocaleDateString(),
                    children: (
                        <div>
                            <Text strong>{log.subStatus || 'Cambio de Etapa'}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>{log.comment}</Text>
                        </div>
                    ),
                    color: log.status === 'REJECTED' ? 'red' : 'green'
                }))}
            />

            <Divider orientation="left">Adjuntos y Herramientas</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
                {candidate.driveFolderUrl && (
                    <Button
                        block
                        icon={<FolderOpenOutlined />}
                        style={{ textAlign: 'left', borderColor: '#52c41a', color: '#52c41a' }}
                        href={candidate.driveFolderUrl}
                        target="_blank"
                    >
                        Ver Carpeta en Google Drive
                    </Button>
                )}
                {candidate.cvUrl ? (
                    <Button block icon={<FilePdfOutlined />} style={{ textAlign: 'left' }} href={candidate.cvUrl} target="_blank">
                        Currículum Vitae (Original)
                    </Button>
                ) : <Text type="secondary">Sin CV</Text>}
                {candidate.videoUrl ? (
                    <Button block icon={<VideoCameraOutlined />} style={{ textAlign: 'left' }} href={candidate.videoUrl} target="_blank">
                        Video Presentación
                    </Button>
                ) : <Text type="secondary">Sin Video</Text>}
            </Space>

            {candidate.rejectionReason && (
                <div style={{ marginTop: 24, padding: 12, background: '#fff1f0', borderRadius: 8, border: '1px solid #ffa39e' }}>
                    <Text type="danger" strong>Motivo de Rechazo:</Text>
                    <div style={{ marginTop: 4 }}>{candidate.rejectionReason}</div>
                </div>
            )}
        </Drawer>
    );
};

export default CandidateDrawer;
