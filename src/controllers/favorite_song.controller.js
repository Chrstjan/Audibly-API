import express from "express";
import { FavoriteSong as model } from "../models/favorite_song.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { Song } from "../models/song.model.js";

export const favoriteSongController = express.Router();
const url = "favorite-song";

favoriteSongController.post(
  `/${url}/:id`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { id } = req.params;

      const song = await Song.findOne({
        where: { id: id },
      });

      if (!song) {
        return errorResponse(res, `Song with id: ${id} not found`, null, 404);
      }

      const alreadyFavorite = await model.findOne({
        where: { song_id: id, user_id: userId },
      });

      if (alreadyFavorite) {
        return errorResponse(res, `Song already in favorites`);
      }

      const result = await model.create({
        user_id: userId,
        song_id: id,
      });

      if (!result) {
        return errorResponse(
          res,
          `Error in adding song with id: ${id} to favorites`,
          null
        );
      }

      successResponse(res, result, "success", 201);
    } catch (err) {
      errorResponse(
        res,
        `Error in adding song to favorites: ${err.message}`,
        err,
        500
      );
    }
  }
);

favoriteSongController.delete(
  `/${url}/:id`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { id } = req.params;

      const result = await model.destroy({
        where: { id: id, user_id: userId },
      });

      if (!result) {
        return errorResponse(res, `Favorite with id: ${id} not found`);
      }

      successResponse(res, `Song removed from favorites`, "success");
    } catch (err) {
      errorResponse(
        res,
        `Error in removing song from favorites: ${err.message}`,
        err,
        500
      );
    }
  }
);
