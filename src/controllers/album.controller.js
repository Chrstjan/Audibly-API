import express from "express";
import { Album as model } from "../models/album.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/query.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { User } from "../models/user.model.js";
import { Song } from "../models/song.model.js";
import { Genre } from "../models/genre.model.js";
import { Image } from "../models/image.model.js";
import { SongInfo } from "../models/song_info.model.js";

export const albumController = express.Router();
const url = "album";

/*******************
 * Gets single album
 *******************/
albumController.get(`/${url}/:slug`, async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await model.findOne({
      where: { slug: slug },
      attributes: getQueryAttributes(req.query, "id,name,slug", "album"),
      order: getQueryOrder(req.query, "album"),
      include: [
        {
          model: User,
          as: "artist",
          attributes: getQueryAttributes(
            {},
            "id,username,avatar,role",
            "artist"
          ),
          order: getQueryOrder(req.query, "artist"),
        },
        {
          model: Song,
          as: "songs",
          attributes: getQueryAttributes(
            req.query,
            "id,name,slug,num_plays,is_single",
            "song"
          ),
          order: getQueryOrder(req.query, "song"),
          limit: getQueryLimit(req.query, "song"),
          include: [
            {
              model: Genre,
              as: "genre",
              attributes: getQueryAttributes(
                req.query,
                "id,name,slug",
                "genre"
              ),
              order: getQueryOrder(req.query, "genre"),
            },
            {
              model: User,
              as: "artist",
              attributes: getQueryAttributes(
                {},
                "id,username,avatar,role",
                "user"
              ),
              order: getQueryOrder(req.query, "user"),
            },
            {
              model: Image,
              as: "image",
              attributes: getQueryAttributes(req.query, "id,filename"),
              order: getQueryOrder(req.query, "image"),
            },
            {
              model: SongInfo,
              as: "info",
              attributes: getQueryAttributes(
                req.query,
                "id,length,original_artist_id,original_artist_name",
                "info"
              ),
              order: getQueryOrder(req.query, "info"),
            },
          ],
        },
      ],
    });

    if (!result) {
      return errorResponse(
        res,
        `Album with slug: ${slug} not found`,
        null,
        404
      );
    }

    successResponse(res, result, "success", 200);
  } catch (err) {
    errorResponse(res, `Error in getting album: ${err.message}`, err, 500);
  }
});

/*******************
 * Creates album
 *******************/
albumController.post(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const data = req.body;

      data.user_id = userId;

      const doesAlbumExist = await model.findAll({
        where: { name: data.name },
      });

      if (doesAlbumExist.length > 0) {
        data.slug = `${data.name.trim().toLowerCase().replace(/\s+/g, "-")}-${
          doesAlbumExist.length
        }`;
      } else {
        data.slug = data.name.trim().toLowerCase().replace(/\s+/g, "-");
      }

      const result = await model.create(data);

      if (!result) {
        return errorResponse(res, `Error in creating album`, result);
      }

      successResponse(res, result, "success", 201);
    } catch (err) {
      errorResponse(res, `Error in creating album: ${err.message}`, err, 500);
    }
  }
);

/*******************
 * Update album
 *******************/
albumController.patch(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const data = req.body;

      data.user_id = userId;
      data.slug = data.name.trim().toLowerCase().replace(/\s+/g, "-");

      const album = await model.findOne({
        where: { id: data.id, user_id: userId },
      });

      if (!album) {
        return errorResponse(
          res,
          `Album with id: ${data.id} belonging to user not found`,
          null,
          404
        );
      }

      const [updated] = await model.update(data, {
        where: { id: data.id, user_id: data.user_id },
      });

      if (!updated) {
        return errorResponse(res, `Error in updating album`, updated);
      }

      successResponse(res, { ...data }, "update success");
    } catch (err) {
      errorResponse(res, `Error in updating album: ${err.message}`, err, 500);
    }
  }
);

/*******************
 * Delete album
 *******************/
albumController.delete(
  `/${url}/:id`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { id } = req.params;

      const album = await model.findOne({
        where: { id: id, user_id: userId },
      });

      if (!album) {
        return errorResponse(
          res,
          `Album with id: ${id} belonging to user not found`,
          null,
          404
        );
      }

      const result = await model.destroy({
        where: { id: id, user_id: userId },
      });

      if (!result) {
        return errorResponse(res, `Error in deleting album`, result);
      }

      successResponse(res, `Album with id: ${id} deleted`, "success");
    } catch (err) {
      errorResponse(res, `Error in deleting album: ${err.message}`, err, 500);
    }
  }
);
