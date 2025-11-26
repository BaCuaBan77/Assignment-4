import { apiClient } from './client';

export interface Observation {
  id: string;
  sensor_id: string;
  value: number;
  timestamp: number;
}

export const observationApi = {
  getAll: async (): Promise<Observation[]> => {
    const response = await apiClient.get<Observation[]>('/observations');
    return response.data;
  },

  getById: async (id: string): Promise<Observation> => {
    const response = await apiClient.get<Observation>(`/observations/${id}`);
    return response.data;
  },

  getBySensorId: async (sensorId: string, limit?: number): Promise<Observation[]> => {
    const params = limit ? { limit } : {};
    const response = await apiClient.get<Observation[]>(
      `/sensors/${sensorId}/observations`,
      { params }
    );
    return response.data;
  },

  create: async (observation: Omit<Observation, 'id'>): Promise<Observation> => {
    const response = await apiClient.post<Observation>('/observations', observation);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/observations/${id}`);
  },
};

