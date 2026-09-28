import type { SnailPayRequest } from "../../types/snail-pay/snail-pay-request";
import type { SnailPayResponse } from "../../types/snail-pay/snail-pay-response";

const API_URL =
  "http://localhost:3001/api/snailpay";

const TRANSACTION_KEY =
  "snail_last_transaction";

const MINIMUM_LOADER_TIME = 700;

function wait(milliseconds: number) {
  return new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

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