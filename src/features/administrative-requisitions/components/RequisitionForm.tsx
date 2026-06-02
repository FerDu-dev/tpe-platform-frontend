import React from 'react';
import { Modal, Form, Select, Input, message, Checkbox, DatePicker, Row, Col } from 'antd';
import { WarningOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Divider, Space, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { selectCompanies, selectAdminPositions, selectAdminDepartments, selectAdminLevels, addAdminPosition, removeAdminPosition, addAdminDepartment, removeAdminDepartment, addAdminLevel, removeAdminLevel, setCompanies } from '../../../store/masterDataSlice';
import { createRequisition, updateRequisition } from '../store/adminRequisitionsSlice';
import { VENEZUELA_STATES } from '../../../constants/venezuela';
import type { Priority, AdministrativeRequisition } from '../../../types';
import { companiesService } from '../../../services/companiesService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface RequisitionFormProps {
    open: boolean;
    onClose: () => void;
    requisition?: AdministrativeRequisition | null;
    loading?: boolean;
}

const RequisitionForm: React.FC<RequisitionFormProps> = ({ open, onClose, requisition, loading }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const isConfidential = Form.useWatch('isConfidential', form);
    const companies = useAppSelector(selectCompanies);

    React.useEffect(() => {
        if (open) {
            companiesService.getAll().then(data => dispatch(setCompanies(data))).catch(console.error);
        }
    }, [open, dispatch]);

    const adminPositions = useAppSelector(selectAdminPositions) || [];
    const adminDepartments = useAppSelector(selectAdminDepartments) || [];
    const adminLevels = useAppSelector(selectAdminLevels) || [];
    
    const [newItemName, setNewItemName] = React.useState('');
    const [newItemType, setNewItemType] = React.useState<'position' | 'department' | 'level' | null>(null);

    const handleCreateNew = (type: 'position' | 'department' | 'level') => {
        if (!newItemName.trim()) return;
        if (type === 'position') dispatch(addAdminPosition(newItemName));
        if (type === 'department') dispatch(addAdminDepartment(newItemName));
        if (type === 'level') dispatch(addAdminLevel(newItemName));
        message.success(`Añadido correctamente`);
        setNewItemName('');
    };

    const handleDelete = (type: 'position' | 'department' | 'level', name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        Modal.confirm({
            title: '¿Eliminar este elemento?',
            content: `Se eliminará "${name}" de la lista.`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: () => {
                if (type === 'position') dispatch(removeAdminPosition(name));
                if (type === 'department') dispatch(removeAdminDepartment(name));
                if (type === 'level') dispatch(removeAdminLevel(name));
                message.success('Eliminado correctamente');
                
                // Clear from form if currently selected
                const formField = type === 'position' ? 'position' : type === 'department' ? 'department' : 'levelAndStep';
                if (form.getFieldValue(formField) === name) {
                    form.setFieldValue(formField, undefined);
                }
            }
        });
    };

    const renderDropdown = (menu: React.ReactElement, type: 'position' | 'department' | 'level') => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
                <Input
                    placeholder="Añadir nuevo..."
                    value={newItemType === type ? newItemName : ''}
                    onFocus={() => {
                        setNewItemType(type);
                        setNewItemName('');
                    }}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                />
                <Button type="text" icon={<PlusOutlined />} onClick={() => handleCreateNew(type)}>
                    Añadir
                </Button>
            </Space>
        </>
    );



    const COUNTRIES = [
        'Venezuela',
        'Colombia',
        'Costa Rica',
    ];

    React.useEffect(() => {
        if (open) {
            if (requisition) {
                form.setFieldsValue({
                    companyId: requisition.companyId,
                    requestedBy: requisition.requestedBy,
                    priority: requisition.priority,
                    type: requisition.type,
                    department: requisition.department,
                    position: requisition.position,
                    levelAndStep: requisition.levelAndStep,
                    country: requisition.country || 'Venezuela',
                    stateId: requisition.stateId,
                    schedule: requisition.schedule,
                    vacanciesCount: requisition.vacanciesCount || 1,
                    comments: requisition.comments,
                    isConfidential: requisition.isConfidential || false,
                    requestDate: requisition.requestDate ? dayjs(requisition.requestDate) : (requisition.createdAt ? dayjs(requisition.createdAt) : dayjs()),
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ 
                    requestDate: dayjs(), 
                    country: 'Venezuela',
                    vacanciesCount: 1 
                });
            }
        }
    }, [open, requisition, form]);

    const handleSubmit = async (values: any) => {
        try {
            const requisitionData: any = {
                companyId: values.companyId,
                requestedBy: values.requestedBy,
                priority: values.priority as Priority,
                type: values.type,
                department: values.department,
                position: values.position,
                levelAndStep: values.levelAndStep,
                country: values.country,
                stateId: values.stateId,
                schedule: values.schedule,
                vacanciesCount: values.vacanciesCount,
                comments: values.comments,
                isConfidential: values.isConfidential || false,
            };

            if (values.requestDate) {
                requisitionData.requestDate = values.requestDate.toISOString();
            }

            if (requisition) {
                await dispatch(updateRequisition({ id: requisition.id, data: requisitionData })).unwrap();
                message.success('Requisición actualizada con éxito');
            } else {
                await dispatch(createRequisition(requisitionData)).unwrap();
                message.success('Requisición creada con éxito');
            }

            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(error || 'Error al procesar la requisición');
        }
    };

    return (
        <Modal
            title={requisition ? "Editar Requisición Administrativa" : "Nueva Requisición Administrativa"}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={requisition ? "Guardar Cambios" : "Crear Requisición"}
            cancelText="Cancelar"
            confirmLoading={loading}
            width={700}
            style={{ top: 20 }}
            zIndex={1100}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="companyId" label="Empresa" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select placeholder="Seleccionar Empresa">
                                {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="requestedBy" label="Solicitado por">
                            <Input placeholder="Nombre de la persona que solicita" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="type" label="Tipo de Requisición" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select placeholder="Ej: Profesional, Pasantía">
                                <Option value="Profesional">Profesional</Option>
                                <Option value="Pasantía">Pasantía</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="priority" label="Prioridad" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select placeholder="Seleccionar Prioridad">
                                <Option value="A">Prioridad A (Alta)</Option>
                                <Option value="B">Prioridad B (Media)</Option>
                                <Option value="C">Prioridad C (Baja)</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="department" label="Departamento">
                            <Select 
                                placeholder="Seleccionar o crear Departamento"
                                dropdownRender={(menu) => renderDropdown(menu, 'department')}
                            >
                                {adminDepartments.map(p => (
                                    <Option key={p} value={p}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{p}</span>
                                            <DeleteOutlined 
                                                style={{ color: '#ff4d4f' }} 
                                                onClick={(e: any) => handleDelete('department', p, e)} 
                                            />
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="position" label="Cargo / Posición" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select 
                                placeholder="Seleccionar o crear Cargo"
                                dropdownRender={(menu) => renderDropdown(menu, 'position')}
                            >
                                {adminPositions.map(p => (
                                    <Option key={p} value={p}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{p}</span>
                                            <DeleteOutlined 
                                                style={{ color: '#ff4d4f' }} 
                                                onClick={(e: any) => handleDelete('position', p, e)} 
                                            />
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="levelAndStep" label="Nivel y Paso (Escala)">
                            <Select 
                                placeholder="Seleccionar o crear Nivel"
                                dropdownRender={(menu) => renderDropdown(menu, 'level')}
                            >
                                {adminLevels.map(p => (
                                    <Option key={p} value={p}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{p}</span>
                                            <DeleteOutlined 
                                                style={{ color: '#ff4d4f' }} 
                                                onClick={(e: any) => handleDelete('level', p, e)} 
                                            />
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="schedule" label="Horario">
                            <Select placeholder="Seleccionar Horario">
                                <Option value="Tiempo Completo">Tiempo Completo</Option>
                                <Option value="Medio Tiempo">Medio Tiempo</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="country" label="País">
                            <Select placeholder="Seleccionar País">
                                {COUNTRIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="stateId" label="Estado (Venezuela)" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select showSearch placeholder="Seleccionar estado">
                                {VENEZUELA_STATES.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        {/* <Form.Item name="vacanciesCount" label="Nro. de Vacantes" rules={[{ required: true, message: 'Requerido' }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item> */}
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="requestDate"
                            label="Fecha de Solicitud"
                            extra="Si no se modifica, se asignará la fecha de hoy."
                        >
                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="isConfidential" valuePropName="checked" style={{ marginBottom: 8 }}>
                    <Checkbox>
                        <span style={{ color: isConfidential ? '#ff4d4f' : 'inherit', fontWeight: isConfidential ? 600 : 400 }}>
                            {isConfidential && <WarningOutlined style={{ marginRight: 8 }} />}
                            ¿Esta vacante es Confidencial?
                        </span>
                    </Checkbox>
                </Form.Item>

                <Form.Item name="comments" label="Comentarios / Observaciones">
                    <TextArea rows={3} placeholder="Agrega notas o comentarios adicionales..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RequisitionForm;
