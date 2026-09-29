import type { LoaderProps } from "../../types/loader/loader-props";

/**
 * Componente visual utilizado para indicar que una operación
 * se encuentra en proceso.
 *
 * Puede mostrarse como un overlay local dentro de un contenedor
 * o cubrir toda la pantalla cuando `fullScreen` es verdadero.
 *
 * @param props - Propiedades de configuración del loader.
 * @returns El indicador visual de carga.
 */
export function Loader({
  message = "Cargando...",
  fullScreen = false,
}: LoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? "loader-overlay loader-fullscreen"
          : "loader-overlay"
      }
    >
      <div className="loader-content">
        <div className="loader-spinner" />

        <p>{message}</p>
      </div>
    </div>
  );
}