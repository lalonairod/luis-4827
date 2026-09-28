/**
 * Propiedades disponibles para el componente Loader.
 *
 * @interface LoaderProps
 */
export interface LoaderProps {
  /**
   * Mensaje mostrado debajo del indicador de carga.
   *
   * @default "Cargando..."
   */
  message?: string;

  /**
   * Indica si el loader debe ocupar toda la pantalla.
   *
   * @default false
   */
  fullScreen?: boolean;
}