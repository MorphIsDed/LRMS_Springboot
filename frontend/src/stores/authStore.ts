import { create } from 'zustand';
import { getCurrentUser } from '../api/auth';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
  fetchUser: async () => {
    try {
      if (localStorage.getItem('token')) {
        const user = await getCurrentUser();
        set({ user });
      }
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
