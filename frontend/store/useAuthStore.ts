import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  xp: number;
  level: number;
  badges: string[];
  isGuest: boolean;
}

const createGuestUser = (): User => ({
  id: 'guest',
  email: '',
  username: 'Guest',
  xp: 0,
  level: 1,
  badges: [],
  isGuest: true,
});

interface AuthStore {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: Omit<User, 'isGuest'>) => void;
  ensureGuestSession: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const authStoreCreator = (
  set: (partial: Partial<AuthStore> | ((state: AuthStore) => Partial<AuthStore>), replace?: boolean, action?: string) => void,
  get: () => AuthStore
): AuthStore => ({
  user: createGuestUser(),
  isAuthenticated: true,
  isLoading: false,

  setUser: (user) =>
    set(
      {
        user: { ...user, isGuest: false },
        isAuthenticated: true,
        isLoading: false,
      },
      false,
      'setUser'
    ),

  ensureGuestSession: () => {
    const currentUser = get().user;
    if (!currentUser || !currentUser.id) {
      set(
        {
          user: createGuestUser(),
          isAuthenticated: true,
          isLoading: false,
        },
        false,
        'ensureGuestSession'
      );
    }
  },

  logout: () =>
    set(
      {
        user: createGuestUser(),
        isAuthenticated: true,
        isLoading: false,
      },
      false,
      'logout'
    ),

  setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
});

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(authStoreCreator, {
      name: 'auth-store',
    })
  )
);
