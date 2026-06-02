import React from 'react';
import { Select, Card, Row, Col, Button, Tooltip as AntTooltip, Input } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { setFilters, clearFilters, selectRequisitionsFilters } from '../store/adminRequisitionsSlice';
import { selectCompanies } from '../../../store/masterDataSlice';
import { 
    UserOutlined, 
    ClearOutlined
} from '@ant-design/icons';

const { Option } = Select;


const RequisitionFilterBar: React.FC = () => {
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectRequisitionsFilters);
    const companies = useAppSelector(selectCompanies);
    const requisitions = useAppSelector(state => state.adminRequisitions.requisitions);

    const handleCargoChange = (value: string) => {
        dispatch(setFilters({ search: value }));
    };

    const handleCompanyChange = (value: number) => {
        dispatch(setFilters({ companyId: value, jobRequisitionId: undefined }));
    };

    const handleRequisitionChange = (value: number) => {
        dispatch(setFilters({ jobRequisitionId: value }));
    };

    const handleClear = () => {
        dispatch(clearFilters());
    };

    return (
        <Card bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 0, borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Row gutter={[12, 12]} align="middle">
                <Col xs={24} sm={5}>
                    <div style={filterStyles.wrapper}>
                        <div style={filterStyles.label}>EMPRESA</div>
                        <Select
                            placeholder="Todas"
                            style={filterStyles.select}
                            onChange={handleCompanyChange}
                            allowClear
                            value={filters.companyId}
                        >
                            {companies.map(c => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </div>
                </Col>

                <Col xs={24} sm={5}>
                    <div style={filterStyles.wrapper}>
                        <div style={filterStyles.label}>TIPO</div>
                        <Select
                            placeholder="Todos"
                            style={filterStyles.select}
                            onChange={(value) => dispatch(setFilters({ type: value }))}
                            allowClear
                            value={filters.type as string | undefined}
                        >
                            <Option value="Profesional">Profesional</Option>
                            <Option value="Pasantía">Pasantía</Option>
                        </Select>
                    </div>
                </Col>

                <Col xs={24} sm={5}>
                    <div style={filterStyles.wrapper}>
                        <div style={filterStyles.label}>BUSCAR CARGO</div>
                        <Input
                            placeholder="Buscar por cargo..."
                            style={filterStyles.select}
                            onChange={(e) => handleCargoChange(e.target.value)}
                            allowClear
                            value={filters.search}
                            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                        />
                    </div>
                </Col>

                <Col xs={24} sm={6}>
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
                        >
                            {requisitions.map(r => (
                                <Option key={r.id} value={Number(r.id)}>{r.idx} - {r.position} ({r.type || 'N/A'})</Option>
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
