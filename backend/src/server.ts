import { app } from "./app.js";

/**
 * Puerto utilizado por el servidor HTTP del backend.
 *
 * Utiliza el puerto proporcionado por el entorno cuando
 * está disponible y mantiene 3001 como valor por defecto
 * para ejecución local.
 */
const PORT =
  Number(
    process.env.PORT,
  ) || 3001;

/**
 * Inicia el servidor Express y lo deja escuchando
 * solicitudes en el puerto configurado.
 */
app.listen(PORT, () => {
  console.log(
    `Backend running on port ${PORT}`,
  );
});