import cors from "cors";
import express from "express";

import { snailPayRouter } from "./routes/snailPay.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "API running",
  });
});

app.use(
  "/api/snailpay",
  snailPayRouter,
);