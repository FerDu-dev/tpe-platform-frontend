import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Checkbox, Collapse, Tag, Space, Divider, message } from 'antd';
import { SafetyCertificateOutlined, SettingOutlined } from '@ant-design/icons';
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
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

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
        }
    }, [visible, role, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (role) {
                await dispatch(updateRole({ id: role.id, data: values })).unwrap();
                message.success('Rol actualizado correctamente');
            } else {
                await dispatch(createRole(values)).unwrap();
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

    const renderPermissionsCheckboxes = () => {
        return Object.keys(PERMISSIONS).map((moduleKey) => {
            const modulePermissions = (PERMISSIONS as any)[moduleKey];
            const options = Object.keys(modulePermissions).map((permKey) => ({
                label: modulePermissions[permKey],
                value: permKey,
            }));

            return (
                <Panel
                    header={
                        <Space>
                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                {moduleKey === 'requisitions' ? 'Requisiciones' : 
                                 moduleKey === 'candidates' ? 'Candidatos' :
                                 moduleKey === 'hires' ? 'Contrataciones' :
                                 moduleKey === 'zones' ? 'Zonas' :
                                 moduleKey === 'users' ? 'Usuarios' :
                                 moduleKey === 'roles' ? 'Roles' : moduleKey}
                            </span>
                            <Tag color="blue">{options.length} Acciones</Tag>
                        </Space>
                    }
                    key={moduleKey}
                    style={{ background: '#f8f9fb', borderRadius: '8px', marginBottom: '8px', border: 'none' }}
                >
                    <Form.Item name={['permissions', moduleKey]} valuePropName="value" noStyle>
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
        });
    };

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
                    <Space><SettingOutlined /> Información General</Space>
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

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Collapse ghost expandIconPosition="end">
                        {renderPermissionsCheckboxes()}
                    </Collapse>
                </div>
            </Form>
        </Modal>
    );
};

export default RoleFormModal;
