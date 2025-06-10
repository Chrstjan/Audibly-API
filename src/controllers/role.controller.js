import express from "express";
import { User as model } from "../models/user.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";

export const roleController = express.Router();
const url = "role";

/***********************
 * Upgrade to Artist role
 ***********************/
roleController.patch(
  `/${url}`,
  Authorize,
  requiresRole("user"),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);

      const user = await model.findOne({
        where: { id: userId },
      });

      if (user?.role === "admin") {
        return errorResponse(res, `Admin can't downgrade to artist role`, null);
      }

      if (user?.role === "artist") {
        return errorResponse(res, `Account already has artist role`, null);
      }

      if (!user) {
        return errorResponse(res, `User not found`, null);
      }

      const result = await model.update(
        { role: "artist" },
        { where: { id: userId } }
      );

      if (!result) {
        return errorResponse(res, `Error in updating user role`, result);
      }

      successResponse(res, result, "success");
    } catch (err) {
      errorResponse(
        res,
        `Error in updating user role: ${err.message}`,
        err,
        500
      );
    }
  }
);

/***************************
 * Downgrade to User role
 ***************************/
roleController.patch(
  `/${url}/downgrade`,
  Authorize,
  requiresRole("artist"),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);

      const user = await model.findOne({
        where: { id: userId },
      });

      if (user?.role === "admin") {
        return errorResponse(res, `Admin can't downgrade`, null);
      }

      if (user?.role === "user") {
        return errorResponse(res, `Account already in basic role`, null);
      }

      if (!user) {
        return errorResponse(res, `User not found`, null);
      }

      const result = await model.update(
        { role: "user" },
        { where: { id: userId } }
      );

      if (!result) {
        return errorResponse(res, `Error in updating user role`, result);
      }

      successResponse(res, result, "success");
    } catch (err) {
      errorResponse(
        res,
        `Error in updating user role: ${err.message}`,
        err,
        500
      );
    }
  }
);
