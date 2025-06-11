import express from "express";
import dotenv from "dotenv";
import { User as model } from "../models/user.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/query.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { Playlist } from "../models/playlist.model.js";

dotenv.config();
const port = process.env.PORT;
const domain = process.env.DOMAIN || `http://localhost:${port}`;

export const adminController = express.Router();
const url = "admin-dashboard";

adminController.get(
  `/${url}`,
  Authorize,
  requiresRole("admin"),
  async (req, res) => {
    try {
      res.send({
        message: "Welcome admin",
        links: {
          users: `${domain}/admin-dashboard/users`,
        },
      });
    } catch (err) {
      return errorResponse(
        res,
        `Something went wrong: ${err.message}`,
        err,
        500
      );
    }
  }
);

adminController.get(
  `/${url}/users`,
  Authorize,
  requiresRole("admin"),
  async (req, res) => {
    try {
      const result = await model.findAll({
        attributes: getQueryAttributes(
          {},
          "id,username,role,avatar,description",
          "user"
        ),
        order: getQueryOrder(req.query, "user"),
        limit: getQueryLimit(req.query, "user"),
        include: [
          {
            model: Song,
            as: "songs",
            attributes: getQueryAttributes(
              req.query,
              "id,name,slug,album_id,is_single,num_plays",
              "song"
            ),
            order: getQueryOrder(req.query, "song"),
            limit: getQueryLimit(req.query, "song"),
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
        ],
      });

      if (!result) {
        return errorResponse(res, `No users found`, result, 404);
      }

      res.send({
        links: {
          home: `${domain}/admin-dashboard`,
        },
        message: "Users list",
        users: result,
      });
    } catch (err) {
      return errorResponse(
        res,
        `Error in gettings users: ${err.message}`,
        err,
        500
      );
    }
  }
);
