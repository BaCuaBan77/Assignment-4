import { apiClient } from './client';

export interface Sensor {
  id: string;
  name: string;
  sensor_type: string;
  unit: string;
  threshold: number;
  owner_id: string;
  location_id: string;
}

export interface SensorWithDetails extends Sensor {
  owner_name?: string;
  location?: string;
  latest_value?: number;
  max_value?: number;
  min_value?: number;
}

export const sensorApi = {
  getAll: async (): Promise<Sensor[]> => {
    const response = await apiClient.get<Sensor[]>('/sensors');
    return response.data;
  },

  getById: async (id: string, withDetails = false): Promise<Sensor | SensorWithDetails> => {
    const response = await apiClient.get<Sensor | SensorWithDetails>(
      `/sensors/${id}${withDetails ? '?details=true' : ''}`
    );
    return response.data;
  },

  create: async (sensor: Omit<Sensor, 'id'>): Promise<Sensor> => {
    const response = await apiClient.post<Sensor>('/sensors', sensor);
    return response.data;
  },

  update: async (id: string, sensor: Partial<Omit<Sensor, 'id'>>): Promise<Sensor> => {
    const response = await apiClient.put<Sensor>(`/sensors/${id}`, sensor);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sensors/${id}`);
  },

  getByOwnerId: async (ownerId: string): Promise<Sensor[]> => {
    const response = await apiClient.get<Sensor[]>(`/owners/${ownerId}/sensors`);
    return response.data;
  },
};

