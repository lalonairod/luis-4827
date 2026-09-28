import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { isAuthenticated } from "../../services/auth/authService";

/**
 * Componente encargado de proteger las rutas que requieren
 * una sesión de usuario válida.
 *
 * Si el usuario no se encuentra autenticado, redirige
 * automáticamente a la pantalla de inicio de sesión.
 *
 * Cuando la sesión es válida, permite renderizar la ruta
 * protegida mediante Outlet.
 *
 * @returns La ruta protegida o una redirección al login.
 */
export function ProtectedRoute() {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}