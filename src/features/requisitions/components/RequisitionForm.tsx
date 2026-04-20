import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, Divider, message, Space, Card, Descriptions } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    selectPositions,
    addCompany, addPosition, removePosition
} from '../../../store/masterDataSlice';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { createRequisition, updateRequisition } from '../store/requisitionsSlice';
import { VENEZUELA_STATES } from '../../../constants/venezuela';
import type { Priority, Zone, Requisition } from '../../../types';
import { zonesService } from '../../../services/zonesService';

const { Option } = Select;

interface RequisitionFormProps {
    open: boolean;
    onClose: () => void;
    requisition?: Requisition | null;
    loading?: boolean;
}

const RequisitionForm: React.FC<RequisitionFormProps> = ({ open, onClose, requisition, loading = false }) => {
    const [form] = Form.useForm();
    const [zoneForm] = Form.useForm();
    const dispatch = useAppDispatch();
    const selectedZoneId = Form.useWatch('zoneId', form);
    const selectedCompanyId = Form.useWatch('companyId', form);

    const positions = useAppSelector(selectPositions);

    const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loadingZones, setLoadingZones] = useState(false);
    const [zoneModalOpen, setZoneModalOpen] = useState(false);
    const [creatingZone, setCreatingZone] = useState(false);

    // Initial load for editing
    React.useEffect(() => {
        if (open) {
            if (requisition) {
                console.log('Populating form with requisition:', requisition);
                
                // Populate municipalities if state exists
                if (requisition.stateId) {
                    const found = VENEZUELA_STATES.find(s => s.id === requisition.stateId);
                    setMunicipalities(found ? found.municipalities : []);
                }
                
                // Populate zones if company exists
                const companyId = requisition.companyId;
                if (companyId) {
                    setLoadingZones(true);
                    zonesService.fetchZones(companyId)
                        .then((res) => setZones(res.data))
                        .catch(() => message.error('Error al cargar zonas'))
                        .finally(() => setLoadingZones(false));
                }

                // Resolve zoneId (it might be in zoneId or zone.id)
                const resolvedZoneId = requisition.zoneId || (requisition.zone && typeof requisition.zone === 'object' ? requisition.zone.id : undefined);

                form.setFieldsValue({
                    companyId: requisition.companyId,
                    requestedBy: requisition.requestedBy,
                    priority: requisition.priority,
                    position: requisition.title,
                    stateId: requisition.stateId,
                    municipalityId: requisition.municipalityId,
                    zoneId: resolvedZoneId,
                });
            } else {
                form.resetFields();
                setMunicipalities([]);
                setZones([]);
            }
        }
    }, [open, requisition, form]);

    const COMPANIES = [
        { id: 1, name: 'Febeca' },
        { id: 2, name: 'Beval' },
        { id: 3, name: 'Sillaca' },
        { id: 4, name: 'Grupo' },
    ];

    const [newItemName, setNewItemName] = useState('');

    const handleStateChange = (stateId: number) => {
        form.setFieldValue('municipalityId', undefined);
        const found = VENEZUELA_STATES.find(s => s.id === stateId);
        setMunicipalities(found ? found.municipalities : []);
    };

    const handleCreateNew = (type: 'company' | 'position') => {
        if (!newItemName.trim()) return;
        if (type === 'company') dispatch(addCompany(newItemName));
        else if (type === 'position') dispatch(addPosition(newItemName));
        message.success(`${newItemName} añadido correctamente`);
        setNewItemName('');
    };

    const handleDeletePosition = (positionName: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent dropdown item selection
        Modal.confirm({
            title: '¿Estás seguro de eliminar este cargo?',
            content: `Se eliminará el cargo "${positionName}" de la lista de opciones.`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: () => {
                dispatch(removePosition(positionName));
                message.success(`Cargo "${positionName}" eliminado correctamente`);
                // If the deleted position was selected, clear it
                if (form.getFieldValue('position') === positionName) {
                    form.setFieldValue('position', undefined);
                }
            },
        });
    };

    const handleCompanyChange = (companyId: number) => {
        setLoadingZones(true);
        zonesService.fetchZones(companyId)
            .then((res) => setZones(res.data))
            .catch(() => message.error('Error al cargar zonas'))
            .finally(() => setLoadingZones(false));
        form.setFieldsValue({ zoneId: undefined });
    };

    const handleOpenZoneModal = () => {
        const companyId = form.getFieldValue('companyId');
        if (!companyId) {
            message.warning('Selecciona primero una empresa para crear una zona.');
            return;
        }
        zoneForm.resetFields();
        setZoneModalOpen(true);
    };

    const handleCreateZone = async (values: any) => {
        const companyId = form.getFieldValue('companyId');
        setCreatingZone(true);
        try {
            // Resolve state name from the local constant so the backend can upsert it
            const selectedState = VENEZUELA_STATES.find(s => s.id === values.stateId);
            const newZone = await zonesService.createZone({
                name: values.name,
                companyId,
                region: values.region,
                coordinator: values.coordinator,
                coordinatorNum: values.coordinatorNum,
                geographicRoute: values.geographicRoute,
                stateId: values.stateId,
                stateName: selectedState?.name,
            });
            setZones(prev => [...prev, newZone]);
            form.setFieldsValue({ zoneId: newZone.id });
            message.success(`Zona "${newZone.name}" creada y seleccionada.`);
            setZoneModalOpen(false);
        } catch (e) {
            message.error('Error al crear la zona. Intenta nuevamente.');
        } finally {
            setCreatingZone(false);
        }
    };
    
    
    // Add remote search for zones
    const handleZoneSearch = async (value: string) => {
        if (!selectedCompanyId) return;
        setLoadingZones(true);
        try {
            const res = await zonesService.fetchZones(selectedCompanyId, value);
            setZones(res.data);
        } catch {
            // Already handled by error message in other places
        } finally {
            setLoadingZones(false);
        }
    };
    
    // Submit handler
    const handleSubmit = async (values: any) => {
        try {
            const selectedState = VENEZUELA_STATES.find(s => s.id === values.stateId);
            const selectedMuni = municipalities.find(m => m.id === values.municipalityId);

            const requisitionData: any = {
                title: values.position,
                priority: values.priority as Priority,
                companyId: values.companyId,
                zoneId: values.zoneId,
                stateId: values.stateId,
                municipalityId: values.municipalityId,
                stateName: selectedState?.name,
                municipalityName: selectedMuni?.name,
                requestedBy: values.requestedBy,
            };

            if (requisition) {
                await dispatch(updateRequisition({ id: requisition.id, data: requisitionData })).unwrap();
                message.success('Requisición actualizada con éxito');
            } else {
                // Add defaults for new
                requisitionData.requiresVehicle = false;
                requisitionData.vacanciesCount = 1;
                await dispatch(createRequisition(requisitionData)).unwrap();
                message.success('Requisición creada con éxito');
            }
            
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(error || 'Error al procesar la requisición');
        }
    };

    const renderPositionDropdown = (menu: React.ReactElement) => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
                <Input
                    placeholder="Nuevo cargo"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                />
                <Button type="text" icon={<PlusOutlined />} onClick={() => handleCreateNew('position')}>
                    Añadir
                </Button>
            </Space>
        </>
    );

    return (
        <>
            <Modal
                title={requisition ? "Editar Requisición" : "Nueva Requisición"}
                open={open}
                onCancel={onClose}
                onOk={() => form.submit()}
                okText={requisition ? "Guardar Cambios" : "Crear Requisición"}
                cancelText="Cancelar"
                confirmLoading={loading}
                width={600}
                style={{ top: 20 }}
                zIndex={1100}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="companyId" label="Empresa" rules={[{ required: true }]}>
                            <Select onChange={handleCompanyChange}>
                                {COMPANIES.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item name="requestedBy" label="Solicitado por">
                            <Input placeholder="Nombre de la persona que solicita" />
                        </Form.Item>

                        <Form.Item name="priority" label="Prioridad" rules={[{ required: true }]}>
                            <Select>
                                <Option value="A">Prioridad A (Alta)</Option>
                                <Option value="B">Prioridad B (Media)</Option>
                                <Option value="C">Prioridad C (Baja)</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="position" label="Cargo / Posición" rules={[{ required: true }]}>
                            <Select popupRender={renderPositionDropdown} placeholder="Seleccionar cargo">
                                {positions.map(p => (
                                    <Option key={p} value={p}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{p}</span>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                                                onClick={(e) => handleDeletePosition(p, e)}
                                                onMouseDown={(e) => e.stopPropagation()} // Extra precaution for AntD Select
                                            />
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="stateId" label="Estado" rules={[{ required: true }]}>
                            <Select showSearch onChange={handleStateChange}>
                                {VENEZUELA_STATES.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item name="municipalityId" label="Municipio" rules={[{ required: true }]}>
                            <Select showSearch disabled={municipalities.length === 0}>
                                {municipalities.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="zoneId"
                            label="Zona"
                            rules={[{ required: true }]}
                            style={{ gridColumn: 'span 2' }}
                        >
                            <Select
                                loading={loadingZones}
                                disabled={!selectedCompanyId}
                                showSearch
                                onSearch={handleZoneSearch}
                                filterOption={false}
                                placeholder={!selectedCompanyId ? 'Selecciona primero una empresa' : 'Seleccionar zona'}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <div style={{ padding: '4px 8px 8px' }}>
                                            <Button
                                                type="dashed"
                                                block
                                                icon={<PlusOutlined />}
                                                onClick={handleOpenZoneModal}
                                                disabled={!selectedCompanyId}
                                            >
                                                + Agregar Zona
                                            </Button>
                                        </div>
                                    </>
                                )}
                            >
                                {zones.map(z => <Option key={z.id} value={z.id}>{z.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </div>

                    {selectedZoneId && zones.find(z => z.id === selectedZoneId) && (
                        <Card size="small" style={{ marginTop: '16px', background: '#f0f5ff', borderRadius: '10px' }}>
                            <Descriptions title="Detalles de la Zona Seleccionada" column={2} size="small">
                                <Descriptions.Item label="Región">
                                    {zones.find(z => z.id === selectedZoneId)?.region || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Coordinación">
                                    {zones.find(z => z.id === selectedZoneId)?.coordinator || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nro. Coord">
                                    {zones.find(z => z.id === selectedZoneId)?.coordinatorNum || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ruta Geográfica" span={2}>
                                    {zones.find(z => z.id === selectedZoneId)?.geographicRoute || 'N/A'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    )}
                </Form>
            </Modal>

            {/* Create Zone Modal */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined style={{ color: '#1890ff' }} />
                        <span>Nueva Zona</span>
                    </Space>
                }
                open={zoneModalOpen}
                onCancel={() => setZoneModalOpen(false)}
                onOk={() => zoneForm.submit()}
                okText="Crear Zona"
                cancelText="Cancelar"
                confirmLoading={creatingZone}
                width={480}
            >
                <Form form={zoneForm} layout="vertical" onFinish={handleCreateZone} style={{ marginTop: '16px' }}>
                    <Form.Item name="name" label="Nombre de la zona" rules={[{ required: true, message: 'El nombre es requerido' }]}>
                        <Input placeholder="Ej: Zona Norte Caracas" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Form.Item name="region" label="Región">
                            <Input placeholder="Ej: Región Capital" />
                        </Form.Item>

                        <Form.Item name="stateId" label="Estado (referencia)">
                            <Select showSearch placeholder="Seleccionar estado" allowClear>
                                {VENEZUELA_STATES.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item name="coordinator" label="Coordinador">
                            <Input placeholder="Nombre del coordinador" />
                        </Form.Item>

                        <Form.Item name="coordinatorNum" label="Teléfono Coordinador">
                            <Input placeholder="Ej: 0412-1234567" />
                        </Form.Item>
                    </div>

                    <Form.Item name="geographicRoute" label="Ruta / Detalles Geográficos">
                        <Input.TextArea
                            rows={2}
                            placeholder="Describe la ruta o zona geográfica que cubre esta zona..."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default RequisitionForm;
