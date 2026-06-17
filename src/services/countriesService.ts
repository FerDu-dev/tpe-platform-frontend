import { api } from './api';

export interface Country {
    id: number;
    name: string;
}

export const countriesService = {
    getAllCountries: async (): Promise<Country[]> => {
        const response = await api.get('/countries');
        return response.data;
    }
};
