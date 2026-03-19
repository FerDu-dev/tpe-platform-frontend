import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, Divider, message, Space, Card, Descriptions } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    selectPositions,
    addCompany, addPosition
} from '../../../store/masterDataSlice';
import { createRequisition } from '../store/requisitionsSlice';
import { VENEZUELA_STATES } from '../../../constants/venezuela';
import type { Priority, Zone } from '../../../types';
import { zonesService } from '../../../services/zonesService';

const { Option } = Select;

interface RequisitionFormProps {
    open: boolean;
    onClose: () => void;
}

const RequisitionForm: React.FC<RequisitionFormProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const selectedZoneId = Form.useWatch('zoneId', form);
    const selectedCompanyId = Form.useWatch('companyId', form);

    // Master Data from Store
    const positions = useAppSelector(selectPositions);

    const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loadingZones, setLoadingZones] = useState(false);

    const COMPANIES = [
        { id: 1, name: 'Febeca' },
        { id: 2, name: 'Beval' },
        { id: 3, name: 'Sillaca' },
        { id: 4, name: 'Grupo' },
    ];

    // Temp state for new items
    const [newItemName, setNewItemName] = useState('');

    const handleStateChange = (stateId: number) => {
        form.setFieldValue('municipalityId', undefined);
        const found = VENEZUELA_STATES.find(s => s.id === stateId);
        setMunicipalities(found ? found.municipalities : []);
    };

    const handleCreateNew = (type: 'company' | 'position' | 'zone') => {
        if (!newItemName.trim()) return;

        if (type === 'company') dispatch(addCompany(newItemName));
        else if (type === 'position') dispatch(addPosition(newItemName));

        message.success(`${newItemName} añadido correctamente`);
        setNewItemName('');
    };


    const handleCompanyChange = (companyId: number) => {
        setLoadingZones(true);
        zonesService.fetchZones(companyId)
            .then(setZones)
            .catch(() => message.error('Error al cargar zonas'))
            .finally(() => setLoadingZones(false));
        form.setFieldsValue({ zoneId: undefined });
    };

    const handleCreateNewZone = async () => {
        if (!newItemName.trim()) return;
        const companyId = form.getFieldValue('companyId');
        if (!companyId) return message.error('Selecciona una empresa primero para añadir una zona');

        try {
            const newZone = await zonesService.createZone({
                name: newItemName,
                companyId: companyId
            });
            setZones(prev => [...prev, newZone]);
            form.setFieldsValue({ zoneId: newZone.id });
            message.success(`Zona ${newItemName} añadida correctamente`);
            setNewItemName('');
        } catch (e) {
            message.error('Error al crear la zona');
        }
    };

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
                requiresVehicle: false,
                vacanciesCount: 1,
            };

            await dispatch(createRequisition(requisitionData)).unwrap();
            message.success('Requisición creada con éxito');
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(error || 'Error al crear la requisición');
        }
    };

    const renderDropdown = (menu: React.ReactElement, type: 'company' | 'position' | 'zone') => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
                <Input
                    placeholder="Nuevo item"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                />
                 <Button type="text" icon={<PlusOutlined />} onClick={() => type === 'zone' ? handleCreateNewZone() : handleCreateNew(type)}>
                    Añadir
                </Button>
            </Space>
        </>
    );

    return (
        <Modal
            title="Nueva Requisición"
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Crear Requisición"
            cancelText="Cancelar"
            width={600}
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
                        <Select dropdownRender={(menu) => renderDropdown(menu, 'position')}>
                            {positions.map(p => <Option key={p} value={p}>{p}</Option>)}
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

                    <Form.Item name="zoneId" label="Zona" rules={[{ required: true }]} style={{ gridColumn: 'span 2' }}>
                        <Select 
                            loading={loadingZones} 
                            disabled={!selectedCompanyId}
                            dropdownRender={(menu) => renderDropdown(menu, 'zone')}
                            showSearch
                            optionFilterProp="children"
                        >
                            {zones.map(z => <Option key={z.id} value={z.id}>{z.name}</Option>)}
                        </Select>
                    </Form.Item>
                </div>

                {selectedZoneId && zones.find(z => z.id === selectedZoneId) && (
                    <Card size="small" style={{ marginTop: '16px', background: '#f0f5ff' }}>
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
    );
};

export default RequisitionForm;
