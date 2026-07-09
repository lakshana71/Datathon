// CrimeSphere AI — Cases API
import { axiosClient } from './axiosClient';
import type { Case } from '../types';
import { MOCK_CASES } from '../constants/mockData';

const USE_MOCK = true; // Set to false when FastAPI is ready

export const casesApi = {
  getAll: async (): Promise<Case[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      return MOCK_CASES;
    }
    const { data } = await axiosClient.get<Case[]>('/cases');
    return data;
  },

  getById: async (id: string): Promise<Case> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const found = MOCK_CASES.find((c) => c.id === id);
      if (!found) throw new Error(`Case ${id} not found`);
      return found;
    }
    const { data } = await axiosClient.get<Case>(`/cases/${id}`);
    return data;
  },

  search: async (query: string): Promise<Case[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const q = query.toLowerCase();
      return MOCK_CASES.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.complainant.toLowerCase().includes(q)
      );
    }
    const { data } = await axiosClient.get<Case[]>('/cases/search', { params: { q: query } });
    return data;
  },
};
