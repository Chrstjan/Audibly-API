import express from "express";
import { User as model, User } from "../models/user.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/query.utils.js";
import { Song } from "../models/song.model.js";
import { Image } from "../models/image.model.js";
import { Album } from "../models/album.model.js";
import { Playlist } from "../models/playlist.model.js";
import { FavoriteArtist } from "../models/favorite_artist.model.js";
import { FavoriteSong } from "../models/favorite_song.model.js";

export const userController = express.Router();
const url = "user";

userController.get(`/${url}`, Authorize, async (req, res) => {
  try {
    const userId = await getUserFromToken(req, res);

    const result = await model.findOne({
      where: { id: userId },
      attributes: getQueryAttributes(
        req.query,
        "id,email,username,role,avatar,description",
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
          attributes: getQueryAttributes(
            req.query,
            "id,name,slug,is_public",
            "playlist"
          ),
          order: getQueryOrder(req.query, "playlist"),
          limit: getQueryLimit(req.query, "playlist"),
        },
        {
          model: FavoriteArtist,
          as: "favorite_artists",
          attributes: getQueryAttributes(
            req.query,
            "id,artist_id",
            "favorite_artist"
          ),
          order: getQueryOrder(req.query, "favorite_artist"),
          limit: getQueryLimit(req.query, "favorite_artist"),
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
          ],
        },
        {
          model: FavoriteSong,
          as: "favorite_songs",
          attributes: getQueryAttributes(
            req.query,
            "id,song_id",
            "favorite_song"
          ),
          order: getQueryOrder(req.query, "favorite_song"),
          limit: getQueryLimit(req.query, "favorite_song"),
          include: [
            {
              model: Song,
              as: "song",
              attributes: getQueryAttributes(
                req.query,
                "id,name,slug,is_single,song_info",
                "song_favorite"
              ),
              order: getQueryOrder(req.query, "song_favorite"),
            },
          ],
        },
      ],
    });

    if (!result) {
      return errorResponse(res, `Could not find user with id: ${userId}`);
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
    errorResponse(res, `Error in getting user: ${err.message}`, err, 500);
  }
});

userController.post(`/${url}`, async (req, res) => {
  try {
    const data = req.body;

    let doesExists = await model.findOne({ where: { email: data.email } });

    if (doesExists) {
      return errorResponse(res, `Account with that email already exists`);
    } else {
      const result = await model.create(data);

      successResponse(
        res,
        {
          email: result.email,
          username: result.username,
          role: result.role,
        },
        "Account created successfully",
        201
      );
    }
  } catch (err) {
    errorResponse(res, `Error in creating Account: ${err.message}`, err, 500);
  }
});

userController.patch(`/${url}`, Authorize, async (req, res) => {
  try {
    const userId = await getUserFromToken(req, res);
    const data = req.body;

    const [updated] = await model.update(data, {
      where: { id: userId },
    });

    if (!updated) {
      return errorResponse(res, `No user with the id: ${userId} found`, 404);
    }

    successResponse(res, { ...userId, ...data }, "User updated successfully");
  } catch (err) {
    errorResponse(res, `Error in updating user: ${err.message}`, err, 500);
  }
});

userController.delete(`/${url}`, Authorize, async (req, res) => {
  try {
    const userId = await getUserFromToken(req, res);

    const result = await model.destroy({
      where: { id: userId },
    });

    if (!result) {
      return errorResponse(res, `User with the id: ${userId} not found`, 404);
    }

    successResponse(res, "User and related files deleted successfully");
  } catch (err) {
    errorResponse(res, `Error in deleteing user: ${err.message}`, err, 500);
  }
});
