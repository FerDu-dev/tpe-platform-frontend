import React, { useEffect, useState } from 'react';
import { Select, Card, Row, Col, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { setFilters, clearFilters, selectRequisitionsFilters } from '../store/requisitionsSlice';
import { selectPositions } from '../../../store/masterDataSlice';
import { zonesService } from '../../../services/zonesService';
import { BankOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;

const COMPANIES = [
    { id: 1, name: 'Febeca' },
    { id: 2, name: 'Beval' },
    { id: 3, name: 'Sillaca' },
    { id: 4, name: 'Grupo' },
];

const RequisitionFilterBar: React.FC = () => {
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectRequisitionsFilters);
    const positions = useAppSelector(selectPositions);
    const [zones, setZones] = useState<any[]>([]);
    const [loadingZones, setLoadingZones] = useState(false);

    useEffect(() => {
        fetchAllZones(filters.companyId);
    }, [filters.companyId]);

    const fetchAllZones = async (companyId?: number) => {
        setLoadingZones(true);
        try {
            // Fetch with a large limit to allow searching 
            const res = await zonesService.fetchZones(companyId, undefined, 1, 100);
            setZones(res.data || []);
        } catch (error) {
            console.error('Error fetching zones:', error);
        } finally {
            setLoadingZones(false);
        }
    };

    const handleCargoChange = (value: string) => {
        dispatch(setFilters({ search: value }));
    };

    const handleCompanyChange = (value: number) => {
        dispatch(setFilters({ companyId: value, zoneId: undefined }));
    };

    const handleZoneChange = (value: number) => {
        dispatch(setFilters({ zoneId: value }));
    };

    const handleClear = () => {
        dispatch(clearFilters());
    };

    return (
        <Card bodyStyle={{ padding: '16px' }} style={{ marginBottom: 16, borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={7}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            top: -10,
                            left: 10,
                            fontSize: '11px',
                            color: '#2b457c',
                            background: '#fff',
                            padding: '0 4px',
                            zIndex: 1,
                            fontWeight: 600
                        }}>
                            BUSCAR POR CARGO
                        </div>
                        <Select
                            placeholder="Seleccionar Cargo"
                            style={{ width: '100%', height: '40px' }}
                            onChange={handleCargoChange}
                            allowClear
                            showSearch
                            value={filters.search}
                            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                        >
                            {positions.map(p => (
                                <Option key={p} value={p}>{p}</Option>
                            ))}
                        </Select>
                    </div>
                </Col>

                <Col xs={24} sm={7}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            top: -10,
                            left: 10,
                            fontSize: '11px',
                            color: '#2b457c',
                            background: '#fff',
                            padding: '0 4px',
                            zIndex: 1,
                            fontWeight: 600
                        }}>
                            FILTRAR POR EMPRESA
                        </div>
                        <Select
                            placeholder="Todas las empresas"
                            style={{ width: '100%', height: '40px' }}
                            onChange={handleCompanyChange}
                            allowClear
                            value={filters.companyId}
                            prefix={<BankOutlined style={{ color: '#bfbfbf' }} />}
                        >
                            {COMPANIES.map(c => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </div>
                </Col>

                <Col xs={24} sm={7}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            top: -10,
                            left: 10,
                            fontSize: '11px',
                            color: '#2b457c',
                            background: '#fff',
                            padding: '0 4px',
                            zIndex: 1,
                            fontWeight: 600
                        }}>
                            FILTRAR POR ZONA
                        </div>
                        <Select
                            placeholder="Todas las zonas"
                            style={{ width: '100%', height: '40px' }}
                            onChange={handleZoneChange}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            value={filters.zoneId}
                            loading={loadingZones}
                            disabled={loadingZones}
                            prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                        >
                            {zones.map(z => (
                                <Option key={z.id} value={z.id}>{z.name}</Option>
                            ))}
                        </Select>
                    </div>
                </Col>

                <Col xs={24} sm={3} style={{ textAlign: 'center' }}>
                    <Button
                        type="link"
                        onClick={handleClear}
                        style={{ fontSize: '13px', fontWeight: 500, color: '#ff4d4f' }}
                    >
                        Limpiar Filtros
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default RequisitionFilterBar;
