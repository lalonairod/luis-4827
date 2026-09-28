/**
 * Representa la información principal
 * de un usuario registrado en la aplicación.
 *
 * @interface User
 */
export interface User {
  /**
   * Identificador único del usuario.
   */
  id: string;

  /**
   * Nombre completo del usuario.
   */
  fullName: string;

  /**
   * Correo electrónico asociado a la cuenta.
   */
  email: string;

  /**
   * Hash de la contraseña utilizada para autenticación.
   *
   * En esta aplicación se almacena únicamente
   * como parte de la simulación local.
   */
  password: string;

  /**
   * Saldo disponible del usuario.
   */
  balance: number;
}