import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { Role } from '../types/domain';

interface AuthState {
  token: string | null;
  userId: string | null;
  role: Role | null;
  isLoggedIn: boolean;
  error: string | null;
  setToken: (token: string, role?: string, userId?: string) => void;
  logout: () => void;
  setError: (msg: string | null) => void;
}

const getInitialState = () => {
  const token = localStorage.getItem('token');
  if (!token) return { token: null, userId: null, role: null, isLoggedIn: false, error: null };
  try {
    const decoded = jwtDecode<any>(token);
    return {
      token,
      userId: decoded.sub || null, // Standard JWT subject
      role: decoded.role || null,
      isLoggedIn: true,
      error: null,
    };
  } catch (err) {
    localStorage.removeItem('token');
    return { token: null, userId: null, role: null, isLoggedIn: false, error: null };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  setToken: (token: string, role?: string, userId?: string) => {
    localStorage.setItem('token', token);
    try {
      const decoded = jwtDecode<any>(token);
      set({ 
        token, 
        isLoggedIn: true, 
        role: (role || decoded.role) as Role, 
        userId: userId || decoded.sub || null 
      });
    } catch (err) {
      set({ token, isLoggedIn: true, role: role as Role, userId: userId || null });
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, userId: null, role: null, isLoggedIn: false, error: null });
  },
  setError: (msg: string | null) => set({ error: msg }),
}));
