// CrimeSphere AI — Zustand UI Store
import { create } from 'zustand';

interface UIState {
  isDrawerOpen: boolean;
  activeScreen: string;
  notificationCount: number;
  isSearchVisible: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setActiveScreen: (screen: string) => void;
  setNotificationCount: (count: number) => void;
  decrementNotifications: () => void;
  setSearchVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isDrawerOpen: false,
  activeScreen: 'ControlRoom',
  notificationCount: 2,
  isSearchVisible: false,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setNotificationCount: (count) => set({ notificationCount: count }),
  decrementNotifications: () =>
    set((state) => ({ notificationCount: Math.max(0, state.notificationCount - 1) })),
  setSearchVisible: (visible) => set({ isSearchVisible: visible }),
}));
