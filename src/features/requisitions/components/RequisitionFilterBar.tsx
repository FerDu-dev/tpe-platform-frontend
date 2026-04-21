import React, { useEffect, useState } from 'react';
import { Select, Card, Row, Col, Button, Tooltip as AntTooltip } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { setFilters, clearFilters, selectRequisitionsFilters } from '../store/requisitionsSlice';
import { selectPositions } from '../../../store/masterDataSlice';
import { zonesService } from '../../../services/zonesService';
import { 
    BankOutlined, 
    EnvironmentOutlined, 
    UserOutlined, 
    FileSearchOutlined,
    ClearOutlined
} from '@ant-design/icons';

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
    const requisitions = useAppSelector(state => state.requisitions.requisitions);
    const [zones, setZones] = useState<any[]>([]);
    const [loadingZones, setLoadingZones] = useState(false);

    useEffect(() => {
        fetchAllZones(filters.companyId);
    }, [filters.companyId]);

    const fetchAllZones = async (companyId?: number) => {
        setLoadingZones(true);
        try {
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
        dispatch(setFilters({ companyId: value, zoneId: undefined, jobRequisitionId: undefined }));
    };

    const handleRequisitionChange = (value: number) => {
        dispatch(setFilters({ jobRequisitionId: value }));
    };

    const handleZoneChange = (value: number) => {
        dispatch(setFilters({ zoneId: value }));
    };

    const handleClear = () => {
        dispatch(clearFilters());
    };

    return (
        <Card bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 0, borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Row gutter={[12, 12]} align="middle">
                <Col xs={24} sm={4}>
                    <div style={filterStyles.wrapper}>
                        <div style={filterStyles.label}>EMPRESA</div>
                        <Select
                            placeholder="Todas"
                            style={filterStyles.select}
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

                <Col xs={24} sm={5}>
                    <div style={filterStyles.wrapper}>
                        <div style={filterStyles.label}>BUSCAR CARGO</div>
                        <Select
                            placeholder="Todos los cargos"
                            style={filterStyles.select}
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

                <Col xs={24} sm={5}>
                    <div style={filterStyles.wrapper}>
                        <div style={filterStyles.label}>ZONA GEOGRÁFICA</div>
                        <Select
                            placeholder="Todas las zonas"
                            style={filterStyles.select}
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

                <Col xs={24} sm={7}>
                    <div style={filterStyles.wrapper}>
                        <div style={filterStyles.label}>VACANTE ESPECÍFICA</div>
                        <Select
                            placeholder={filters.companyId ? "Seleccionar Vacante" : "Seleccione Empresa arriba"}
                            style={filterStyles.select}
                            onChange={handleRequisitionChange}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            value={filters.jobRequisitionId}
                            disabled={!filters.companyId}
                            prefix={<FileSearchOutlined style={{ color: '#bfbfbf' }} />}
                        >
                            {requisitions.map(r => (
                                <Option key={r.id} value={Number(r.id)}>{r.idx} - {r.title}</Option>
                            ))}
                        </Select>
                    </div>
                </Col>

                <Col xs={24} sm={3} style={{ textAlign: 'right' }}>
                    <AntTooltip title="Limpiar todos los filtros">
                        <Button
                            type="text"
                            icon={<ClearOutlined />}
                            onClick={handleClear}
                            style={{ color: '#ff4d4f', fontWeight: 600 }}
                        >
                            Limpiar
                        </Button>
                    </AntTooltip>
                </Col>
            </Row>
        </Card>
    );
};

const filterStyles = {
    wrapper: { position: 'relative' as const },
    label: {
        position: 'absolute' as const,
        top: -10,
        left: 10,
        fontSize: '10px',
        color: '#2b457c',
        background: '#fff',
        padding: '0 4px',
        zIndex: 1,
        fontWeight: 700,
        letterSpacing: '0.5px'
    },
    select: { width: '100%', height: '40px' }
};

export default RequisitionFilterBar;
