import React, { useEffect, useState } from 'react';
import { Select, Input, Card, Row, Col } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { setFilters, clearFilters, selectFilters, loadCandidates } from '../store/candidatesSlice';
import { selectZones } from '../../../store/masterDataSlice';
import { municipalityService } from '../../../services/municipalityService';
import type { KanbanStage, State, Municipality } from '../../../types';

const { Option } = Select;

const FilterBar: React.FC = () => {
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectFilters);
    const zones = useAppSelector(selectZones);

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

    const handleStatusChange = (value: KanbanStage) => {
        dispatch(setFilters({ ...filters, status: value }));
    };

    const handleClear = () => {
        dispatch(clearFilters());
    };

    // Trigger load on filter change (if not already handled by hook in parent)
    useEffect(() => {
        dispatch(loadCandidates({}));
    }, [filters, dispatch]);

    return (
        <Card bodyStyle={{ padding: '12px' }} style={{ marginBottom: 16 }}>
            <Row gutter={[12, 12]} align="middle">
                <Col xs={24} sm={4}>
                    <Input
                        placeholder="Buscar..."
                        onChange={handleSearchChange}
                        allowClear
                        value={filters.search}
                    />
                </Col>
                <Col xs={24} sm={4}>
                    <Select
                        placeholder="Estado"
                        style={{ width: '100%' }}
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
                        style={{ width: '100%' }}
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
                        style={{ width: '100%' }}
                        onChange={handleZoneChange}
                        allowClear
                        value={filters.zone}
                    >
                        {zones.map(zone => (
                            <Option key={zone} value={zone}>{zone}</Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={4}>
                    <Select
                        placeholder="Estatus"
                        style={{ width: '100%' }}
                        onChange={handleStatusChange}
                        allowClear
                        value={filters.status}
                    >
                        <Option value="applied">Elegible</Option>
                        <Option value="eligible">Video / Revisión</Option>
                        <Option value="psychotechnical">Psicotécnica</Option>
                        <Option value="interview">Entrevista</Option>
                        <Option value="decision">Decisión / Oferta</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={4} style={{ textAlign: 'center' }}>
                    <a onClick={handleClear} style={{ fontSize: '12px' }}>Limpiar Filtros</a>
                </Col>
            </Row>
        </Card>
    );
};

export default FilterBar;
