import express from "express";
import sequelize from "../config/sequelize.config.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { copyFilesToVolume } from "../utils/seed.audiofile.utils.js";
import { seedFromCsv } from "../utils/seed.utils.js";
import { Genre } from "../models/genre.model.js";
import { Album } from "../models/album.model.js";
import { Audiofile } from "../models/audiofile.model.js";
import { Image } from "../models/image.model.js";
import { Song } from "../models/song.model.js";
import { SongInfo } from "../models/song_info.model.js";
import { SongContributor } from "../models/song_contributor.model.js";

export const dbController = express.Router();

dbController.get("/api", async (req, res) => {
  try {
    await sequelize.authenticate();
    successResponse(res, "DB Connection", 200);
  } catch (err) {
    errorResponse(res, `Error could not find db: ${err.message}`, err, 500);
  }
});

dbController.get("/sync", async (req, res) => {
  try {
    const resp = await sequelize.sync({ alter: true });
    successResponse(res, "DB synced", 200);
  } catch (err) {
    errorResponse(res, `Error in DB sync: ${err.message}`, err, 500);
  }
});

dbController.get("/seed", async (req, res) => {
  try {
    await sequelize.sync();

    copyFilesToVolume();

    const files_to_seed = [
      { file: "genre.csv", model: Genre },
      { file: "album.csv", model: Album },
      { file: "audiofile.csv", model: Audiofile },
      { file: "image.csv", model: Image },
      { file: "song.csv", model: Song },
      { file: "song_info.csv", model: SongInfo },
      { file: "song_contributor.csv", model: SongContributor },
    ];

    const files_seeded = [];

    for (let item of files_to_seed) {
      files_seeded.push(await seedFromCsv(item.file, item.model));
    }

    successResponse(res, { "Files seeded": files_seeded }, "Seeding complete");
  } catch (err) {
    errorResponse(res, `Seeding failed: ${err.message}`, err);
  }
});
