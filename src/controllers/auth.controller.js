import express from "express";
import { Authenticate, Authorize } from "../utils/auth.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";

export const authController = express.Router();

authController.post("/login", (req, res) => {
  Authenticate(req, res);
});

authController.get("/authorize", Authorize, (req, res, next) => {
  successResponse(res, "You are logged in");
});
