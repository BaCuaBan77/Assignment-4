import { apiClient } from './client';

export interface Location {
  id: string;
  longitude: number;
  latitude: number;
  country: string;
  city: string;
}

export const locationApi = {
  getAll: async (): Promise<Location[]> => {
    const response = await apiClient.get<Location[]>('/locations');
    return response.data;
  },

  getLocationStringsBatch: async (ids: string[]): Promise<Record<string, string>> => {
    const response = await apiClient.post<Record<string, string>>('/locations/strings/batch', { ids });
    return response.data;
  },
};

