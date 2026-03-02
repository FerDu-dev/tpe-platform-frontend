import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button, Divider, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    selectCompanies, selectPositions, selectZones,
    addCompany, addPosition, addZone
} from '../../../store/masterDataSlice';
import { addRequisition } from '../store/requisitionsSlice';
import { municipalityService } from '../../../services/municipalityService';
import type { Requisition, RequisitionStatus, Priority, State, Municipality } from '../../../types';

const { Option } = Select;

interface RequisitionFormProps {
    open: boolean;
    onClose: () => void;
}

const RequisitionForm: React.FC<RequisitionFormProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    // Master Data from Store
    const companies = useAppSelector(selectCompanies);
    const positions = useAppSelector(selectPositions);
    const zones = useAppSelector(selectZones);

    const [states, setStates] = useState<State[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [selectedStateId, setSelectedStateId] = useState<number | undefined>();

    // Temp state for new items
    const [newItemName, setNewItemName] = useState('');

    useEffect(() => {
        municipalityService.getStates().then(setStates).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedStateId) {
            municipalityService.getMunicipalities(selectedStateId).then(setMunicipalities).catch(console.error);
        } else {
            setMunicipalities([]);
        }
    }, [selectedStateId]);

    const handleCreateNew = (type: 'company' | 'position' | 'zone') => {
        if (!newItemName.trim()) return;

        if (type === 'company') dispatch(addCompany(newItemName));
        else if (type === 'position') dispatch(addPosition(newItemName));
        else if (type === 'zone') dispatch(addZone(newItemName));

        message.success(`${newItemName} añadido correctamente`);
        setNewItemName('');
    };

    const handleStateChange = (value: number) => {
        setSelectedStateId(value);
        form.setFieldsValue({ municipalityId: undefined });
    };

    const handleSubmit = (values: any) => {
        const stateObj = states.find(s => s.id === values.stateId);
        const muniObj = municipalities.find(m => m.id === values.municipalityId);

        const newReq: Requisition = {
            id: `req-${Date.now()}`,
            idx: `${values.company}-${values.position}-${values.zone}`,
            company: values.company,
            title: values.position,
            priority: values.priority as Priority,
            status: 'activa' as RequisitionStatus,
            applicants: 0,
            createdDate: new Date().toISOString(),
            department: 'Ventas',
            location: muniObj ? `${muniObj.name} - ${stateObj?.name || ''}` : (stateObj?.name || 'N/A'),
            zone: values.zone,
            route: values.route || '',
            stateId: values.stateId,
            municipalityId: values.municipalityId
        };

        dispatch(addRequisition(newReq));
        message.success('Requisición creada con éxito');
        form.resetFields();
        onClose();
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
                <Button type="text" icon={<PlusOutlined />} onClick={() => handleCreateNew(type)}>
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
                    <Form.Item name="company" label="Empresa" rules={[{ required: true }]}>
                        <Select dropdownRender={(menu) => renderDropdown(menu, 'company')}>
                            {companies.map(c => <Option key={c} value={c}>{c}</Option>)}
                        </Select>
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
                            {states.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="municipalityId" label="Municipio" rules={[{ required: true }]}>
                        <Select showSearch disabled={!selectedStateId}>
                            {municipalities.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="zone" label="Zona" rules={[{ required: true }]}>
                        <Select dropdownRender={(menu) => renderDropdown(menu, 'zone')}>
                            {zones.map(z => <Option key={z} value={z}>{z}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="route" label="Ruta">
                        <Input placeholder="Ej: Caracas-Guarenas" />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default RequisitionForm;
