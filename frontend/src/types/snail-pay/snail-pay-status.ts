/**
 * Representa los posibles estados de una transacción
 * procesada por SnailPay.
 *
 * - `approved`: La transacción fue aprobada correctamente.
 * - `rejected`: La transacción fue rechazada.
 * - `error`: Ocurrió un error interno durante el procesamiento.
 *
 * @type SnailPayStatus
 */
export type SnailPayStatus =
  | "approved"
  | "rejected"
  | "error";