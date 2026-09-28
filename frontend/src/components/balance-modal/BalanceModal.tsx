import {
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";

import { createPortal } from "react-dom";

import { chargeBalance } from "../../services/snail-pay/snailPayService";

import { Loader } from "../loader/Loader";

import type { User } from "../../types/auth/user";
import type { SnailPayResponse } from "../../types/snail-pay/snail-pay-response";
import type { BalanceModalFieldErrors } from "../../types/forms/balance-modal-field-errors";

interface BalanceModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export function BalanceModal({
  user,
  onClose,
  onSuccess,
}: BalanceModalProps) {
  const [cardNumber, setCardNumber] =
    useState("");

  const [expirationDate, setExpirationDate] =
    useState("");

  const [cvv, setCvv] =
    useState("");

  const [fullName, setFullName] =
    useState(user.fullName);

  const [amount, setAmount] =
    useState("");

  const [
    simulateSystemError,
    setSimulateSystemError,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<BalanceModalFieldErrors>(
      {},
    );

  const [loading, setLoading] =
    useState(false);

  const cardNumberRef =
    useRef<HTMLInputElement>(null);

  const expirationDateRef =
    useRef<HTMLInputElement>(null);

  const cvvRef =
    useRef<HTMLInputElement>(null);

  const fullNameRef =
    useRef<HTMLInputElement>(null);

  const amountRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, []);

  function clearFieldError(
    field: keyof BalanceModalFieldErrors,
  ) {
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function formatExpirationDate(
    value: string,
  ) {
    const numbersOnly = value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (numbersOnly.length <= 2) {
      return numbersOnly;
    }

    return `${numbersOnly.slice(
      0,
      2,
    )}/${numbersOnly.slice(2)}`;
  }

  function validateForm(): boolean {
    const errors: BalanceModalFieldErrors =
      {};

    if (cardNumber.length !== 16) {
      errors.cardNumber =
        "El número de tarjeta debe contener 16 dígitos.";
    }

    if (
      !/^(0[1-9]|1[0-2])\/\d{2}$/.test(
        expirationDate,
      )
    ) {
      errors.expirationDate =
        "Ingresa una fecha válida en formato MM/AA.";
    }

    if (cvv.length !== 3) {
      errors.cvv =
        "El CVV debe contener 3 dígitos.";
    }

    if (!fullName.trim()) {
      errors.fullName =
        "Ingresa el nombre completo.";
    }

    const numericAmount =
      Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      errors.amount =
        "Ingresa un monto mayor a cero.";
    }

    setFieldErrors(errors);

    if (errors.cardNumber) {
      cardNumberRef.current?.focus();
      return false;
    }

    if (errors.expirationDate) {
      expirationDateRef.current?.focus();
      return false;
    }

    if (errors.cvv) {
      cvvRef.current?.focus();
      return false;
    }

    if (errors.amount) {
      amountRef.current?.focus();
      return false;
    }

    if (errors.fullName) {
      fullNameRef.current?.focus();
      return false;
    }

    return true;
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    const numericAmount =
      Number(amount);

    setLoading(true);

    try {
      const response =
        await chargeBalance(
          {
            cardNumber,
            expirationDate,
            cvv,
            fullName:
              fullName.trim(),
            amount: numericAmount,
            payerId: user.id,
            payerEmail:
              user.email,
          },
          simulateSystemError,
        );

      if (
        response.status ===
        "approved"
      ) {
        onSuccess(
          response.transaction_amount,
        );

        onClose();

        return;
      }
    } catch (error) {
      const transactionError =
        error as SnailPayResponse;

      if (
        transactionError.status ===
        "rejected"
      ) {
        setError(
          "La transacción fue rechazada por SnailPay. Verifica los datos de pago e intenta nuevamente.",
        );

        return;
      }

      if (
        transactionError.status ===
        "error"
      ) {
        setError(
          "SnailPay no está disponible en este momento. Intenta nuevamente.",
        );

        return;
      }

      setError(
        "No fue posible procesar la operación. Verifica tu conexión e intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  const modal = (
    <div className="modal-backdrop">
      <section
        className="payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
      >
        {loading && (
          <Loader message="Procesando pago con SnailPay..." />
        )}

        <header className="modal-header">
          <div>
            <h2 id="payment-title">
              Cargar saldo
            </h2>

            <p>
              Pago simulado mediante
              SnailPay
            </p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <form
          className="payment-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-group">
            <label htmlFor="cardNumber">
              Número de tarjeta
            </label>

            <input
              ref={cardNumberRef}
              id="cardNumber"
              className={
                fieldErrors.cardNumber
                  ? "input-card input-error"
                  : "input-card"
              }
              value={cardNumber}
              maxLength={16}
              inputMode="numeric"
              autoComplete="off"
              placeholder="1234123412341234"
              aria-invalid={
                Boolean(
                  fieldErrors.cardNumber,
                )
              }
              onChange={(event) => {
                setCardNumber(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 16),
                );

                clearFieldError(
                  "cardNumber",
                );
              }}
            />

            {fieldErrors.cardNumber && (
              <span className="field-error">
                {
                  fieldErrors.cardNumber
                }
              </span>
            )}
          </div>

          <div className="payment-short-fields">
            <div className="form-group">
              <label htmlFor="expirationDate">
                Vencimiento
              </label>

              <input
                ref={expirationDateRef}
                id="expirationDate"
                className={
                  fieldErrors.expirationDate
                    ? "input-expiration input-error"
                    : "input-expiration"
                }
                value={expirationDate}
                maxLength={5}
                inputMode="numeric"
                autoComplete="off"
                placeholder="MM/AA"
                aria-invalid={
                  Boolean(
                    fieldErrors.expirationDate,
                  )
                }
                onChange={(event) => {
                  setExpirationDate(
                    formatExpirationDate(
                      event.target.value,
                    ),
                  );

                  clearFieldError(
                    "expirationDate",
                  );
                }}
              />

              {fieldErrors.expirationDate && (
                <span className="field-error">
                  {
                    fieldErrors.expirationDate
                  }
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cvv">
                CVV
              </label>

              <input
                ref={cvvRef}
                id="cvv"
                className={
                  fieldErrors.cvv
                    ? "input-cvv input-error"
                    : "input-cvv"
                }
                value={cvv}
                maxLength={3}
                inputMode="numeric"
                autoComplete="off"
                placeholder="543"
                aria-invalid={
                  Boolean(
                    fieldErrors.cvv,
                  )
                }
                onChange={(event) => {
                  setCvv(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 3),
                  );

                  clearFieldError(
                    "cvv",
                  );
                }}
              />

              {fieldErrors.cvv && (
                <span className="field-error">
                  {fieldErrors.cvv}
                </span>
              )}
            </div>

            <div className="form-group amount-field">
              <label htmlFor="amount">
                Monto
              </label>

              <input
                ref={amountRef}
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                placeholder="500"
                className={
                  fieldErrors.amount
                    ? "input-error"
                    : ""
                }
                aria-invalid={
                  Boolean(
                    fieldErrors.amount,
                  )
                }
                onChange={(event) => {
                  setAmount(
                    event.target.value,
                  );

                  clearFieldError(
                    "amount",
                  );
                }}
              />

              {fieldErrors.amount && (
                <span className="field-error">
                  {fieldErrors.amount}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">
              Nombre completo
            </label>

            <input
              ref={fullNameRef}
              id="fullName"
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
                setFullName(
                  event.target.value,
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

          <label className="system-error-option">
            <input
              type="checkbox"
              checked={
                simulateSystemError
              }
              onChange={(event) =>
                setSimulateSystemError(
                  event.target.checked,
                )
              }
            />

            <span>
              Simular error interno de
              SnailPay
            </span>
          </label>

          {error && (
            <div className="payment-message payment-message-error">
              <span>!</span>

              <p>{error}</p>
            </div>
          )}

          <footer className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="confirm-payment-button"
              disabled={loading}
            >
              Cargar saldo
            </button>
          </footer>
        </form>
      </section>
    </div>
  );

  return createPortal(
    modal,
    document.body,
  );
}