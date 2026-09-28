import {
  useRef,
  useState,
  type SyntheticEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { Loader } from "../../components/loader/Loader";

import { loginUser } from "../../services/auth/authService";

import type { LoginFieldErrors } from "../../types/forms/login-field-errors";

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOGIN_LOADER_MIN_TIME = 450;

function wait(
  milliseconds: number,
) {
  return new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

export function LoginPage() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<LoginFieldErrors>(
    {},
  );

  const [loading, setLoading] =
    useState(false);

  const emailRef =
    useRef<HTMLInputElement>(null);

  const passwordRef =
    useRef<HTMLInputElement>(null);

  function clearFieldError(
    field: keyof LoginFieldErrors,
  ) {
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const errors: LoginFieldErrors =
      {};

    const normalizedEmail =
      email.trim();

    if (!normalizedEmail) {
      errors.email =
        "Ingresa tu correo electrónico.";
    } else if (
      !EMAIL_REGEX.test(
        normalizedEmail,
      )
    ) {
      errors.email =
        "Ingresa un correo electrónico válido.";
    }

    if (!password) {
      errors.password =
        "Ingresa tu contraseña.";
    }

    setFieldErrors(errors);

    if (errors.email) {
      emailRef.current?.focus();

      return false;
    }

    if (errors.password) {
      passwordRef.current?.focus();

      return false;
    }

    return true;
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await Promise.all([
        loginUser(
          email.trim(),
          password,
        ),
        wait(
          LOGIN_LOADER_MIN_TIME,
        ),
      ]);

      navigate(
        "/dashboard",
        {
          replace: true,
        },
      );
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

  if (loading) {
    return (
      <Loader
        fullScreen
        message="Iniciando sesión..."
      />
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>
          Iniciar sesión
        </h1>

        <p className="auth-subtitle">
          Ingresa tus datos para
          continuar.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-group">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              ref={emailRef}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              className={
                fieldErrors.email
                  ? "input-error"
                  : ""
              }
              aria-invalid={
                Boolean(
                  fieldErrors.email,
                )
              }
              onChange={(event) => {
                setEmail(
                  event.target.value,
                );

                clearFieldError(
                  "email",
                );
              }}
            />

            {fieldErrors.email && (
              <span className="field-error">
                {
                  fieldErrors.email
                }
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              ref={passwordRef}
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              className={
                fieldErrors.password
                  ? "input-error"
                  : ""
              }
              aria-invalid={
                Boolean(
                  fieldErrors.password,
                )
              }
              onChange={(event) => {
                setPassword(
                  event.target.value,
                );

                clearFieldError(
                  "password",
                );
              }}
            />

            {fieldErrors.password && (
              <span className="field-error">
                {
                  fieldErrors.password
                }
              </span>
            )}
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