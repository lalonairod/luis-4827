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

import { registerUser } from "../../services/auth/authService";

import type { RegisterFieldErrors } from "../../types/forms/register-field-errors";

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const navigate =
    useNavigate();

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<RegisterFieldErrors>(
      {},
    );

  const [loading, setLoading] =
    useState(false);

  const fullNameRef =
    useRef<HTMLInputElement>(null);

  const emailRef =
    useRef<HTMLInputElement>(null);

  const passwordRef =
    useRef<HTMLInputElement>(null);

  const passwordConfirmationRef =
    useRef<HTMLInputElement>(null);

  function clearFieldError(
    field: keyof RegisterFieldErrors,
  ) {
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const errors: RegisterFieldErrors =
      {};

    const normalizedName =
      fullName.trim();

    const normalizedEmail =
      email.trim();

    if (!normalizedName) {
      errors.fullName =
        "Ingresa tu nombre completo.";
    } else if (
      normalizedName.length < 2
    ) {
      errors.fullName =
        "El nombre debe contener al menos 2 caracteres.";
    }

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
        "Ingresa una contraseña.";
    } else if (
      password.length < 6
    ) {
      errors.password =
        "La contraseña debe tener al menos 6 caracteres.";
    }

    if (!passwordConfirmation) {
      errors.passwordConfirmation =
        "Confirma tu contraseña.";
    } else if (
      password !==
      passwordConfirmation
    ) {
      errors.passwordConfirmation =
        "Las contraseñas no coinciden.";
    }

    setFieldErrors(errors);

    if (errors.fullName) {
      fullNameRef.current?.focus();

      return false;
    }

    if (errors.email) {
      emailRef.current?.focus();

      return false;
    }

    if (errors.password) {
      passwordRef.current?.focus();

      return false;
    }

    if (
      errors.passwordConfirmation
    ) {
      passwordConfirmationRef.current?.focus();

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
      await registerUser(
        fullName.trim(),
        email.trim(),
        password,
      );

      navigate("/login");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Ya existe un usuario con ese correo"
      ) {
        setFieldErrors(
          (current) => ({
            ...current,
            email:
              error.message,
          }),
        );

        emailRef.current?.focus();

        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "No fue posible registrar al usuario",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Loader
        fullScreen
        message="Creando cuenta..."
      />
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>
          Crear cuenta
        </h1>

        <p className="auth-subtitle">
          Registra tus datos para
          comenzar.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-group">
            <label htmlFor="fullName">
              Nombre completo
            </label>

            <input
              ref={fullNameRef}
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              className={
                fieldErrors.fullName
                  ? "input-error"
                  : ""
              }
              aria-invalid={
                Boolean(
                  fieldErrors.fullName,
                )
              }
              onChange={(event) => {
                const sanitizedValue =
                  event.target.value
                    .replace(
                      /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g,
                      "",
                    )
                    .replace(
                      /\s{2,}/g,
                      " ",
                    );

                setFullName(
                  sanitizedValue,
                );

                clearFieldError(
                  "fullName",
                );
              }}
            />

            {fieldErrors.fullName && (
              <span className="field-error">
                {
                  fieldErrors.fullName
                }
              </span>
            )}
          </div>

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
              autoComplete="new-password"
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

                if (
                  passwordConfirmation
                ) {
                  clearFieldError(
                    "passwordConfirmation",
                  );
                }
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

          <div className="form-group">
            <label htmlFor="passwordConfirmation">
              Confirmar contraseña
            </label>

            <input
              ref={
                passwordConfirmationRef
              }
              id="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              value={
                passwordConfirmation
              }
              className={
                fieldErrors.passwordConfirmation
                  ? "input-error"
                  : ""
              }
              aria-invalid={
                Boolean(
                  fieldErrors.passwordConfirmation,
                )
              }
              onChange={(event) => {
                setPasswordConfirmation(
                  event.target.value,
                );

                clearFieldError(
                  "passwordConfirmation",
                );
              }}
            />

            {fieldErrors.passwordConfirmation && (
              <span className="field-error">
                {
                  fieldErrors.passwordConfirmation
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