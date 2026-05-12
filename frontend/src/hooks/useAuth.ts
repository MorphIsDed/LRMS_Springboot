import { useMemo } from "react";
import { useAuthStore } from "../stores/authStore";
import type { Role } from "../types/domain";

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const role = useAuthStore((s) => s.role);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const error = useAuthStore((s) => s.error);
  const setToken = useAuthStore((s) => s.setToken);
  const logout = useAuthStore((s) => s.logout);
  const setError = useAuthStore((s) => s.setError);

  return useMemo(
    () => ({ token, userId, role, isLoggedIn, error, setToken, logout, setError }),
    [token, userId, role, isLoggedIn, error, setToken, logout, setError]
  );
}

export function hasRole(current: Role | null, allowed: Role[]) {
  if (!current) return false;
  return allowed.includes(current);
}

