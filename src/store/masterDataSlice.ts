import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Company } from '../types';

interface MasterDataState {
    companies: Company[];
    positions: string[];
    adminPositions: string[];
    adminDepartments: string[];
    adminLevels: string[];
    zones: string[];
    states: string[];
    routes: string[];
}

const initialState: MasterDataState = {
    companies: [],
    positions: ['Asesor Comercial', 'Supervisor', 'Vacacionista', 'Asesor Especializado', 'Coordinador de Zona', 'Adjunto'],
    adminPositions: ['Analista', 'Coordinador', 'Gerente', 'Director'],
    adminDepartments: ['Recursos Humanos', 'Finanzas', 'Tecnología', 'Operaciones'],
    adminLevels: ['Junior', 'Semi-Senior', 'Senior', 'Nivel 1, Paso 1'],
    zones: ['8', '21', '22', '34', '46', '56', '63', '69', '76', '77', '89', '91', '93', '95', '102', '103', '107', '136', '137', '141', '154', '168', '172', '174', '185', '196', '211', 'Adjunto', 'Especializado', 'Focalizado', 'Promotor', 'Supervisor'],
    states: [
        'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes',
        'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda',
        'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas',
        'Yaracuy', 'Zulia'
    ],
    routes: []
};

const masterDataSlice = createSlice({
    name: 'masterData',
    initialState,
    reducers: {
        setCompanies: (state, action: PayloadAction<Company[]>) => {
            state.companies = action.payload;
        },
        addCompany: (state, action: PayloadAction<Company>) => {
            if (!state.companies.find(c => c.id === action.payload.id)) {
                state.companies.push(action.payload);
                state.companies.sort((a, b) => a.name.localeCompare(b.name));
            }
        },
        addPosition: (state, action: PayloadAction<string>) => {
            if (!state.positions.includes(action.payload)) {
                state.positions.push(action.payload);
                state.positions.sort();
            }
        },
        addZone: (state, action: PayloadAction<string>) => {
            if (!state.zones.includes(action.payload)) {
                state.zones.push(action.payload);
                state.zones.sort();
            }
        },
        addRoute: (state, action: PayloadAction<string>) => {
            if (!state.routes.includes(action.payload)) {
                state.routes.push(action.payload);
                state.routes.sort();
            }
        },
        
        addAdminPosition: (state, action: PayloadAction<string>) => {
            if (!state.adminPositions.includes(action.payload)) {
                state.adminPositions.push(action.payload);
                state.adminPositions.sort();
            }
        },
        removeAdminPosition: (state, action: PayloadAction<string>) => {
            state.adminPositions = state.adminPositions.filter(p => p !== action.payload);
        },
        addAdminDepartment: (state, action: PayloadAction<string>) => {
            if (!state.adminDepartments.includes(action.payload)) {
                state.adminDepartments.push(action.payload);
                state.adminDepartments.sort();
            }
        },
        removeAdminDepartment: (state, action: PayloadAction<string>) => {
            state.adminDepartments = state.adminDepartments.filter(p => p !== action.payload);
        },
        addAdminLevel: (state, action: PayloadAction<string>) => {
            if (!state.adminLevels.includes(action.payload)) {
                state.adminLevels.push(action.payload);
                state.adminLevels.sort();
            }
        },
        removeAdminLevel: (state, action: PayloadAction<string>) => {
            state.adminLevels = state.adminLevels.filter(p => p !== action.payload);
        },
        removePosition: (state, action: PayloadAction<string>) => {
            state.positions = state.positions.filter(p => p !== action.payload);
        }
    }
});

export const { setCompanies, addCompany, addPosition, addZone, addRoute, removePosition, addAdminPosition, removeAdminPosition, addAdminDepartment, removeAdminDepartment, addAdminLevel, removeAdminLevel } = masterDataSlice.actions;

export const selectCompanies = (state: { masterData: MasterDataState }) => state.masterData.companies;
export const selectPositions = (state: { masterData: MasterDataState }) => state.masterData.positions;
export const selectAdminPositions = (state: { masterData: MasterDataState }) => state.masterData.adminPositions;
export const selectAdminDepartments = (state: { masterData: MasterDataState }) => state.masterData.adminDepartments;
export const selectAdminLevels = (state: { masterData: MasterDataState }) => state.masterData.adminLevels;
export const selectZones = (state: { masterData: MasterDataState }) => state.masterData.zones;
export const selectStates = (state: { masterData: MasterDataState }) => state.masterData.states;
export const selectRoutes = (state: { masterData: MasterDataState }) => state.masterData.routes;

export default masterDataSlice.reducer;
