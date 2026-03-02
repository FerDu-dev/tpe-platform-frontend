import React from 'react';
import { Card, Typography, Tag, Space, Tooltip } from 'antd';
import { ClockCircleOutlined, CarOutlined, ExclamationCircleOutlined, VideoCameraOutlined, SolutionOutlined, FolderOpenOutlined } from '@ant-design/icons';
import type { Candidate } from '../../../types';

const { Text } = Typography;

interface CandidateCardProps {
    candidate: Candidate;
    onClick: () => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onClick }) => {
    const getSubStatusUI = (subStatus?: string) => {
        if (!subStatus) return null;

        const config: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
            'Bienvenida Enviada | Video Solicitado': { label: 'Bienvenida | Video Pendiente', icon: <VideoCameraOutlined />, color: 'purple' },
            'Video Solicitado': { label: 'Video Solicitado', icon: <VideoCameraOutlined />, color: 'purple' },
            'Video Cargado': { label: 'Video Cargado', icon: <VideoCameraOutlined />, color: 'success' },
            'En espera': { label: 'En espera', icon: <ClockCircleOutlined />, color: 'default' },
            'Psicotécnica Solicitada': { label: 'Psic. Solicitada', icon: <SolutionOutlined />, color: 'warning' },
            'Entrevista Agendada': { label: 'Entrevista', icon: <ClockCircleOutlined />, color: 'processing' },
            'No Elegible': { label: 'No Elegible', icon: <ExclamationCircleOutlined />, color: 'warning' },
        };

        const item = config[subStatus] || { label: subStatus, icon: null, color: 'default' };
        return (
            <Tag color={item.color} style={{ margin: 0, fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {item.icon}
                {item.label}
            </Tag>
        );
    };

    return (
        <Card
            hoverable
            style={{
                marginBottom: 12,
                borderRadius: 8,
                borderLeft: `4px solid ${candidate.applications?.[0]?.rejectionReason ? '#ff4d4f' : '#2b457c'}`,
                overflow: 'hidden',
                flexShrink: 0
            }}
            bodyStyle={{ padding: '12px 16px' }}
            onClick={onClick}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                    <Text strong style={{ fontSize: '15px', color: '#1f1f1f', display: 'block' }}>
                        {candidate.firstName} {candidate.lastName}
                    </Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {/* <Text type="secondary" style={{ fontSize: '12px' }}>
                            {candidate.profession || 'Sin profesión'}
                        </Text> */}
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            {candidate.phone}
                        </Text>
                    </div>
                </div>
            </div>

            <Space direction="vertical" size={2} style={{ width: '100%' }}>

                {/* Key Metrics Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 4, fontSize: '12px', color: '#595959' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Space size={4}>
                            <ClockCircleOutlined />
                            <span>{candidate.daysInStage || 0}d</span>
                        </Space>
                        {getSubStatusUI(candidate.subStatus)}
                    </div>
                    {candidate.hasVehicle && (
                        <Tooltip title="Posee Vehículo">
                            <Tag color="cyan" style={{ margin: 0, fontSize: '10px', lineHeight: '16px' }}>
                                <CarOutlined /> Auto
                            </Tag>
                        </Tooltip>
                    )}
                    {candidate.driveFolderUrl && (
                        <Tooltip title="Carpeta Drive Creada">
                            <Tag color="success" style={{ margin: 0, fontSize: '10px', lineHeight: '16px' }}>
                                <FolderOpenOutlined />
                            </Tag>
                        </Tooltip>
                    )}
                </div>

                {/* IDX / Location Tag */}
                <div style={{ marginTop: 8 }}>
                    <Tag style={{
                        marginRight: 0,
                        backgroundColor: '#f0f5ff',
                        color: '#2b457c',
                        border: '1px solid #adc6ff',
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '11px'
                    }}>
                        {candidate.municipality ? `${candidate.municipality.name} - ${candidate.municipality.state?.name || ''}` : 'Sin ubicación'}
                    </Tag>
                </div>

                {candidate.applications?.[0]?.status === 'REJECTED' && (
                    <div style={{ marginTop: 6 }}>
                        <Tag color="error" style={{ width: '100%', textAlign: 'center', fontSize: '11px' }}>
                            <ExclamationCircleOutlined /> {candidate.subStatus === 'No Elegible' ? 'No Elegible' : 'Rechazado'}
                        </Tag>
                    </div>
                )}

            </Space>
        </Card>
    );
};

export default CandidateCard;
