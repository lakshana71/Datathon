// CrimeSphere AI — Zustand Case Store
import { create } from 'zustand';
import type { Case } from '../types';
import { MOCK_CASES } from '../constants/mockData';

interface CaseState {
  cases: Case[];
  activeFilter: string;
  selectedCaseId: string | null;
  searchQuery: string;
  isLoading: boolean;
  setFilter: (filter: string) => void;
  setSelectedCase: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  getCaseById: (id: string) => Case | undefined;
  getFilteredCases: () => Case[];
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: MOCK_CASES,
  activeFilter: 'all',
  selectedCaseId: null,
  searchQuery: '',
  isLoading: false,

  setFilter: (filter) => set({ activeFilter: filter }),
  setSelectedCase: (id) => set({ selectedCaseId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getCaseById: (id) => get().cases.find((c) => c.id === id),

  getFilteredCases: () => {
    const { cases, activeFilter, searchQuery } = get();
    let filtered = cases;

    if (activeFilter !== 'all') {
      if (activeFilter === 'urgent') {
        filtered = filtered.filter((c) => c.priority === 'urgent');
      } else if (activeFilter === 'unassigned') {
        filtered = filtered.filter((c) => !c.investigatingOfficer);
      } else {
        filtered = filtered.filter((c) => c.category === activeFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.complainant.toLowerCase().includes(q) ||
          c.investigatingOfficer.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.entities.some((e) => e.toLowerCase().includes(q))
      );
    }

    return filtered;
  },
}));
