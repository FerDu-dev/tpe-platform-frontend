import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Row, Col, Space, Divider, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { createUser, updateUser } from '../store/usersSlice';
import { loadRoles, selectRoles } from '../../roles/store/rolesSlice';
import { User } from '../../../types';

interface UserFormModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    user?: User;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ visible, onCancel, onSuccess, user }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            dispatch(loadRoles());
            if (user) {
                form.setFieldsValue({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    username: user.username,
                    phone: user.phone,
                    roleId: (user as any).roleId || user.role, // Handle mapping if needed
                    isActive: user.isActive !== undefined ? user.isActive : true,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ isActive: true });
            }
        }
    }, [visible, user, form, dispatch]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (user) {
                await dispatch(updateUser({ id: user.id, data: values })).unwrap();
                message.success('Usuario actualizado correctamente');
            } else {
                await dispatch(createUser(values)).unwrap();
                message.success('Usuario creado exitosamente');
            }

            onSuccess();
        } catch (error: any) {
            console.error(error);
            message.error(error.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <UserOutlined style={{ color: '#2b457c' }} />
                    <span style={{ fontWeight: 700 }}>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
                </Space>
            }
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={700}
            okText="Guardar"
            cancelText="Cancelar"
        >
            <Form form={form} layout="vertical" requiredMark="optional">
                <Divider orientation="left" style={{ marginTop: 0 }}>Datos Personales</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="firstName" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
                            <Input placeholder="Nombre" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="lastName" label="Apellido" rules={[{ required: true, message: 'Requerido' }]}>
                            <Input placeholder="Apellido" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email', message: 'Email válido requerido' }]}>
                            <Input prefix={<MailOutlined />} placeholder="email@tpe.com" disabled={!!user} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="phone" label="Teléfono">
                            <Input prefix={<PhoneOutlined />} placeholder="Ej: 04121234567" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Configuración de Cuenta</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="username" label="Nombre de Usuario">
                            <Input prefix={<UserOutlined />} placeholder="usuario_tpe" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {!user && (
                            <Form.Item name="password" label="Contraseña" rules={[{ required: true, message: 'Requerida' }]}>
                                <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
                            </Form.Item>
                        )}
                        {user && (
                            <Form.Item name="password" label="Cambiar Contraseña (opcional)">
                                <Input.Password prefix={<LockOutlined />} placeholder="Dejar en blanco para no cambiar" />
                            </Form.Item>
                        )}
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="roleId" label="Rol" rules={[{ required: true, message: 'Seleccione un rol' }]}>
                            <Select placeholder="Seleccionar rol">
                                {roles.map(role => (
                                    <Select.Option key={role.id} value={role.id}>
                                        <Space>
                                            <SafetyCertificateOutlined />
                                            {role.name}
                                        </Space>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="isActive" label="Estado" valuePropName="checked">
                            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default UserFormModal;
