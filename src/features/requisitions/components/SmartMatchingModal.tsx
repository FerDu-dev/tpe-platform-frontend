import React, { useState, useEffect } from 'react';
import { Modal, List, Card, Tag, Button, Typography, Space, message, Empty, Input, Row, Col, Statistic } from 'antd';
import { RocketOutlined, GlobalOutlined, UserOutlined, SearchOutlined, CheckCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { candidateService } from '../../../services/candidateService';
import { zonesService } from '../../../services/zonesService';

const { Title, Text } = Typography;

interface SmartMatchingModalProps {
    visible: boolean;
    onClose: () => void;
    requisition: any;
    onCandidateLinked: () => void;
}

const SmartMatchingModal: React.FC<SmartMatchingModalProps> = ({ visible, onClose, requisition, onCandidateLinked }) => {
    const [availableCandidates, setAvailableCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [fullZone, setFullZone] = useState<any>(null);

    useEffect(() => {
        if (visible) {
            fetchAvailable();
            if (requisition?.zoneId) {
                fetchZoneDetails();
            }
        }
    }, [visible, requisition?.id]);

    const fetchZoneDetails = async () => {
        try {
            const zone = await zonesService.fetchZoneById(requisition.zoneId);
            setFullZone(zone);
        } catch (error) {
            console.error('Error fetching zone details:', error);
        }
    };

    const fetchAvailable = async () => {
        setLoading(true);
        try {
            // Fetch candidates in "Bienvenida" (Stage 1)
            const res = await candidateService.fetch_candidates_active({ stageId: 1 });
            setAvailableCandidates(res.data || []);
        } catch (error) {
            message.error('Error al cargar candidatos disponibles');
        } finally {
            setLoading(false);
        }
    };

    const handleLink = async (candidateId: number) => {
        try {
            await candidateService.updateApplicationRequisition(candidateId.toString(), requisition.id);
            message.success('¡Candidato vinculado con éxito!');
            onCandidateLinked();
            // We don't close immediately to allow linking more? 
            // Or maybe we do. User asked to "enlazar y hacerlo avanzar".
            // For now, let's refresh local list.
            setAvailableCandidates((prev: any[]) => prev.filter((c: any) => c.id !== candidateId));
        } catch (error) {
            message.error('Error al vincular candidato');
        }
    };

    const filteredCandidates = availableCandidates.filter((c: any) => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.profession && c.profession.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Modal
            title={
                <Space>
                    <RocketOutlined style={{ color: '#1890ff' }} />
                    <span>Emparejamiento Inteligente</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={800}
            footer={null}
            bodyStyle={{ padding: '24px' }}
            centered
        >
            <div style={{ marginBottom: '24px', background: '#f0f5ff', padding: '20px', borderRadius: '12px', border: '1px solid #adc6ff' }}>
                <Row align="middle" gutter={16}>
                    <Col span={16}>
                        <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Vacante Activa</Text>
                        <Title level={4} style={{ margin: '4px 0 12px 0', color: '#003a8c' }}>{requisition?.title}</Title>
                        
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <Tag color="blue" style={{ margin: 0, borderRadius: '4px', fontWeight: 600 }}>
                                    <GlobalOutlined /> {fullZone?.name || requisition?.zone?.name || 'N/A'}
                                </Tag>
                                {fullZone?.region && <Tag color="cyan" style={{ borderRadius: '4px' }}>Región: {fullZone.region}</Tag>}
                                {requisition?.location && <Text type="secondary" style={{ fontSize: '13px' }}>• {requisition.location}</Text>}
                            </div>
                            
                            {(fullZone?.coordinator || fullZone?.geographicRoute) && (
                                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '8px 12px', borderRadius: '8px', marginTop: '8px' }}>
                                    {fullZone?.coordinator && (
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                            <strong>Coordinador:</strong> {fullZone.coordinator} {fullZone.coordinatorNum && <small style={{ color: '#1890ff' }}>({fullZone.coordinatorNum})</small>}
                                        </Text>
                                    )}
                                    {fullZone?.geographicRoute && (
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                            <strong>Ruta/Detalles:</strong> {fullZone.geographicRoute}
                                        </Text>
                                    )}
                                </div>
                            )}
                        </Space>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Card size="small" style={{ borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.7)' }}>
                            <Statistic 
                                title="Posibles Candidatos" 
                                value={availableCandidates.length} 
                                valueStyle={{ color: '#1890ff', fontSize: '20px', fontWeight: 700 }} 
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <Input 
                placeholder="Buscar por nombre o profesión..." 
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ marginBottom: '20px', borderRadius: '8px', height: '40px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                allowClear
            />

            <List
                loading={loading}
                grid={{ gutter: 16, xs: 1, sm: 2 }}
                dataSource={filteredCandidates}
                renderItem={(candidate: any) => {
                    const isMismoEstado = candidate.stateId === requisition?.stateId;
                    const isMismoMunicipio = candidate.municipalityId === requisition?.municipalityId;
                    
                    return (
                        <List.Item>
                            <Card 
                                hoverable 
                                size="small" 
                                style={{ 
                                    borderRadius: '12px', 
                                    border: (isMismoEstado || isMismoMunicipio) ? '1px solid #91d5ff' : '1px solid rgba(0,0,0,0.05)', 
                                    height: '100%',
                                    background: (isMismoEstado || isMismoMunicipio) ? 'linear-gradient(to bottom, #ffffff, #f0f9ff)' : '#fff'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '16px', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UserOutlined style={{ color: '#1890ff' }} />
                                            </div>
                                            <Text strong style={{ fontSize: '14px' }}>{candidate.firstName} {candidate.lastName}</Text>
                                        </div>
                                        {isMismoMunicipio && <Tag color="green" style={{ margin: 0, fontSize: '10px', borderRadius: '10px' }}>Ideal</Tag>}
                                    </div>
                                    
                                    <Space direction="vertical" size={2}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <EnvironmentOutlined style={{ marginRight: '4px' }} />
                                            {candidate.location || (candidate.municipality ? `${candidate.municipality.name}, ${candidate.municipality.state?.name}` : 'Ubicación no especificada')}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <RocketOutlined style={{ marginRight: '4px' }} />
                                            {candidate.profession || 'Profesión no especificada'}
                                        </Text>
                                    </Space>

                                        <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                                            <Button 
                                                type="primary" 
                                                block 
                                                icon={<CheckCircleOutlined />}
                                                style={{ borderRadius: '8px' }}
                                                onClick={() => handleLink(candidate.id)}
                                            >
                                                Vincular ahora
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        );
                    }}
                locale={{ 
                    emptyText: (
                        <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description="No se encontraron candidatos disponibles para vincular" 
                        />
                    )
                } as any}
                pagination={{ pageSize: 6, size: 'small' }}
            />
        </Modal>
    );
};

export default SmartMatchingModal;
