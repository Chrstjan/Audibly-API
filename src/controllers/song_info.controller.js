import express from "express";
import { Song as model } from "../models/song.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import { validateStructure } from "../utils/structure.validation.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";

export const songInfoController = express.Router();
const url = "song-info";

/*******************
 * Creates song info
 *******************/
songInfoController.post(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { song_id, ...info } = req.body;

      const song = await model.findOne({
        where: { id: song_id, user_id: userId },
      });

      if (!song) {
        return errorResponse(
          res,
          `Song belonging to user not found`,
          null,
          404
        );
      }

      if (song.song_info && Object.keys(song.song_info).length > 0) {
        return errorResponse(res, `Song already has info`, null, 400);
      }

      if (!validateStructure(info, "song_info")) {
        return errorResponse(res, `Invalid fields in song_info`, null, 400);
      }

      song.song_info = info;

      const result = await song.save();

      successResponse(res, result.song_info, "success", 201);
    } catch (err) {
      errorResponse(
        res,
        `Error in creating song info: ${err.message}`,
        err,
        500
      );
    }
  }
);

/*******************
 * Updates song info
 *******************/
songInfoController.patch(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { song_id, ...newInfo } = req.body;

      const song = await model.findOne({
        where: { id: song_id, user_id: userId },
      });

      if (!song || !song.song_info) {
        return errorResponse(res, `Song info not found`, null, 404);
      }

      if (!validateStructure(newInfo, "song_info")) {
        return errorResponse(res, `Invalid fields in song_info`, null, 400);
      }

      song.song_info = { ...song.song_info, ...newInfo };

      await song.save();

      successResponse(res, song.song_info, "update success");
    } catch (err) {
      errorResponse(
        res,
        `Error in updating song info: ${err.message}`,
        err,
        500
      );
    }
  }
);

/*******************
 * Deletes song info
 *******************/
songInfoController.delete(
  `/${url}/:songId`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { songId } = req.params;

      const song = await model.findOne({
        where: { id: songId, user_id: userId },
      });

      if (!song || !song.song_info) {
        return errorResponse(res, `Song info not found`, null, 404);
      }

      song.song_info = null;

      await song.save();

      successResponse(res, `Song info deleted`, "success");
    } catch (err) {
      errorResponse(
        res,
        `Error in deleting song info: ${err.message}`,
        err,
        500
      );
    }
  }
);
