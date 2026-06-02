import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Checkbox, Collapse, Tag, Space, Divider, message, Tabs } from 'antd';
import { SafetyCertificateOutlined, SettingOutlined, ShopOutlined, SolutionOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../app/store';
import { createRole, updateRole } from '../store/rolesSlice';
import { PERMISSIONS } from '../../../utils/permissions';
import { IRole } from '../../../services/rolesService';

const { Panel } = Collapse;

interface RoleFormModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    role?: IRole;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ visible, onCancel, onSuccess, role }) => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('sales');
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const permissionsWatch = Form.useWatch('permissions', form);

    useEffect(() => {
        if (visible) {
            if (role) {
                form.setFieldsValue({
                    name: role.name,
                    description: role.description,
                    permissions: role.permissions || {},
                });
            } else {
                form.resetFields();
            }
            setActiveTab('sales');
        }
    }, [visible, role, form]);

    const handleOk = async () => {
        try {
            // Validamos los campos visibles
            const values = await form.validateFields();
            
            // Obtenemos TODOS los valores del store interno del formulario, 
            // incluyendo los campos que pudieran no estar renderizados o activos
            const allValues = form.getFieldsValue(true);

            // Mezclamos para asegurar que no se pierdan los permisos preexistentes no editados
            const finalData = {
                ...values,
                permissions: {
                    ...(role?.permissions || {}),
                    ...(allValues.permissions || {}),
                    ...(values.permissions || {})
                }
            };

            setLoading(true);

            if (role) {
                await dispatch(updateRole({ id: role.id, data: finalData })).unwrap();
                message.success('Rol actualizado correctamente');
            } else {
                await dispatch(createRole(finalData)).unwrap();
                message.success('Rol creado exitosamente');
            }

            onSuccess();
        } catch (error: any) {
            console.error(error);
            message.error(error.message || 'Error al guardar el rol');
        } finally {
            setLoading(false);
        }
    };

    const renderPanel = (moduleKey: string, label: string) => {
        const modulePermissions = (PERMISSIONS as any)[moduleKey];
        if (!modulePermissions) return null;
        
        const options = Object.keys(modulePermissions).map((permKey) => ({
            label: modulePermissions[permKey],
            value: permKey,
        }));

        const currentSelected = permissionsWatch 
            ? (permissionsWatch[moduleKey]?.length || 0) 
            : (role?.permissions?.[moduleKey]?.length || 0);

        return (
            <Panel
                header={
                    <Space>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                            {label}
                        </span>
                        <Tag color="blue">{currentSelected} de {options.length} permisos</Tag>
                    </Space>
                }
                key={moduleKey}
                style={{ background: '#f8f9fb', borderRadius: '8px', marginBottom: '8px', border: 'none' }}
            >
                <Form.Item 
                    name={['permissions', moduleKey]} 
                    style={{ marginBottom: 0 }}
                    initialValue={role?.permissions?.[moduleKey] || []}
                >
                    <Checkbox.Group
                        options={options}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            padding: '8px 16px'
                        }}
                    />
                </Form.Item>
            </Panel>
        );
    };

    const tabItems = [
        {
            key: 'sales',
            label: <Space><ShopOutlined />Área de Ventas</Space>,
            forceRender: true,
            children: (
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <Collapse ghost expandIconPosition="end">
                        {renderPanel('candidates', 'Candidatos')}
                        {renderPanel('requisitions', 'Requisiciones')}
                        {renderPanel('hires', 'Contrataciones')}
                        {renderPanel('zones', 'Zonas')}
                    </Collapse>
                </div>
            )
        },
        {
            key: 'admin',
            label: <Space><SolutionOutlined />Área Administrativa</Space>,
            forceRender: true,
            children: (
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <Collapse ghost expandIconPosition="end">
                        {renderPanel('adminCandidates', 'Candidatos')}
                        {renderPanel('adminRequisitions', 'Requisiciones')}
                        {renderPanel('adminHires', 'Contrataciones')}
                    </Collapse>
                </div>
            )
        },
        {
            key: 'config',
            label: <Space><SettingOutlined />Configuración</Space>,
            forceRender: true,
            children: (
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <Collapse ghost expandIconPosition="end">
                        {renderPanel('users', 'Usuarios')}
                        {renderPanel('roles', 'Roles')}
                        {renderPanel('companies', 'Compañías')}
                        {renderPanel('dashboard', 'Dashboard (Global)')}
                    </Collapse>
                </div>
            )
        }
    ];

    return (
        <Modal
            title={
                <Space>
                    <SafetyCertificateOutlined style={{ color: '#2b457c' }} />
                    <span style={{ fontWeight: 700 }}>{role ? "Editar Rol" : "Nuevo Rol"}</span>
                </Space>
            }
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={720}
            okText="Guardar"
            cancelText="Cancelar"
            style={{ top: 40 }}
        >
            <Form
                form={form}
                layout="vertical"
                requiredMark="optional"
            >
                <Divider orientation="left" style={{ marginTop: 0 }}>
                    <Space><AppstoreOutlined /> Información General</Space>
                </Divider>

                <Form.Item
                    name="name"
                    label="Nombre del Rol"
                    rules={[{ required: true, message: 'El nombre es obligatorio' }]}
                >
                    <Input placeholder="Ej: Administrador de Reclutamiento" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Descripción"
                >
                    <Input.TextArea rows={2} placeholder="Descripción de las funciones del rol" />
                </Form.Item>

                <Divider orientation="left" style={{ margin: '24px 0 16px 0' }}>
                    <Space><SafetyCertificateOutlined /> Matriz de Permisos</Space>
                </Divider>

                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab} 
                    items={tabItems}
                    type="card"
                    style={{ marginTop: '16px' }}
                />
            </Form>
        </Modal>
    );
};

export default RoleFormModal;
