/**
 * Representa la información asociada
 * a una sesión activa de usuario.
 *
 * @interface Session
 */
export interface Session {
  /**
   * Identificador único del usuario autenticado.
   */
  userId: string;

  /**
   * Correo electrónico asociado a la sesión.
   */
  email: string;
}