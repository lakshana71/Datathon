// CrimeSphere AI — Zustand Auth Store
import { create } from 'zustand';
import type { Officer } from '../types';
import { MOCK_OFFICER } from '../constants/mockData';

interface AuthState {
  isAuthenticated: boolean;
  officer: Officer | null;
  isLoading: boolean;
  error: string | null;
  login: (badgeNumber: string, pin: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  officer: null,
  isLoading: false,
  error: null,

  login: async (badgeNumber: string, pin: string) => {
    set({ isLoading: true, error: null });
    // Simulate API call — replace with FastAPI endpoint
    await new Promise((resolve) => setTimeout(resolve, 1200));
    // Mock validation
    if (badgeNumber === 'KSP-WF-4421' && pin === '1234') {
      set({ isAuthenticated: true, officer: MOCK_OFFICER, isLoading: false });
    } else if (badgeNumber.length > 3 && pin.length >= 4) {
      // Accept any valid-looking credentials for demo
      set({ isAuthenticated: true, officer: MOCK_OFFICER, isLoading: false });
    } else {
      set({ error: 'Invalid badge number or PIN. Please try again.', isLoading: false });
    }
  },

  logout: () => {
    set({ isAuthenticated: false, officer: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
