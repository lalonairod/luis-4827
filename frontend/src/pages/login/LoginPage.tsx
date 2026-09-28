import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Loader } from "../../components/loader/Loader";
import { loginUser } from "../../services/auth/authService";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      {loading && (
        <Loader
          fullScreen
          message="Iniciando sesión..."
        />
      )}

      <section className="auth-card">
        <h1>Iniciar sesión</h1>

        <p className="auth-subtitle">
          Ingresa tus datos para continuar.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              disabled={loading}
              autoComplete="email"
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              disabled={loading}
              autoComplete="current-password"
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            Entrar
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta?{" "}
          <Link to="/register">
            Registrarte
          </Link>
        </p>
      </section>
    </main>
  );
}
