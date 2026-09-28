/**
 * Representa los posibles errores de validación
 * asociados a los campos del formulario de registro.
 *
 * Cada propiedad es opcional y contiene el mensaje
 * correspondiente cuando el campo presenta un error.
 *
 * @type RegisterFieldErrors
 */
export type RegisterFieldErrors = {
  /**
   * Error asociado al nombre completo.
   */
  fullName?: string;

  /**
   * Error asociado al correo electrónico.
   */
  email?: string;

  /**
   * Error asociado a la contraseña.
   */
  password?: string;

  /**
   * Error asociado a la confirmación de contraseña.
   */
  passwordConfirmation?: string;
};