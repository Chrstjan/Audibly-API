import express from "express";
import { Audiofile as model } from "../models/audiofile.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { errorResponse, successResponse } from "../utils/response.utils.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/app/audiofiles");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = unique + path.extname(file.originalname);
    cb(null, safeName);
  },
});

const upload = multer({ storage });

export const audiofileController = express.Router();
const url = "audiofile";

audiofileController.get(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);

      const result = await model.findAll({
        where: { user_id: userId },
      });

      if (!result) {
        return errorResponse(
          res,
          `No audiofiles found belonging to user with id: ${userId}`,
          null,
          404
        );
      }
      successResponse(
        res,
        result.map((audio) => ({
          ...audio.toJSON(),
          url: `/audiofile/${audio.filename}`,
          filename: audio.filename,
          id: audio.id,
          user_id: audio.user_id,
        })),
        "success",
        200
      );
    } catch (err) {
      errorResponse(
        res,
        `Error in getting audiofiles: ${err.message}`,
        err,
        500
      );
    }
  }
);

audiofileController.get(`/${url}/:filename`, async (req, res) => {
  try {
    const filePath = path.join("/app/audiofiles", req.params.filename);

    if (!fs.existsSync(filePath)) {
      return errorResponse(res, `Audiofile not found`, null, 404);
    }

    res.send(filePath);
  } catch (err) {
    errorResponse(res, `Error in getting audiofile: ${err.message}`, err, 500);
  }
});

audiofileController.post(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  upload.single("audio"),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);

      if (!req.file) {
        return errorResponse(res, "No file uploaded", null, 400);
      }

      const fileEntry = await model.create({
        filename: req.file.filename,
        user_id: userId,
      });

      successResponse(res, fileEntry, "Audiofile uploaded", 201);
    } catch (err) {
      errorResponse(
        res,
        `Error in uploading audiofile: ${err.message}`,
        err,
        500
      );
    }
  }
);

audiofileController.delete(
  `/${url}/:id`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { id } = req.params;

      const audioFile = await model.findOne({
        where: { id: id, user_id: userId },
      });

      if (!audioFile) {
        return errorResponse(
          res,
          `Audiofile with id: ${id} belonging to user with id: ${userId} not found`,
          null,
          404
        );
      }

      const filePath = path.join("/app/audiofiles", audioFile.filename);

      await model.destroy({ where: { id: id, user_id: userId } });

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      successResponse(
        res,
        null,
        `Audiofile with id: ${id} successfully deleted`
      );
    } catch (err) {
      errorResponse(
        res,
        `Error in deleting audiofile: ${err.message}`,
        err,
        500
      );
    }
  }
);
