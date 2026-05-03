import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  xp: number;
  level: number;
  badges: string[];
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,

        setUser: (user) =>
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          }),

        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }),

        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'auth-store',
      }
    )
  )
);
