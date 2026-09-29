import type { SnailPayRequest } from "../../types/snail-pay/snail-pay-request";
import type { SnailPayResponse } from "../../types/snail-pay/snail-pay-response";

/**
 * URL base utilizada para consumir el servicio SnailPay.
 */
const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001/api/snailpay";

/**
 * Clave utilizada para almacenar la última
 * transacción procesada por SnailPay.
 */
const TRANSACTION_KEY =
  "snail_last_transaction";

/**
 * Tiempo mínimo, en milisegundos, durante el cual
 * se mantiene visible el estado de carga del pago.
 */
const MINIMUM_LOADER_TIME = 700;

/**
 * Tiempo máximo permitido para recibir una respuesta
 * del servicio SnailPay.
 */
const REQUEST_TIMEOUT = 5000;

/**
 * Genera una espera asíncrona durante el tiempo indicado.
 *
 * @param milliseconds - Tiempo de espera en milisegundos.
 * @returns Una promesa que se resuelve después del tiempo indicado.
 */
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

/**
 * Procesa una carga de saldo mediante el servicio SnailPay.
 *
 * @param payment - Datos requeridos para procesar la transacción.
 * @param simulateSystemError - Indica si debe simularse un error interno.
 * @returns La respuesta generada por SnailPay.
 * @throws La respuesta del servicio o un error de timeout.
 */
export async function chargeBalance(
  payment: SnailPayRequest,
  simulateSystemError = false,
): Promise<SnailPayResponse> {
  const startedAt =
    performance.now();

  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(
      () => {
        controller.abort();
      },
      REQUEST_TIMEOUT,
    );

  try {
    const response = await fetch(
      `${API_URL}/charge`,
      {
        method: "POST",

        signal:
          controller.signal,

        headers: {
          "Content-Type":
            "application/json",

          ...(simulateSystemError
            ? {
                "x-simulate-system-error":
                  "true",
              }
            : {}),
        },

        body: JSON.stringify(
          payment,
        ),
      },
    );

    const data =
      (await response.json()) as SnailPayResponse;

    const elapsed =
      performance.now() -
      startedAt;

    console.info(
      `[SnailPay] ${response.status} - ${Math.round(
        elapsed,
      )} ms`,
    );

    if (elapsed > 1500) {
      console.warn(
        `[SnailPay] Respuesta lenta detectada: ${Math.round(
          elapsed,
        )} ms`,
      );
    }

    const remainingTime =
      MINIMUM_LOADER_TIME -
      elapsed;

    if (remainingTime > 0) {
      await wait(
        remainingTime,
      );
    }

    localStorage.setItem(
      TRANSACTION_KEY,
      JSON.stringify(data),
    );

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    const elapsed =
      performance.now() -
      startedAt;

    if (
      error instanceof DOMException &&
      error.name ===
        "AbortError"
    ) {
      const timeoutResponse:
        SnailPayResponse = {
        id:
          crypto.randomUUID(),
        status:
          "error",
        status_detail:
          "request_timeout",
        transaction_amount:
          payment.amount,
        date_created:
          new Date().toISOString(),
        authorization_code:
          null,
        reference:
          `SNAIL-TIMEOUT-${Date.now()}`,
        payer_id:
          payment.payerId,
        payer_email:
          payment.payerEmail,
        card_number:
          payment.cardNumber,
        cvv:
          payment.cvv,
      };

      localStorage.setItem(
        TRANSACTION_KEY,
        JSON.stringify(
          timeoutResponse,
        ),
      );

      console.error(
        `[SnailPay] Timeout después de ${Math.round(
          elapsed,
        )} ms`,
      );

      throw timeoutResponse;
    }

    console.error(
      `[SnailPay] Error después de ${Math.round(
        elapsed,
      )} ms`,
      error,
    );

    throw error;
  } finally {
    window.clearTimeout(
      timeoutId,
    );
  }
}