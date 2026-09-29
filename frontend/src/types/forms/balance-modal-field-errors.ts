/**
 * Representa los posibles errores de validación
 * asociados a los campos del modal de carga de saldo.
 *
 * Cada propiedad es opcional y contiene el mensaje
 * correspondiente cuando el campo presenta un error.
 *
 * @type BalanceModalFieldErrors
 */
export type BalanceModalFieldErrors = {
  /**
   * Error asociado al número de tarjeta.
   */
  cardNumber?: string;

  /**
   * Error asociado a la fecha de vencimiento.
   */
  expirationDate?: string;

  /**
   * Error asociado al código CVV.
   */
  cvv?: string;

  /**
   * Error asociado al nombre completo del titular.
   */
  fullName?: string;

  /**
   * Error asociado al monto de la transacción.
   */
  amount?: string;
};