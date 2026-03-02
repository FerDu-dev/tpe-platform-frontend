import React, { useState } from 'react';
import { Table, Tag, Button, Typography, Empty, Space } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector } from '../../../app/store';
import { selectUsers, selectUsersLoading } from '../store/usersSlice';
import type { User } from '../../../types';
import EditProfileModal from './EditProfileModal';
import { selectCurrentUser } from '../../auth/store/authSlice';

const { Text } = Typography;

const UsersTable: React.FC = () => {
    const users = useAppSelector(selectUsers);
    const loading = useAppSelector(selectUsersLoading);
    const currentUser = useAppSelector(selectCurrentUser);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const getRoleColor = (role: string): string => {
        switch (role.toLowerCase()) {
            case 'administrador':
                return 'red';
            case 'coordinador':
                return 'blue';
            case 'reclutador':
                return 'green';
            default:
                return 'default';
        }
    };

    const columns: ColumnsType<User> = [
        {
            title: 'Usuario',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (fullName: string, record: User) => (
                <Space>
                    <UserOutlined style={{ color: '#2b457c' }} />
                    <div>
                        <Text strong>{fullName || record.username}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.email}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            width: 140,
            filters: [
                { text: 'Administrador', value: 'Administrador' },
                { text: 'Coordinador', value: 'Coordinador' },
                { text: 'Reclutador', value: 'Reclutador' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role: string) => (
                <Tag color={getRoleColor(role)} style={{ fontWeight: 'bold' }}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Teléfono',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (phone?: string) => phone || '-',
        },
        {
            title: 'Fecha de Registro',
            dataIndex: 'createdDate',
            key: 'createdDate',
            width: 140,
            sorter: (a, b) => {
                if (!a.createdDate || !b.createdDate) return 0;
                return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
            },
            render: (date?: string) =>
                date ? new Date(date).toLocaleDateString('es-VE') : '-',
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 120,
            align: 'center',
            render: (_, record: User) => {
                const isCurrentUser = currentUser?.id === record.id;
                return (
                    <Button
                        type={isCurrentUser ? 'primary' : 'default'}
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => setEditingUser(record)}
                        disabled={!isCurrentUser}
                    >
                        {isCurrentUser ? 'Editar Perfil' : 'Ver'}
                    </Button>
                );
            },
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} usuarios`,
                }}
                size="middle"
                locale={{
                    emptyText: (
                        <Empty
                            description="No hay usuarios registrados"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ),
                }}
                style={{
                    background: 'white',
                }}
            />
            {editingUser && (
                <EditProfileModal
                    user={editingUser}
                    visible={!!editingUser}
                    onClose={() => setEditingUser(null)}
                />
            )}
        </>
    );
};

export default UsersTable;
