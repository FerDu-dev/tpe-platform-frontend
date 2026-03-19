import { api } from './api';
import type { Stage } from '../types';

export const workflowService = {
  getStages: async (workflowId: number): Promise<Stage[]> => {
    const response = await api.get(`/workflows/${workflowId}/stages`);
    return response.data;
  },
};
