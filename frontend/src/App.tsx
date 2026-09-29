import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { ProtectedRoute } from "./components/protected-route/ProtectedRoute";
import { PublicRoute } from "./components/public-route/PublicRoute";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/login/RegisterPage";
import { isAuthenticated } from "./services/auth/authService";

/**
 * Componente principal de la aplicación.
 *
 * Se encarga de:
 * - Configurar las rutas públicas.
 * - Configurar las rutas protegidas.
 * - Validar el acceso mediante los componentes de ruta.
 * - Redirigir rutas desconocidas según el estado de autenticación.
 *
 * @returns La configuración principal de rutas de la aplicación.
 */
export default function App() {
  return (
    <Routes>
      <Route
        element={
          <PublicRoute />
        }
      >
        <Route
          path="/register"
          element={
            <RegisterPage />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          path="/dashboard"
          element={
            <DashboardPage />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated()
                ? "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}