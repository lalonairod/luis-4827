import cors from "cors";
import express from "express";

import { snailPayRouter } from "./routes/snailPay.routes.js";

/**
 * Instancia principal de la aplicación Express.
 *
 * Configura los middlewares globales y registra
 * las rutas disponibles en el backend.
 */
export const app = express();

/**
 * Habilita solicitudes de origen cruzado hacia la API.
 */
app.use(cors());

/**
 * Permite procesar cuerpos de solicitud en formato JSON.
 */
app.use(express.json());

/**
 * Endpoint de verificación del estado de la API.
 *
 * @route GET /api/health
 * @returns Un objeto indicando que la API se encuentra disponible.
 */
app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      status: "ok",
      message: "API running",
    });
  },
);

/**
 * Registra las rutas relacionadas con el servicio SnailPay.
 *
 * Todas las rutas definidas en `snailPayRouter`
 * estarán disponibles bajo `/api/snailpay`.
 */
app.use(
  "/api/snailpay",
  snailPayRouter,
);