import React, { useEffect, useState } from 'react';
import { Select, Input, Card, Row, Col, Button, Modal, Tooltip, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { setFilters, clearFilters, selectFilters } from '../store/adminCandidatesSlice';
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
    const stages = useAppSelector(selectStages);

    const [states, setStates] = useState<State[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [isAdvancedModalVisible, setIsAdvancedModalVisible] = useState(false);

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

    const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilters({ ...filters, nationalId: e.target.value || undefined }));
    };

    const handleStateChange = (value: number) => {
        dispatch(setFilters({ ...filters, stateId: value, municipalityId: undefined }));
    };

    const handleMunicipalityChange = (value: number) => {
        dispatch(setFilters({ ...filters, municipalityId: value }));
    };

    const handleStageChange = (value: number) => {
        dispatch(setFilters({ ...filters, stageId: value }));
    };

    const handleCategoryChange = (value: string | undefined) => {
        dispatch(setFilters({ ...filters, category: value }));
    };

    const handleClear = () => {
        dispatch(clearFilters());
    };

    const openAdvancedFilters = () => {
        setIsAdvancedModalVisible(true);
    };

    const closeAdvancedFilters = () => {
        setIsAdvancedModalVisible(false);
    };

    return (
        <Card bodyStyle={{ padding: '12px' }} style={{ marginBottom: 16 }}>
            <Row gutter={[12, 12]} align="middle">
                {category === 'eligible' && (
                    <Col xs={24} sm={6}>
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
                
                <Col xs={24} sm={category === 'eligible' ? 5 : 8}>
                    <Select
                        placeholder="Perfil"
                        style={{ width: '100%', height: '40px' }}
                        onChange={handleCategoryChange}
                        allowClear
                        value={filters.category}
                    >
                        <Option value={undefined}>Todos</Option>
                        <Option value="PROFESSIONAL">Administrador</Option>
                        <Option value="INTERNSHIP">Pasante</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={category === 'eligible' ? 7 : 8}>
                    <Input
                        placeholder="Buscar nombre..."
                        onChange={handleSearchChange}
                        allowClear
                        value={filters.search}
                        style={{ height: '40px' }}
                    />
                </Col>

                <Col xs={24} sm={6}>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Tooltip title="Filtros avanzados">
                            <Button 
                                type="default" 
                                icon={<FilterOutlined />} 
                                onClick={openAdvancedFilters}
                                style={{ height: '40px' }}
                            >
                                Filtros
                            </Button>
                        </Tooltip>
                        <Button
                            type="link"
                            onClick={handleClear}
                            style={{ fontSize: '12px', padding: 0 }}
                        >
                            Limpiar Filtros
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Modal
                title={
                    <Space>
                        <FilterOutlined style={{ color: '#1890ff' }} />
                        <span>Filtros Avanzados</span>
                    </Space>
                }
                open={isAdvancedModalVisible}
                onCancel={closeAdvancedFilters}
                onOk={closeAdvancedFilters}
                okText="Aplicar"
                cancelText="Cerrar"
                destroyOnClose
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    <div>
                        <div style={{ marginBottom: 4, fontWeight: 500, fontSize: '13px' }}>Cédula</div>
                        <Input
                            placeholder="Buscar por cédula..."
                            onChange={handleNationalIdChange}
                            allowClear
                            value={filters.nationalId}
                            style={{ height: '40px' }}
                        />
                    </div>
                    <div>
                        <div style={{ marginBottom: 4, fontWeight: 500, fontSize: '13px' }}>Estado</div>
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
                    </div>
                    <div>
                        <div style={{ marginBottom: 4, fontWeight: 500, fontSize: '13px' }}>Municipio</div>
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
                    </div>
                </div>
            </Modal>
        </Card>
    );
};

export default FilterBar;
