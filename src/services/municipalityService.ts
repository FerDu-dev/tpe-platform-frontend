import { api } from './api';
import { State, Municipality } from '../types';

export const municipalityService = {
    async getStates(): Promise<State[]> {
        // States can be fetched from a potential /states endpoint if it existed, 
        // or we use the municipalities endpoint or a hardcoded list if small.
        // For now, let's assume we use /municipalities and extract states if needed,
        // or better, implement a simple cache/fetch.
        const response = await api.get('/municipalities');
        const municipalities: Municipality[] = response.data;

        const stateMap = new Map<number, State>();
        municipalities.forEach(m => {
            if (m.state && !stateMap.has(m.stateId)) {
                stateMap.set(m.stateId, m.state);
            }
        });

        return Array.from(stateMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    },

    async getMunicipalities(stateId?: number): Promise<Municipality[]> {
        const response = await api.get('/municipalities', {
            params: stateId ? { stateId } : {}
        });
        return response.data;
    }
};
