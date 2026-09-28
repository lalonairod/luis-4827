import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Loader } from "./components/loader/Loader";

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
 * - Validar el estado inicial de la sesión.
 * - Mostrar un loader durante la inicialización.
 * - Configurar las rutas públicas.
 * - Configurar las rutas protegidas.
 * - Redirigir rutas desconocidas según el estado de autenticación.
 *
 * @returns La configuración principal de rutas de la aplicación.
 */
export default function App() {
  const [
    initializing,
    setInitializing,
  ] = useState(true);

  /**
   * Realiza la validación inicial de la sesión almacenada.
   *
   * La función isAuthenticated también se encarga de limpiar
   * sesiones inválidas o inconsistentes antes de renderizar
   * las rutas de la aplicación.
   */
  useEffect(() => {
    isAuthenticated();

    setInitializing(false);
  }, []);

  if (initializing) {
    return (
      <Loader
        fullScreen
        message="Preparando aplicación..."
      />
    );
  }

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