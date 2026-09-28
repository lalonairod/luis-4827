import { SnailPayStatus } from "./snail-pay-status";

/**
 * Representa la respuesta generada por el servicio SnailPay
 * después de procesar una transacción.
 *
 * @interface SnailPayResponse
 */
export interface SnailPayResponse {
  /**
   * Identificador único de la transacción.
   */
  id: string;

  /**
   * Estado general de la transacción.
   */
  status: SnailPayStatus;

  /**
   * Detalle específico asociado al estado de la transacción.
   *
   * Ejemplos:
   * - accredited
   * - card_declined
   * - invalid_request
   * - internal_processing_error
   */
  status_detail: string;

  /**
   * Monto procesado en la transacción.
   */
  transaction_amount: number;

  /**
   * Fecha y hora de creación de la transacción
   * en formato ISO.
   */
  date_created: string;

  /**
   * Código de autorización generado cuando
   * la transacción es aprobada.
   *
   * Es null cuando la operación es rechazada
   * o se produce un error.
   */
  authorization_code: string | null;

  /**
   * Referencia generada para identificar la operación.
   */
  reference: string;

  /**
   * Identificador del usuario que realizó la transacción.
   */
  payer_id: string;

  /**
   * Correo electrónico del usuario que realizó la transacción.
   */
  payer_email: string;

  /**
   * Número de tarjeta ficticio utilizado en la operación.
   *
   * Este campo se incluye únicamente por requerimiento
   * de la simulación.
   */
  card_number: string;

  /**
   * Código CVV ficticio utilizado en la operación.
   *
   * Este campo se incluye únicamente por requerimiento
   * de la simulación.
   */
  cvv: string;
}