/**
 * Representa los datos requeridos para procesar
 * una solicitud de pago mediante SnailPay.
 *
 * @interface SnailPayRequest
 */
export interface SnailPayRequest {
  /**
   * Número de tarjeta utilizado en la transacción.
   *
   * Debe contener 16 dígitos.
   */
  cardNumber: string;

  /**
   * Fecha de vencimiento de la tarjeta.
   *
   * Debe utilizar el formato MM/AA.
   */
  expirationDate: string;

  /**
   * Código de seguridad de la tarjeta.
   *
   * Debe contener 3 dígitos.
   */
  cvv: string;

  /**
   * Nombre completo del titular de la tarjeta.
   */
  fullName: string;

  /**
   * Monto de la transacción.
   *
   * Debe ser mayor a cero.
   */
  amount: number;

  /**
   * Identificador del usuario que realiza la operación.
   */
  payerId: string;

  /**
   * Correo electrónico del usuario que realiza la operación.
   */
  payerEmail: string;
}