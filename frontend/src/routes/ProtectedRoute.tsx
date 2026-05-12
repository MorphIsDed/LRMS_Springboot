import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../types/domain";
import { useToastStore } from "../stores/toastStore";
import { useAuth, hasRole } from "../hooks/useAuth";

export function ProtectedRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const location = useLocation();
  const toast = useToastStore();
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    toast.push({ type: "warning", message: "Please log in." });
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasRole(role, allowedRoles)) {
    // eslint-disable-next-line no-console
    console.error("[auth] role mismatch", { role, allowedRoles });
    toast.push({ type: "error", message: "Unauthorized." });
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

