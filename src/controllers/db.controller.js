import express from "express";
import sequelize from "../config/sequelize.config.js";
import { Authorize } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import { copyFilesToVolume } from "../utils/seed.uploads.utils.js";
import { seedFromCsv } from "../utils/seed.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { Genre } from "../models/genre.model.js";
import { Audiofile } from "../models/audiofile.model.js";
import { Image } from "../models/image.model.js";

export const dbController = express.Router();

dbController.get("/api", Authorize, requiresRole("admin"), async (req, res) => {
  try {
    await sequelize.authenticate();
    successResponse(res, "DB Connection", 200);
  } catch (err) {
    errorResponse(res, `Error could not find db: ${err.message}`, err, 500);
  }
});

dbController.get(
  "/sync",
  Authorize,
  requiresRole("admin"),
  async (req, res) => {
    try {
      const resp = await sequelize.sync({ alter: true });
      successResponse(res, "DB synced", 200);
    } catch (err) {
      errorResponse(res, `Error in DB sync: ${err.message}`, err, 500);
    }
  }
);

dbController.get(
  "/seed",
  Authorize,
  requiresRole("admin"),
  async (req, res) => {
    try {
      await sequelize.sync();

      copyFilesToVolume();

      const files_to_seed = [
        { file: "genre.csv", model: Genre },
        { file: "audiofile.csv", model: Audiofile },
        { file: "image.csv", model: Image },
      ];

      const files_seeded = [];

      for (let item of files_to_seed) {
        files_seeded.push(await seedFromCsv(item.file, item.model));
      }

      successResponse(
        res,
        { "Files seeded": files_seeded },
        "Seeding complete"
      );
    } catch (err) {
      errorResponse(res, `Seeding failed: ${err.message}`, err);
    }
  }
);
