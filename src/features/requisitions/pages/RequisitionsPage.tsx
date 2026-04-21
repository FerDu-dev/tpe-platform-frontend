import React, { useEffect, useState } from 'react';
import { Typography, Button, Pagination, Row, Col } from 'antd';
import {
    PlusOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { Card, Modal, Input, message, notification } from 'antd';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loadRequisitions } from '../store/requisitionsSlice';
import RequisitionsTable from '../components/RequisitionsTable';
import RequisitionForm from '../components/RequisitionForm';
import { Requisition } from '../../../types';
import RequisitionDrawer from '../components/RequisitionDrawer';
import RequisitionFilterBar from '../components/RequisitionFilterBar';

import { Tabs } from 'antd';
import RecruitmentDashboard from '../components/RecruitmentDashboard';
import { requisitionService } from '../../../services/requisitionService';
import PermissionGuard from '../../../components/PermissionGuard';
import HiresPage from '../../hires/pages/HiresPage';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const RequisitionsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const requisitions = useAppSelector(state => state.requisitions.requisitions);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Derived reactive states
    const selectedRequisition = React.useMemo(() =>
        requisitions.find(r => r.id === selectedId) || null,
        [requisitions, selectedId]
    );

    const requisitionToEdit = React.useMemo(() =>
        requisitions.find(r => r.id === editingId) || null,
        [requisitions, editingId]
    );

    const [activeTab, setActiveTab] = useState('list');
    const [statusTab, setStatusTab] = useState('OPEN');
    const [reasonModalVisible, setReasonModalVisible] = useState(false);
    const [reason, setReason] = useState('');
    const [actionType, setActionType] = useState<'PAUSE' | 'CANCEL' | null>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    const handleOpenCreate = () => {
        setEditingId(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (requisition: Requisition) => {
        setEditingId(requisition.id);
        setIsFormOpen(true);
    };

    const meta = useAppSelector(state => state.requisitions.meta);
    const filters = useAppSelector(state => state.requisitions.filters);
    const error = useAppSelector(state => state.requisitions.error);

    useEffect(() => {
        if (error) {
            notification.error({
                message: 'Error al cargar requisiciones',
                description: 'Hubo un problema al obtener la lista de vacantes. Por favor, intenta de nuevo.',
                placement: 'topRight',
                duration: 5
            });
        }
    }, [error]);

    const handleRowClick = (record: Requisition) => {
        setSelectedId(record.id);
    };

    useEffect(() => {
        dispatch(loadRequisitions({
            ...filters,
            page: 1,
            status: statusTab as any
        }));
    }, [dispatch, filters, statusTab]);

    const handlePageChange = (page: number, pageSize?: number) => {
        dispatch(loadRequisitions({
            ...filters,
            page,
            limit: pageSize || meta?.limit || 10,
            status: statusTab as any
        }));
    };

    const handleStatusTabChange = (key: string) => {
        setStatusTab(key);
        setSelectedId(null); // Clear selection when changing status
    };

    const handleActionClick = (type: 'PAUSE' | 'CANCEL') => {
        setActionType(type);
        setReason('');
        setReasonModalVisible(true);
    };

    const handleActionConfirm = async () => {
        console.log('handleActionConfirm called', { selectedRequisition, actionType, reason });
        if (!selectedRequisition || !actionType) {
            console.warn('Action confirm aborted: missing requisition or action type');
            return;
        }
        if (!reason.trim()) {
            message.warning('Por favor, ingresa un motivo');
            return;
        }

        setLoadingAction(true);
        try {
            console.log(`Executing ${actionType} for requisition ${selectedRequisition.id}`);
            if (actionType === 'PAUSE') {
                await requisitionService.pause(selectedRequisition.id, reason);
                message.success('Requisición pausada correctamente. Los candidatos vinculados han sido liberados.');
            } else {
                await requisitionService.cancel(selectedRequisition.id, reason);
                message.success('Requisición cancelada correctamente. Los candidatos vinculados han sido liberados.');
            }
            setReasonModalVisible(false);
            setSelectedId(null);
            dispatch(loadRequisitions({ page: 1, status: statusTab as any, ...filters }));
        } catch (error) {
            console.error('Error in handleActionConfirm:', error);
            message.error('Error al procesar la acción');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleReactivate = async () => {
        if (!selectedRequisition) return;
        setLoadingAction(true);
        try {
            await requisitionService.reactivate(selectedRequisition.id);
            message.success('Requisición reactivada correctamente');
            setSelectedId(null);
            dispatch(loadRequisitions({ page: 1, status: statusTab as any, ...filters }));
        } catch (error) {
            message.error('Error al reactivar la requisición');
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                    <Col>
                        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FileTextOutlined style={{ color: '#2b457c' }} />
                            Gestión de Requisiciones
                        </Title>
                        <Text type="secondary">Administra las vacantes y su proceso de reclutamiento</Text>
                    </Col>
                    <Col>
                        <PermissionGuard module="requisitions" action="create">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleOpenCreate}
                                size="large"
                                style={{ borderRadius: '8px', background: '#2b457c', borderColor: '#2b457c' }}
                            >
                                Nueva Requisición
                            </Button>
                        </PermissionGuard>
                    </Col>
                </Row>
                
                <div style={{ marginBottom: '24px' }}>
                    <RequisitionFilterBar />
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                    className="premium-tabs"
                >
                    <TabPane tab="Lista de Requisiciones" key="list">
                        <div style={{ marginTop: '0px' }}>

                            <Tabs
                                activeKey={statusTab}
                                onChange={handleStatusTabChange}
                                type="card"
                                className="status-tabs"
                            >
                                <TabPane tab="Activas" key="OPEN" />
                                <TabPane tab="Pausadas" key="PAUSED" />
                                <TabPane tab="Canceladas" key="CANCELLED" />
                            </Tabs>

                            <Row gutter={[24, 24]} style={{ marginTop: '16px' }}>
                                <Col span={24}>
                                    <Card style={{ borderRadius: '12px' }} bodyStyle={{ padding: 0 }}>
                                        <RequisitionsTable
                                            onRowClick={handleRowClick}
                                            selectedId={selectedRequisition?.id}
                                        />

                                        {meta && (
                                            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                                                <Pagination
                                                    current={meta.page}
                                                    total={meta.total}
                                                    pageSize={meta.limit}
                                                    onChange={handlePageChange}
                                                    showSizeChanger
                                                    pageSizeOptions={['10', '20', '50']}
                                                    showTotal={(total) => `Total ${total} requisiciones`}
                                                />
                                            </div>
                                        )}
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </TabPane>
                    <TabPane tab="Dashboard de Reclutamiento" key="dashboard">
                        <RecruitmentDashboard />
                    </TabPane>
                    <TabPane tab="Historial de Contrataciones" key="hires">
                        <PermissionGuard module="hires">
                            <HiresPage />
                        </PermissionGuard>
                    </TabPane>
                </Tabs>

                <style>{`
                .premium-tabs .ant-tabs-nav {
                    margin-bottom: 0 !important;
                }
                .premium-tabs .ant-tabs-content-holder {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .premium-tabs .ant-tabs-content {
                    flex: 1;
                }
                .selected-row {
                    background-color: #e6f7ff !important;
                }
            `}</style>

                <RequisitionDrawer
                    open={!!selectedRequisition}
                    onClose={() => setSelectedId(null)}
                    requisition={selectedRequisition}
                    onPause={() => handleActionClick('PAUSE')}
                    onCancel={() => handleActionClick('CANCEL')}
                    onReactivate={() => handleReactivate()}
                    onEditClick={handleOpenEdit}
                />

                <RequisitionForm
                    open={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    requisition={requisitionToEdit}
                />

                <Modal
                    title={`${actionType === 'PAUSE' ? 'Pausar' : 'Cancelar'} Requisición`}
                    open={reasonModalVisible}
                    onOk={handleActionConfirm}
                    onCancel={() => setReasonModalVisible(false)}
                    confirmLoading={loadingAction}
                    okText="Confirmar"
                    cancelText="Cerrar"
                    okButtonProps={{ danger: actionType === 'CANCEL' }}
                    zIndex={1100}
                    destroyOnClose
                >
                    <div style={{ marginBottom: '16px' }}>
                        <Text type="secondary">
                            {actionType === 'PAUSE'
                                ? 'Al pausar esta requisición, todos los candidatos actualmente vinculados quedarán liberados para ser asignados a otras vacantes.'
                                : 'Al cancelar esta requisición, todos los candidatos actualmente vinculados quedarán liberados.'}
                        </Text>
                    </div>
                    <Text strong>Motivo de {actionType === 'PAUSE' ? 'Pausa' : 'Cancelación'}:</Text>
                    <Input.TextArea
                        rows={4}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Escribe aquí el motivo detallado..."
                        style={{ marginTop: '8px' }}
                    />
                </Modal>
            </motion.div>
        </div>
    );
};

export default RequisitionsPage;
