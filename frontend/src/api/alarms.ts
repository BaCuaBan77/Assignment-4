import { apiClient } from './client';

export interface Alarm {
  id: string;
  sensor_id: string;
  alarm_value: number;
  timestamp: number;
}

export const alarmApi = {
  getAll: async (): Promise<Alarm[]> => {
    const response = await apiClient.get<Alarm[]>('/alarms');
    return response.data;
  },

  getById: async (id: string): Promise<Alarm> => {
    const response = await apiClient.get<Alarm>(`/alarms/${id}`);
    return response.data;
  },

  getBySensorId: async (sensorId: string, limit?: number): Promise<Alarm[]> => {
    const params = limit ? { limit } : {};
    const response = await apiClient.get<Alarm[]>(
      `/sensors/${sensorId}/alarms`,
      { params }
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/alarms/${id}`);
  },
};

