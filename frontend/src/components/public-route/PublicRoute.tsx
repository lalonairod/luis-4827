import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { isAuthenticated } from "../../services/auth/authService";

/**
 * Componente encargado de controlar el acceso
 * a las rutas públicas de la aplicación.
 *
 * Si el usuario ya cuenta con una sesión válida,
 * lo redirige automáticamente al dashboard.
 *
 * Cuando no existe una sesión activa, permite
 * renderizar la ruta pública mediante Outlet.
 *
 * @returns La ruta pública o una redirección al dashboard.
 */
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