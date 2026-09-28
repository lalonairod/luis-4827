import { Router } from "express";
import { z } from "zod";
import { SnailPayResponse } from "../types/snail-pay/snail-pay-response";

/**
 * Router encargado de exponer los endpoints del servicio simulado SnailPay.
 *
 * @constant
 */
export const snailPayRouter = Router();

/**
 * Esquema de validación para las solicitudes de pago enviadas a SnailPay.
 *
 * Valida:
 * - Número de tarjeta de 16 dígitos.
 * - Fecha de vencimiento en formato MM/AA.
 * - CVV de 3 dígitos.
 * - Nombre completo obligatorio.
 * - Monto mayor a cero.
 * - Identificador del usuario.
 * - Correo electrónico válido.
 */
const paymentSchema = z.object({
  cardNumber: z
    .string()
    .regex(
      /^\d{16}$/,
      "El número de tarjeta debe tener 16 dígitos",
    ),

  expirationDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      "La fecha debe tener formato MM/AA",
    ),

  cvv: z
    .string()
    .regex(
      /^\d{3}$/,
      "El CVV debe tener 3 dígitos",
    ),

  fullName: z
    .string()
    .trim()
    .min(
      1,
      "El nombre es obligatorio",
    ),

  amount: z
    .number()
    .positive(
      "El monto debe ser mayor que cero",
    ),

  payerId: z
    .string()
    .min(
      1,
      "El identificador del usuario es obligatorio",
    ),

  payerEmail: z
    .string()
    .email(
      "El correo no es válido",
    ),
});

/**
 * Genera la información base utilizada en todas las respuestas
 * del servicio SnailPay.
 *
 * Incluye datos comunes como el identificador de la transacción,
 * monto, fecha de creación, referencia y datos del pagador.
 *
 * @param data - Datos de pago previamente validados.
 * @returns La información base de la respuesta SnailPay.
 */
function createBaseResponse(
  data: z.infer<typeof paymentSchema>,
): Omit<
  SnailPayResponse,
  | "status"
  | "status_detail"
  | "authorization_code"
> {
  return {
    id: crypto.randomUUID(),
    transaction_amount:
      data.amount,
    date_created:
      new Date().toISOString(),
    reference:
      `SNAIL-${Date.now()}`,
    payer_id:
      data.payerId,
    payer_email:
      data.payerEmail,
    card_number:
      data.cardNumber,
    cvv:
      data.cvv,
  };
}

/**
 * Procesa una solicitud de carga de saldo mediante el
 * servicio simulado SnailPay.
 *
 * El endpoint puede responder con los siguientes escenarios:
 *
 * - 200: transacción aprobada.
 * - 400: datos de solicitud inválidos.
 * - 402: transacción rechazada.
 * - 500: error interno simulado.
 *
 * Para obtener una transacción aprobada deben enviarse las
 * credenciales ficticias configuradas para la prueba.
 *
 * El error interno puede simularse enviando el encabezado:
 * `x-simulate-system-error: true`.
 */
snailPayRouter.post(
  "/charge",
  (req, res) => {
    const validation =
      paymentSchema.safeParse(
        req.body,
      );

    if (!validation.success) {
      return res
        .status(400)
        .json({
          status: "rejected",
          status_detail:
            "invalid_request",
          errors:
            validation.error.flatten(),
        });
    }

    const payment =
      validation.data;

    const baseResponse =
      createBaseResponse(
        payment,
      );

    /**
     * Permite simular un error interno del proveedor
     * mediante un encabezado HTTP.
     */
    if (
      req.header(
        "x-simulate-system-error",
      ) === "true"
    ) {
      const response:
        SnailPayResponse = {
        ...baseResponse,
        status: "error",
        status_detail:
          "internal_processing_error",
        authorization_code:
          null,
      };

      return res
        .status(500)
        .json(response);
    }

    /**
     * Valida las credenciales ficticias requeridas
     * para aprobar una transacción.
     */
    const isApproved =
      payment.cardNumber ===
        "1234123412341234" &&
      payment.expirationDate ===
        "12/26" &&
      payment.cvv ===
        "543";

    if (!isApproved) {
      const response:
        SnailPayResponse = {
        ...baseResponse,
        status:
          "rejected",
        status_detail:
          "card_declined",
        authorization_code:
          null,
      };

      return res
        .status(402)
        .json(response);
    }

    const response:
      SnailPayResponse = {
      ...baseResponse,
      status: "approved",
      status_detail:
        "accredited",
      authorization_code:
        `AUTH-${Date.now()
          .toString()
          .slice(-6)}`,
    };

    return res
      .status(200)
      .json(response);
  },
);