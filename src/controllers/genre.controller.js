import express from "express";
import { Genre as model } from "../models/genre.model.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/query.utils.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";
import { Image } from "../models/image.model.js";
import { SongInfo } from "../models/song_info.model.js";

export const genreController = express.Router();
const url = "genre";

genreController.get(`/${url}`, async (req, res) => {
  try {
    const result = await model.findAll({
      attributes: getQueryAttributes(req.query, "id,name,slug,image", "genre"),
      order: getQueryOrder(req.query, "genre"),
      limit: getQueryLimit(req.query, "genre"),
    });

    if (!result) {
      return errorResponse(res, `No genres found`);
    }

    successResponse(res, result, "success");
  } catch (err) {
    errorResponse(res, `Error in getting genres: ${err.message}`, err, 500);
  }
});

genreController.get(`/${url}/:slug`, async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await model.findOne({
      where: { slug: slug },
      attributes: getQueryAttributes(req.query, "id,name,slug", "genre"),
      order: getQueryOrder(req.query, "genre"),
      include: [
        {
          model: Song,
          as: "songs",
          attributes: getQueryAttributes(
            req.query,
            "id,name,slug,num_plays",
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
              model: SongInfo,
              as: "info",
              attributes: getQueryAttributes(
                req.query,
                "id,song_id,length",
                "song_info"
              ),
              order: getQueryOrder(req.query, "song_order"),
            },
            {
              model: User,
              as: "artist",
              attributes: getQueryAttributes(
                {},
                "id,username,avatar",
                "artist"
              ),
              order: getQueryOrder(req.query, "artist"),
            },
          ],
        },
      ],
    });

    if (!result) {
      return errorResponse(res, `Genre with slug: ${slug} not found`);
    }

    successResponse(res, result, "success");
  } catch (err) {
    errorResponse(res, `Error in getting genres: ${err.message}`, err, 500);
  }
});
