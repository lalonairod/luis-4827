import { Router } from "express";
import { z } from "zod";
import { SnailPayResponse } from "../types/snail-pay/snail-pay-response";

export const snailPayRouter = Router();

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, "El número de tarjeta debe tener 16 dígitos"),

  expirationDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      "La fecha debe tener formato MM/AA",
    ),

  cvv: z
    .string()
    .regex(/^\d{3}$/, "El CVV debe tener 3 dígitos"),

  fullName: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio"),

  amount: z
    .number()
    .positive("El monto debe ser mayor que cero"),

  payerId: z
    .string()
    .min(1, "El identificador del usuario es obligatorio"),

  payerEmail: z
    .string()
    .email("El correo no es válido"),
});

function createBaseResponse(
  data: z.infer<typeof paymentSchema>,
): Omit<
  SnailPayResponse,
  "status" | "status_detail" | "authorization_code"
> {
  return {
    id: crypto.randomUUID(),
    transaction_amount: data.amount,
    date_created: new Date().toISOString(),
    reference: `SNAIL-${Date.now()}`,
    payer_id: data.payerId,
    payer_email: data.payerEmail,
    card_number: data.cardNumber,
    cvv: data.cvv,
  };
}

snailPayRouter.post(
  "/charge",
  (req, res) => {
    const validation = paymentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: "rejected",
        status_detail: "invalid_request",
        errors: validation.error.flatten(),
      });
    }

    const payment = validation.data;

    const baseResponse =
      createBaseResponse(payment);

    /*
     * Error interno simulado.
     *
     * Enviar:
     * x-simulate-system-error: true
     */
    if (
      req.header("x-simulate-system-error") === "true"
    ) {
      const response: SnailPayResponse = {
        ...baseResponse,
        status: "error",
        status_detail: "internal_processing_error",
        authorization_code: null,
      };

      return res.status(500).json(response);
    }

    const isApproved =
      payment.cardNumber ===
        "1234123412341234" &&
      payment.expirationDate === "12/26" &&
      payment.cvv === "543";

    if (!isApproved) {
      const response: SnailPayResponse = {
        ...baseResponse,
        status: "rejected",
        status_detail: "card_declined",
        authorization_code: null,
      };

      return res.status(402).json(response);
    }

    const response: SnailPayResponse = {
      ...baseResponse,
      status: "approved",
      status_detail: "accredited",
      authorization_code: `AUTH-${Date.now()
        .toString()
        .slice(-6)}`,
    };

    return res.status(200).json(response);
  },
);