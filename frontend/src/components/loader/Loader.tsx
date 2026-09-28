interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

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