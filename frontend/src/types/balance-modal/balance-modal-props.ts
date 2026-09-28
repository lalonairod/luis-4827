import type { User } from "../auth/user";

/**
 * Propiedades requeridas por el componente BalanceModal.
 *
 * @interface BalanceModalProps
 */
export interface BalanceModalProps {
  /**
   * Usuario que realiza la carga de saldo.
   */
  user: User;

  /**
   * Función ejecutada al cerrar el modal.
   */
  onClose: () => void;

  /**
   * Función ejecutada después de una transacción aprobada.
   *
   * @param amount - Monto acreditado al usuario.
   */
  onSuccess: (amount: number) => void;
}