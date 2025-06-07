import express from "express";
import { User as model } from "../models/user.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/query.utils.js";

export const userController = express.Router();
const url = "user";

userController.post(`/${url}`, async (req, res) => {
  try {
    const data = req.body;

    let doesExists = await model.findOne({ where: { email: data.email } });

    if (doesExists) {
      return errorResponse(res, `Account with that email already exists`);
    } else {
      const result = await model.create(data);

      successResponse(
        res,
        {
          email: result.email,
          username: result.username,
          role: result.role,
        },
        "Account created successfully",
        201
      );
    }
  } catch (err) {
    errorResponse(res, `Error in creating Account: ${err.message}`, err, 500);
  }
});
