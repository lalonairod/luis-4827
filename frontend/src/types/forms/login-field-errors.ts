/**
 * Representa los posibles errores de validación
 * asociados a los campos del formulario de inicio de sesión.
 *
 * Cada propiedad es opcional y contiene el mensaje
 * correspondiente cuando el campo presenta un error.
 *
 * @type LoginFieldErrors
 */
export type LoginFieldErrors = {
  /**
   * Error asociado al correo electrónico.
   */
  email?: string;

  /**
   * Error asociado a la contraseña.
   */
  password?: string;
};