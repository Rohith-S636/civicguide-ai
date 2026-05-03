import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>()(
  devtools((set) => ({
    sidebarOpen: true,
    toggleSidebar: () =>
      set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    theme: 'light',
    setTheme: (theme) => set({ theme }),
  }))
);
