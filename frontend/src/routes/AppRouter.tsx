import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../views/LoginPage";
import { UnauthorizedPage } from "../views/UnauthorizedPage";
import { GuestBookingPortal } from "../views/GuestBookingPortal";
import { ReceptionistDashboard } from "../views/ReceptionistDashboard";
import { WaiterPOS } from "../views/WaiterPOS";
import { KitchenDisplay } from "../views/KitchenDisplay";
import { AdminDashboard } from "../views/AdminDashboard";
import { MyBookingsPage } from "../views/MyBookingsPage";
import { DashboardRedirect } from "../views/DashboardRedirect";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<GuestBookingPortal />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN"]} />}>
        <Route path="/reception" element={<ReceptionistDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["WAITER", "ADMIN"]} />}>
        <Route path="/pos" element={<WaiterPOS />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["CHEF", "ADMIN"]} />}>
        <Route path="/kitchen" element={<KitchenDisplay />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["GUEST"]} />}>
        <Route path="/my-bookings" element={<MyBookingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

