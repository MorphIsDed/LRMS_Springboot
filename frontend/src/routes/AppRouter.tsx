import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../views/LoginPage";
import { SignupPage } from "../views/SignupPage";
import { UnauthorizedPage } from "../views/UnauthorizedPage";
import { GuestBookingPortal } from "../views/GuestBookingPortal";
import { ReceptionistDashboard } from "../views/ReceptionistDashboard";
import { WaiterPOS } from "../views/WaiterPOS";
import { KitchenDisplay } from "../views/KitchenDisplay";
import { AdminDashboard } from "../views/AdminDashboard";
import { MyBookingsPage } from "../views/MyBookingsPage";
import { DashboardRedirect } from "../views/DashboardRedirect";
import { PartnerApiDashboard } from "../views/PartnerApiDashboard";
import { UserManagementPage } from "../views/UserManagementPage";
import { RoomsPage } from "../views/RoomsPage";
import { SettingsPage } from "../views/SettingsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/book" element={<GuestBookingPortal />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/partner-api" element={<PartnerApiDashboard />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN"]} />}>
        <Route path="/reception" element={<ReceptionistDashboard />} />
        <Route path="/rooms" element={<RoomsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST", "WAITER"]} />}>
        <Route path="/bookings" element={<ReceptionistDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["WAITER", "ADMIN", "CHEF"]} />}>
        <Route path="/pos" element={<WaiterPOS />} />
        <Route path="/menu" element={<WaiterPOS />} />
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

