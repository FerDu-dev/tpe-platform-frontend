import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MasterDataState {
    companies: string[];
    positions: string[];
    zones: string[];
    states: string[];
    routes: string[];
}

const initialState: MasterDataState = {
    companies: ['Beval', 'Febeca', 'Grupo', 'Sillaca'],
    positions: ['Asesor Comercial', 'Supervisor', 'Vacacionista', 'Asesor Especializado', 'Coordinador de Zona', 'Adjunto'],
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
        addCompany: (state, action: PayloadAction<string>) => {
            if (!state.companies.includes(action.payload)) {
                state.companies.push(action.payload);
                state.companies.sort();
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
        removePosition: (state, action: PayloadAction<string>) => {
            state.positions = state.positions.filter(p => p !== action.payload);
        }
    }
});

export const { addCompany, addPosition, addZone, addRoute, removePosition } = masterDataSlice.actions;

export const selectCompanies = (state: { masterData: MasterDataState }) => state.masterData.companies;
export const selectPositions = (state: { masterData: MasterDataState }) => state.masterData.positions;
export const selectZones = (state: { masterData: MasterDataState }) => state.masterData.zones;
export const selectStates = (state: { masterData: MasterDataState }) => state.masterData.states;
export const selectRoutes = (state: { masterData: MasterDataState }) => state.masterData.routes;

export default masterDataSlice.reducer;
