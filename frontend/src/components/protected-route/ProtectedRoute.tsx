import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { isAuthenticated } from "../../services/auth/authService";

export function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}