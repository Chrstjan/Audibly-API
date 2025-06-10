import express from "express";
import { Song as model } from "../models/song.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/query.utils.js";
import { addMediaUrl } from "../utils/media.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { User } from "../models/user.model.js";
import { Album } from "../models/album.model.js";
import { Genre } from "../models/genre.model.js";
import { Image } from "../models/image.model.js";
import { Audiofile } from "../models/audiofile.model.js";
import { SongInfo } from "../models/song_info.model.js";
import { SongContributor } from "../models/song_contributor.model.js";

export const songController = express.Router();
const url = "songs";

/*****************
 * Gets all songs
 *****************/
songController.get(`/${url}`, async (req, res) => {
  try {
    const result = await model.findAll({
      attributes: getQueryAttributes(
        req.query,
        "id,name,slug,num_plays,is_single",
        "song"
      ),
      order: getQueryOrder(req.query, "song"),
      limit: getQueryLimit(req.query, "song"),
      include: [
        {
          model: User,
          as: "artist",
          attributes: getQueryAttributes({}, "id,username,avatar,role", "user"),
          order: getQueryOrder(req.query, "user"),
        },
        {
          model: Album,
          as: "album",
          attributes: getQueryAttributes(req.query, "id,name,slug", "album"),
          order: getQueryOrder(req.query, "album"),
        },
        {
          model: Genre,
          as: "genre",
          attributes: getQueryAttributes(req.query, "id,name,slug", "genre"),
          order: getQueryOrder(req.query, "genre"),
        },
        {
          model: Image,
          as: "image",
          attributes: getQueryAttributes(req.query, "id,filename"),
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
    });

    if (!result) {
      return errorResponse(res, `No songs found`, null, 404);
    }

    successResponse(res, result, "success", 200);
  } catch (err) {
    errorResponse(res, `Error in getting songs: ${err.message}`, err, 500);
  }
});

/*******************
 * Gets single song
 *******************/
songController.get(`/${url}/:slug`, async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await model.findOne({
      where: { slug: slug },
      attributes: getQueryAttributes(
        req.query,
        "id,name,slug,num_plays,is_single",
        "song"
      ),
      order: getQueryOrder(req.query, "song"),
      include: [
        {
          model: User,
          as: "artist",
          attributes: getQueryAttributes({}, "id,username,avatar,role", "user"),
          order: getQueryOrder(req.query, "user"),
        },
        {
          model: Album,
          as: "album",
          attributes: getQueryAttributes(req.query, "id,name,slug", "album"),
          order: getQueryOrder(req.query, "album"),
        },
        {
          model: Genre,
          as: "genre",
          attributes: getQueryAttributes(req.query, "id,name,slug", "genre"),
          order: getQueryOrder(req.query, "genre"),
        },
        {
          model: Image,
          as: "image",
          attributes: getQueryAttributes(req.query, "id,filename"),
          order: getQueryOrder(req.query, "image"),
        },
        {
          model: Audiofile,
          as: "audiofile",
          attributes: getQueryAttributes(req.query, "id,filename"),
          order: getQueryOrder(req.query, "audiofile"),
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
        {
          model: SongContributor,
          as: "contributors",
          attributes: getQueryAttributes(req.query, "id,role", "contributor"),
          order: getQueryOrder(req.query, "contributor"),
          limit: getQueryLimit(req.query, "contributor"),
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
          ],
        },
      ],
    });

    if (!result) {
      return errorResponse(res, `Song with slug: ${slug} not found`, null, 404);
    }

    if (result) {
      if (result?.audiofile?.filename) {
        result.audiofile.dataValues.url = addMediaUrl(
          "audiofile",
          result.audiofile.filename
        );
      }

      if (result?.image?.filename) {
        result.image.dataValues.url = addMediaUrl(
          "image",
          result.image.filename
        );
      }

      successResponse(res, result, "success", 200);
    }
  } catch (err) {
    errorResponse(
      res,
      `Error in getting song from slug: ${err.message}`,
      err,
      500
    );
  }
});

/*******************
 * Creates song
 *******************/
songController.post(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const data = req.body;

      data.user_id = userId;

      const doesSongExist = await model.findAll({
        where: { name: data.name },
      });

      if (doesSongExist.length > 0) {
        data.slug = `${data.name.trim().toLowerCase().replace(/\s+/g, "-")}-${
          doesSongExist.length
        }`;
      } else {
        data.slug = data.name.trim().toLowerCase().replace(/\s+/g, "-");
      }

      const result = await model.create(data);

      if (!result) {
        return errorResponse(res, `Error in creating song`, result);
      }

      successResponse(res, result, "success", 201);
    } catch (err) {
      errorResponse(res, `Error in creating song: ${err.message}`, err, 500);
    }
  }
);

/*******************
 * Updates song
 *******************/
songController.patch(
  `/${url}`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const data = req.body;

      data.user_id = userId;
      data.slug = data.name.trim().toLowerCase().replace(/\s+/g, "-");

      const song = await model.findOne({
        where: { id: data.id, user_id: userId },
      });

      if (!song) {
        return errorResponse(
          res,
          `Song with id: ${data.id} belonging to user not found`,
          null,
          404
        );
      }

      const [updated] = await model.update(data, {
        where: { id: data.id, user_id: data.user_id },
      });

      if (!updated) {
        return errorResponse(
          res,
          `Error in updating song with id: ${data.id}`,
          null
        );
      }

      successResponse(res, { ...data }, "update success");
    } catch (err) {
      errorResponse(res, `Error in updating song: ${err.message}`, err, 500);
    }
  }
);

/*******************
 * Deletes song
 *******************/
songController.delete(
  `/${url}/:id`,
  Authorize,
  requiresRole(["artist", "admin"]),
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { id } = req.params;

      const song = await model.findOne({
        where: { id: id, user_id: userId },
      });

      if (!song) {
        return errorResponse(
          res,
          `Song with id: ${id} belonging to user not found`,
          null,
          404
        );
      }

      const result = await model.destroy({
        where: { id: id, user_id: userId },
      });

      if (!result) {
        return errorResponse(`Error in deleteting song with id: ${id}`, result);
      }

      successResponse(res, `Song with id: ${id} deleted`, "success");
    } catch (err) {
      errorResponse(res, `Error in updating song: ${err.message}`, err, 500);
    }
  }
);
