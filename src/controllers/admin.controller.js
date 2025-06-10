import express from "express";
import dotenv from "dotenv";
import { User as model } from "../models/user.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/query.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";

dotenv.config();
const port = process.env.PORT;

export const adminController = express.Router();
const url = "admin-dashboard";

adminController.get(
  `/${url}`,
  Authorize,
  requiresRole("admin"),
  async (req, res) => {
    try {
      res.send({
        message: "Welcome admin",
        links: {
          users: `http://localhost:${port}/admin-dashboard/users`,
        },
      });
    } catch (err) {
      return errorResponse(
        res,
        `Something went wrong: ${err.message}`,
        err,
        500
      );
    }
  }
);

adminController.get(
  `/${url}/users`,
  Authorize,
  requiresRole("admin"),
  async (req, res) => {
    try {
      res.send({
        message: "Users list",
        links: {
          home: `http://localhost:${port}/admin-dashboard`,
        },
      });
    } catch (err) {
      return errorResponse(
        res,
        `Error in gettings users: ${err.message}`,
        err,
        500
      );
    }
  }
);
