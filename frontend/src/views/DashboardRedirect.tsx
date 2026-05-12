import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function DashboardRedirect() {
  const { role, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  switch (role) {
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    case "RECEPTIONIST":
      return <Navigate to="/reception" replace />;
    case "WAITER":
      return <Navigate to="/pos" replace />;
    case "CHEF":
      return <Navigate to="/kitchen" replace />;
    case "GUEST":
      return <Navigate to="/my-bookings" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

