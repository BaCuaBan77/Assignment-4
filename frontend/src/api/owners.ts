import { apiClient } from './client';

export interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  dob: string;
}

export const ownerApi = {
  getAll: async (): Promise<Owner[]> => {
    const response = await apiClient.get<Owner[]>('/owners');
    return response.data;
  },

  getById: async (id: string): Promise<Owner> => {
    const response = await apiClient.get<Owner>(`/owners/${id}`);
    return response.data;
  },

  create: async (owner: Omit<Owner, 'id'>): Promise<Owner> => {
    const response = await apiClient.post<Owner>('/owners', owner);
    return response.data;
  },

  update: async (id: string, owner: Partial<Omit<Owner, 'id'>>): Promise<Owner> => {
    const response = await apiClient.put<Owner>(`/owners/${id}`, owner);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/owners/${id}`);
  },

  getFullnamesBatch: async (ids: string[]): Promise<Record<string, string>> => {
    const response = await apiClient.post<Record<string, string>>('/owners/fullnames/batch', { ids });
    return response.data;
  },
};

