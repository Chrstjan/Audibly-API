import express from "express";
import { Playlist as model } from "../models/playlist.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/query.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { User } from "../models/user.model.js";
import { Song } from "../models/song.model.js";
import { Genre } from "../models/genre.model.js";
import { Album } from "../models/album.model.js";
import { Image } from "../models/image.model.js";

export const playlistController = express.Router();
const url = "playlist";

/***********************
 * Gets single playlist
 ***********************/
playlistController.get(`/${url}/:slug`, async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await model.findOne({
      where: { slug: slug, is_public: true },
      attributes: getQueryAttributes(req.query, "id,name,slug", "playlist"),
      order: getQueryOrder(req.query, "playlist"),
      include: [
        {
          model: User,
          as: "user",
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
            "id,name,slug,num_plays,is_single,song_info",
            "song"
          ),
          through: {
            attributes: getQueryAttributes(
              req.query,
              "id,user_id,playlist_id",
              "playlist_rel"
            ),
            as: "playlist_rel_info",
          },
          order: getQueryOrder(req.query, "song"),
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
              attributes: getQueryAttributes({}, "id,username", "user"),
              order: getQueryOrder(req.query, "user"),
            },
            {
              model: Album,
              as: "album",
              attributes: getQueryAttributes(
                req.query,
                "id,name,slug,image",
                "song_album"
              ),
              order: getQueryOrder(req.query, "song_album"),
            },
            {
              model: Image,
              as: "image",
              attributes: getQueryAttributes(req.query, "id,filename"),
              order: getQueryOrder(req.query, "image"),
            },
          ],
        },
      ],
    });

    if (!result) {
      return errorResponse(
        res,
        `Playlist with slug: ${slug} not found`,
        null,
        404
      );
    }

    for (const item of result?.dataValues?.songs) {
      if (typeof item.song_info === "string") {
        item.song_info = JSON.parse(item.song_info);
      }

      if (item?.is_single) {
        delete item.dataValues.album;
      }
    }

    successResponse(res, result, "success", 200);
  } catch (err) {
    errorResponse(res, `Error in getting playlist: ${err.message}`, err, 500);
  }
});

/*******************
 * Creates playlist
 *******************/
playlistController.post(`/${url}`, Authorize, async (req, res) => {
  try {
    const userId = await getUserFromToken(req, res);
    const data = req.body;

    data.user_id = userId;

    const doesPlaylistExist = await model.findAll({
      where: { name: data.name },
    });

    if (doesPlaylistExist.length > 0) {
      data.slug = `${data.name.trim().toLowerCase().replace(/\s+/g, "-")}-${
        doesPlaylistExist.length
      }`;
    } else {
      data.slug = data.name.trim().toLowerCase().replace(/\s+/g, "-");
    }

    //Converting strings to boolean
    if (data) {
      if (data.is_public == "true") data.is_public = true;
      if (data.is_public == "false") data.is_public = false;
    }

    const result = await model.create(data);

    if (!result) {
      return errorResponse(res, `Error in creating playlist`, result);
    }

    successResponse(res, result, "success", 201);
  } catch (err) {
    errorResponse(res, `Error in creating playlist: ${err.message}`, err, 500);
  }
});

/*******************
 * Updates playlist
 *******************/
playlistController.patch(`/${url}`, Authorize, async (req, res) => {
  try {
    const userId = await getUserFromToken(req, res);
    const data = req.body;

    data.user_id = userId;
    data.slug = data.name.trim().toLowerCase().replace(/\s+/g, "-");

    const playlist = await model.findOne({
      where: { id: data.id, user_id: userId },
    });

    if (!playlist) {
      return errorResponse(
        res,
        `Playlist with id: ${data.id} belonging to user not found`,
        null,
        404
      );
    }

    //Converting strings to boolean
    if (data) {
      if (data.is_public == "true") data.is_public = true;
      if (data.is_public == "false") data.is_public = false;
    }

    const [updated] = await model.update(data, {
      where: { id: data.id, user_id: data.user_id },
    });

    if (!updated) {
      return errorResponse(res, `Error in updating playlist`, updated);
    }

    successResponse(res, { ...data }, "update success");
  } catch (err) {
    errorResponse(res, `Error in updating playlist: ${err.message}`, err, 500);
  }
});

/*******************
 * Deletes playlist
 *******************/
playlistController.delete(`/${url}/:id`, Authorize, async (req, res) => {
  try {
    const userId = await getUserFromToken(req, res);
    const { id } = req.params;

    const playlist = await model.findOne({
      where: { id: id, user_id: userId },
    });

    if (!playlist) {
      return errorResponse(
        res,
        `Playlist with id: ${id} belonging to user not found`,
        null,
        404
      );
    }

    const result = await model.destroy({
      where: { id: id, user_id: userId },
    });

    if (!result) {
      return errorResponse(res, `Error in deleting playlist`, result);
    }

    successResponse(res, `Playlist with id: ${id} deleted`, "success");
  } catch (err) {
    errorResponse(res, `Error in deleting playlist: ${err.message}`, err, 500);
  }
});
