import express from "express";
import { SongContributor as model } from "../models/song_contributor.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { Song } from "../models/song.model.js";

export const songContributorController = express.Router();
const url = "song-contributor";

/*******************
 * Creates song contributor
 *******************/
songContributorController.post(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const data = req.body;

      data.user_id = userId;

      const song = await Song.findOne({
        where: { id: data.song_id, user_id: userId },
      });

      if (!song) {
        return errorResponse(
          res,
          `Song with id: ${data.song_id} belonging to user not found`,
          null,
          404
        );
      }

      const result = await model.create(data);

      if (!result) {
        return errorResponse(res, `Error in creating song contributor`, result);
      }

      successResponse(res, result, "success", 201);
    } catch (err) {
      errorResponse(
        res,
        `Error in creating song contributor: ${err.message}`,
        err,
        500
      );
    }
  }
);

/*******************
 * Updates song contributor
 *******************/
songContributorController.patch(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const data = req.body;

      data.user_id = userId;

      const songContributor = await model.findOne({
        where: { id: data.id, song_id: data.song_id, user_id: userId },
      });

      if (!songContributor) {
        return errorResponse(
          res,
          `Song contributor with id: ${data.id} belonging to user not found`,
          null,
          404
        );
      }

      const [updated] = await model.update(data, {
        where: { id: data.id, song_id: data.song_id, user_id: data.user_id },
      });

      if (!updated) {
        return errorResponse(
          res,
          `Error in updating song contributor`,
          updated
        );
      }

      successResponse(res, { ...data }, "update success");
    } catch (err) {
      errorResponse(
        res,
        `Error in updating song contributor: ${err.message}`,
        err,
        500
      );
    }
  }
);

/*******************
 * Deletes song contributor
 *******************/
songContributorController.delete(
  `/${url}/:songId/:id`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { songId, id } = req.params;

      const songContributor = await model.findOne({
        where: { id: id, song_id: songId, user_id: userId },
      });

      if (!songContributor) {
        return errorResponse(
          res,
          `Song contributor with id: ${id} belonging to user not found`,
          null,
          404
        );
      }

      const result = await model.destroy({
        where: { id: id, song_id: songId, user_id: userId },
      });

      if (!result) {
        return errorResponse(res, `Error in deleting song contributor`, result);
      }

      successResponse(
        res,
        `Song contributor with id: ${id} deleted`,
        "success"
      );
    } catch (err) {
      errorResponse(
        res,
        `Error in deleting song contributor: ${err.message}`,
        err,
        500
      );
    }
  }
);
