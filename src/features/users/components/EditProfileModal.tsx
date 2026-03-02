import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { updateUserProfile } from '../store/usersSlice';
import { selectCurrentUser } from '../../auth/store/authSlice';
import type { User } from '../../../types';

interface EditProfileModalProps {
    user: User;
    visible: boolean;
    onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    user,
    visible,
    onClose,
}) => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const isCurrentUser = currentUser?.id === user.id;

    const handleSubmit = async (values: any) => {
        if (!isCurrentUser) {
            message.warning('Solo puedes editar tu propio perfil');
            return;
        }

        setLoading(true);
        try {
            await dispatch(
                updateUserProfile({
                    id: user.id,
                    fullName: values.fullName,
                    phone: values.phone,
                    ...(values.newPassword && { password: values.newPassword }),
                })
            ).unwrap();

            message.success('Perfil actualizado exitosamente');
            form.resetFields();
            onClose();
        } catch (error) {
            message.error('Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={isCurrentUser ? 'Editar Mi Perfil' : 'Ver Perfil de Usuario'}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                }}
            >
                <Form.Item
                    label="Nombre Completo"
                    name="fullName"
                    rules={[
                        { required: true, message: 'Por favor ingresa tu nombre completo' },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Ej: María Fernanda González"
                        disabled={!isCurrentUser}
                    />
                </Form.Item>

                <Form.Item label="Correo Electrónico" name="email">
                    <Input prefix={<UserOutlined />} disabled />
                </Form.Item>

                <Form.Item label="Rol" name="role">
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    label="Teléfono"
                    name="phone"
                    rules={[
                        {
                            pattern: /^\+58\s\d{3}-\d{7}$/,
                            message: 'Formato: +58 412-1234567',
                        },
                    ]}
                >
                    <Input
                        prefix={<PhoneOutlined />}
                        placeholder="+58 412-1234567"
                        disabled={!isCurrentUser}
                    />
                </Form.Item>

                {isCurrentUser && (
                    <>
                        <Form.Item
                            label="Nueva Contraseña"
                            name="newPassword"
                            rules={[
                                {
                                    min: 6,
                                    message: 'La contraseña debe tener al menos 6 caracteres',
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Dejar en blanco para no cambiar"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Confirmar Nueva Contraseña"
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error('Las contraseñas no coinciden')
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Confirmar nueva contraseña"
                            />
                        </Form.Item>
                    </>
                )}

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>Cancelar</Button>
                        {isCurrentUser && (
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Guardar Cambios
                            </Button>
                        )}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditProfileModal;
