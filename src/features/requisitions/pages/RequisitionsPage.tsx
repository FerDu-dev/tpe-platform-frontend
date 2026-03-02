import React, { useEffect, useState } from 'react';
import { Typography, Button, Pagination } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loadRequisitions } from '../store/requisitionsSlice';
import RequisitionsTable from '../components/RequisitionsTable';
import RequisitionDrawer from '../components/RequisitionDrawer';
import RequisitionForm from '../components/RequisitionForm';
import { Requisition } from '../../../types';

const { Title } = Typography;

const RequisitionsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const meta = useAppSelector(state => state.requisitions.meta);
    const filters = useAppSelector(state => state.requisitions.filters);

    const handleRowClick = (record: Requisition) => {
        setSelectedRequisition(record);
    };

    useEffect(() => {
        dispatch(loadRequisitions({ page: 1 }));
    }, [dispatch, filters]); // Reload on filter change

    const handlePageChange = (page: number, pageSize?: number) => {
        dispatch(loadRequisitions({ page, limit: pageSize || meta?.limit || 10 }));
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Requisiciones
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsFormOpen(true)}
                    size="large"
                >
                    Nueva Requisición
                </Button>
            </div>
            <RequisitionsTable onRowClick={handleRowClick} />

            {meta && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <Pagination
                        current={meta.page}
                        total={meta.total}
                        pageSize={meta.limit}
                        onChange={handlePageChange}
                        showSizeChanger
                        pageSizeOptions={['10', '20', '50']}
                    />
                </div>
            )}

            <RequisitionDrawer
                open={!!selectedRequisition}
                onClose={() => setSelectedRequisition(null)}
                requisition={selectedRequisition}
            />

            <RequisitionForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
            />
        </div>
    );
};

export default RequisitionsPage;
