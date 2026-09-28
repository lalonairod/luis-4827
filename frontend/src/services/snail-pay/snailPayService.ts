import type { SnailPayRequest } from "../../types/snail-pay/snail-pay-request";
import type { SnailPayResponse } from "../../types/snail-pay/snail-pay-response";

/**
 * URL base utilizada para consumir el servicio SnailPay.
 */
const API_URL =
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
 * Envía los datos de pago al backend y permite simular
 * un error interno mediante un encabezado HTTP.
 *
 * Durante el procesamiento:
 * - Registra el tiempo de respuesta.
 * - Reporta respuestas lentas en consola.
 * - Mantiene un tiempo mínimo de carga visual.
 * - Persiste la última respuesta recibida en localStorage.
 * - Propaga las respuestas de error para que sean gestionadas
 *   por la interfaz.
 *
 * @param payment - Datos requeridos para procesar la transacción.
 * @param simulateSystemError - Indica si debe simularse un error interno.
 * @returns La respuesta generada por SnailPay.
 * @throws La respuesta del servicio cuando la operación no es exitosa
 * o el error producido durante la comunicación.
 */
export async function chargeBalance(
  payment: SnailPayRequest,
  simulateSystemError = false,
): Promise<SnailPayResponse> {
  const startedAt =
    performance.now();

  try {
    const response = await fetch(
      `${API_URL}/charge`,
      {
        method: "POST",

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

    console.error(
      `[SnailPay] Error después de ${Math.round(
        elapsed,
      )} ms`,
      error,
    );

    throw error;
  }
}