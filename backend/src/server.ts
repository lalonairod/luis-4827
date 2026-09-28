import { app } from "./app.js";

/**
 * Puerto utilizado por el servidor HTTP del backend.
 */
const PORT = 3001;

/**
 * Inicia el servidor Express y lo deja escuchando
 * solicitudes en el puerto configurado.
 */
app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`,
  );
});