import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { ApiError } from "./errorHandler.js";

export const requireAdmin: RequestHandler = (req, _res, next) => {
  const key = req.header("x-admin-api-key");

  if (!key || key !== env.ADMIN_API_KEY) {
    throw new ApiError(401, "Admin API key is required");
  }

  next();
};
