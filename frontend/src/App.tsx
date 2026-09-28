import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/login/RegisterPage";
import { Loader } from "./components/loader/Loader";
import { ProtectedRoute } from "./components/protected-route/ProtectedRoute";

export default function App() {
  const [initializing, setInitializing] =
    useState(true);

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        setInitializing(false);
      }, 450);

    return () =>
      window.clearTimeout(
        timeout,
      );
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
        path="/register"
        element={
          <RegisterPage />
        }
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

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
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}