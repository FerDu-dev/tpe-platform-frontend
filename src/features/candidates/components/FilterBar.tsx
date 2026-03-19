import React, { useEffect, useState } from 'react';
import { Select, Input, Card, Row, Col, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { setFilters, clearFilters, selectFilters } from '../store/candidatesSlice';
import { selectZones } from '../../../store/masterDataSlice';
import { selectStages } from '../../../store/workflowSlice';
import { municipalityService } from '../../../services/municipalityService';
import type { State, Municipality } from '../../../types';

const { Option } = Select;

interface FilterBarProps {
    category?: 'eligible' | 'not_eligible' | 'rejected';
}

const FilterBar: React.FC<FilterBarProps> = ({ category = 'eligible' }) => {
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectFilters);
    const zones = useAppSelector(selectZones);

    const stages = useAppSelector(selectStages);

    const [states, setStates] = useState<State[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

    useEffect(() => {
        municipalityService.getStates().then(setStates);
    }, []);

    useEffect(() => {
        if (filters.stateId) {
            municipalityService.getMunicipalities(filters.stateId).then(setMunicipalities);
        } else {
            setMunicipalities([]);
        }
    }, [filters.stateId]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilters({ ...filters, search: e.target.value }));
    };

    // const handleProfessionChange = (value: string) => {
    //     dispatch(setFilters({ ...filters, profession: value }));
    // };

    const handleStateChange = (value: number) => {
        dispatch(setFilters({ ...filters, stateId: value, municipalityId: undefined }));
    };

    const handleMunicipalityChange = (value: number) => {
        dispatch(setFilters({ ...filters, municipalityId: value }));
    };

    const handleZoneChange = (value: string) => {
        dispatch(setFilters({ ...filters, zone: value }));
    };

    const handleStageChange = (value: number) => {
        dispatch(setFilters({ ...filters, stageId: value }));
    };

    const handleClear = () => {
        dispatch(clearFilters());
    };

    // Removed redundant loadCandidates trigger, handled in parent DashboardPage

    return (
        <Card bodyStyle={{ padding: '12px' }} style={{ marginBottom: 16 }}>
            <Row gutter={[12, 12]} align="middle">
                {category === 'eligible' && (
                    <Col xs={24} sm={8}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                top: -10,
                                left: 10,
                                fontSize: '11px',
                                color: '#1890ff',
                                background: '#fff',
                                padding: '0 4px',
                                zIndex: 1,
                                fontWeight: 600
                            }}>
                                FILTRAR POR ETAPA
                            </div>
                            <Select
                                placeholder="Seleccionar Fase"
                                style={{
                                    width: '100%',
                                    height: '40px'
                                }}
                                onChange={handleStageChange}
                                allowClear
                                onClear={() => dispatch(setFilters({ ...filters, stageId: undefined }))}
                                value={filters.stageId}
                                dropdownStyle={{ minWidth: '200px' }}
                            >
                                {stages.map(stage => (
                                    <Option key={stage.id} value={stage.id}>{stage.name}</Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                )}
                <Col xs={24} sm={category === 'eligible' ? 4 : 5}>
                    <Input
                        placeholder="Buscar nombre..."
                        onChange={handleSearchChange}
                        allowClear
                        value={filters.search}
                        style={{ height: '40px' }}
                    />
                </Col>
                <Col xs={24} sm={3}>
                    <Select
                        placeholder="Estado"
                        style={{ width: '100%', height: '40px' }}
                        onChange={handleStateChange}
                        allowClear
                        value={filters.stateId}
                    >
                        {states.map(s => (
                            <Option key={s.id} value={s.id}>{s.name}</Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={4}>
                    <Select
                        placeholder="Municipio"
                        style={{ width: '100%', height: '40px' }}
                        onChange={handleMunicipalityChange}
                        allowClear
                        value={filters.municipalityId}
                        disabled={!filters.stateId}
                    >
                        {municipalities.map(m => (
                            <Option key={m.id} value={m.id}>{m.name}</Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={4}>
                    <Select
                        placeholder="Zona"
                        style={{ width: '100%', height: '40px' }}
                        onChange={handleZoneChange}
                        allowClear
                        value={filters.zone}
                    >
                        {zones.map(zone => (
                            <Option key={zone} value={zone}>{zone}</Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={3} style={{ textAlign: 'center' }}>
                    <Button
                        type="link"
                        onClick={handleClear}
                        style={{ fontSize: '12px', padding: 0 }}
                    >
                        Limpiar Filtros
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default FilterBar;
