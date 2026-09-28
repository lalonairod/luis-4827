import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

/**
 * Punto de entrada principal de la aplicación React.
 *
 * Inicializa la aplicación sobre el elemento raíz del documento,
 * habilita StrictMode y configura el enrutamiento mediante
 * BrowserRouter.
 */
createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);