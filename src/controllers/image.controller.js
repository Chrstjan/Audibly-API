import express from "express";
import { Image as model } from "../models/image.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { errorResponse, successResponse } from "../utils/response.utils.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/app/images");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = unique + path.extname(file.originalname);
    cb(null, safeName);
  },
});

const upload = multer({ storage });

export const imageController = express.Router();
const url = "image";

imageController.get(
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
          `No images found belonging to user with id: ${userId}`,
          null,
          404
        );
      }
      successResponse(
        res,
        result.map((image) => ({
          ...image.toJSON(),
          url: `/images/${image.filename}`,
          filename: image.filename,
          id: image.id,
          user_id: image.user_id,
          artist_credit: image.artist_credit,
        })),
        "success",
        200
      );
    } catch (err) {
      errorResponse(res, `Error in getting images: ${err.message}`, err, 500);
    }
  }
);

imageController.get(`/${url}/:filename`, async (req, res) => {
  try {
    const filePath = path.join("/app/images", req.params.filename);

    if (!fs.existsSync(filePath)) {
      return errorResponse(res, `Image not found`, null, 404);
    }

    res.sendFile(filePath);
  } catch (err) {
    errorResponse(res, `Error in getting image: ${err.message}`, err, 500);
  }
});

imageController.post(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);

      if (!req.file) {
        return errorResponse(res, `No file uploaded`, null, 400);
      }

      const fileEntry = await model.create({
        filename: req.file.filename,
        user_id: userId,
      });

      successResponse(res, fileEntry, "Image uploaded", 201);
    } catch (err) {
      errorResponse(res, `Error in uploading image: ${err.message}`, err, 500);
    }
  }
);

imageController.delete(
  `/${url}/:id`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { id } = req.params;

      const imageFile = await model.findOne({
        where: { id: id, user_id: userId },
      });

      if (!imageFile) {
        return errorResponse(
          res,
          `Image with id: ${id} belonging to user with id: ${userId} not found`,
          null,
          404
        );
      }

      const filePath = path.join("/app/images", imageFile.filename);

      await model.destroy({ where: { id: id, user_id: userId } });

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      successResponse(res, null, `Image with id: ${id} successfully deleted`);
    } catch (err) {
      errorResponse(res, `Error in deleting image: ${err.message}`, err, 500);
    }
  }
);
