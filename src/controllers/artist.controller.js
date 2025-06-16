import express from "express";
import { Op } from "@sequelize/core";
import { User as model } from "../models/user.model.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/query.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { Song } from "../models/song.model.js";
import { Genre } from "../models/genre.model.js";
import { Album } from "../models/album.model.js";
import { Image } from "../models/image.model.js";
import { Playlist } from "../models/playlist.model.js";

export const artistController = express.Router();
const url = "artist";

/***********************
 * Gets single artist
 ***********************/
artistController.get(`/${url}/:id`, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await model.findOne({
      where: {
        id: id,
        role: {
          [Op.or]: ["artist", "admin"],
        },
      },
      attributes: getQueryAttributes(
        {},
        "id,username,role,avatar,description",
        "user"
      ),
      order: getQueryOrder(req.query, "user"),
      include: [
        {
          model: Song,
          as: "songs",
          attributes: getQueryAttributes(
            req.query,
            "id,name,slug,is_single,num_plays,song_info",
            "song"
          ),
          order: getQueryOrder(req.query, "song"),
          limit: getQueryLimit(req.query, "song"),
          include: [
            {
              model: Image,
              as: "image",
              attributes: getQueryAttributes(req.query, "id,filename", "image"),
              order: getQueryOrder(req.query, "image"),
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
              model: Genre,
              as: "genre",
              attributes: getQueryAttributes(
                req.query,
                "id,name,slug",
                "song_genre"
              ),
              order: getQueryOrder(req.query, "song_genre"),
            },
          ],
        },
        {
          model: Album,
          as: "albums",
          attributes: getQueryAttributes(
            req.query,
            "id,name,slug,image",
            "album"
          ),
          order: getQueryOrder(req.query, "album"),
          limit: getQueryLimit(req.query, "album"),
        },
        {
          model: Playlist,
          as: "playlists",
          where: { is_public: true },
          attributes: getQueryAttributes(req.query, "id,name,slug", "playlist"),
          order: getQueryOrder(req.query, "playlist"),
          limit: getQueryLimit(req.query, "playlist"),
        },
      ],
    });

    if (!result) {
      return errorResponse(res, `Artist with id: ${id} not found`, result, 404);
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
    errorResponse(res, `Error in getting artist: ${err.message}`, err, 500);
  }
});
