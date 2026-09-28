import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Loader } from "../../components/loader/Loader";
import { registerUser } from "../../services/auth/authService";

export function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState("");
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

    if (!fullName.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!email.includes("@")) {
      setError("Ingresa un correo válido");
      return;
    }

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres",
      );
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await registerUser(
        fullName,
        email,
        password,
      );

      navigate("/login");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible registrar al usuario",
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
          message="Creando cuenta..."
        />
      )}

      <section className="auth-card">
        <h1>Crear cuenta</h1>

        <p className="auth-subtitle">
          Registra tus datos para comenzar.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">
              Nombre completo
            </label>

            <input
              id="fullName"
              value={fullName}
              disabled={loading}
              autoComplete="name"
              onChange={(event) =>
                setFullName(event.target.value)
              }
            />
          </div>

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
              autoComplete="new-password"
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirmation">
              Confirmar contraseña
            </label>

            <input
              id="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              disabled={loading}
              autoComplete="new-password"
              onChange={(event) =>
                setPasswordConfirmation(
                  event.target.value,
                )
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
            Crear cuenta
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">
            Iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  );
}
