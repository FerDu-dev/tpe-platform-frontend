import React, { useEffect } from 'react';
import { Typography } from 'antd';
import { useAppDispatch } from '../../../app/store';
import { loadUsers } from '../store/usersSlice';
import UsersTable from '../components/UsersTable';

const { Title } = Typography;

const UsersPage: React.FC = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(loadUsers());
    }, [dispatch]);

    return (
        <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
                Gestión de Usuarios
            </Title>
            <UsersTable />
        </div>
    );
};

export default UsersPage;
