import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { isAuthenticated } from "../../services/auth/authService";

export function PublicRoute() {
  if (isAuthenticated()) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}