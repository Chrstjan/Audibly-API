import express from "express";
import { FavoriteArtist as model } from "../models/favorite_artist.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { requiresRole } from "../utils/role.auth.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { User } from "../models/user.model.js";

export const favoriteArtistController = express.Router();
const url = "favorite-artist";

/***************************
 * Add artist to favorites
 ***************************/
favoriteArtistController.post(`/${url}/:id`, Authorize, async (req, res) => {
  try {
    const userId = await getUserFromToken(req, res);
    const { id } = req.params;

    const artist = await User.findOne({
      where: { id: id },
    });

    if (!artist) {
      return errorResponse(res, `Artist with id: ${id} not found`, null, 404);
    }

    const alreadyFavorite = await model.findOne({
      where: { artist_id: id, user_id: userId },
    });

    if (alreadyFavorite) {
      return errorResponse(res, `Artist already in favorites`);
    }

    const result = await model.create({
      user_id: userId,
      artist_id: id,
    });

    if (!result) {
      return errorResponse(
        res,
        `Error in adding artist with id: ${id} to favorites`,
        null
      );
    }

    successResponse(res, result, "success", 201);
  } catch (err) {
    errorResponse(
      res,
      `Error in adding artist to favorites: ${err.message}`,
      err,
      500
    );
  }
});

/*******************************
 * Remove artist from favorites
 *******************************/
favoriteArtistController.delete(`/${url}/:id`, Authorize, async (req, res) => {
  try {
    const userId = await getUserFromToken(req, res);
    const { id } = req.params;

    const result = await model.destroy({
      where: { id: id, user_id: userId },
    });

    if (!result) {
      return errorResponse(res, `Favorite with id: ${id} not found`);
    }

    successResponse(res, `Artist removed from favorites`, "success");
  } catch (err) {
    errorResponse(
      res,
      `Error in removing artist from favorites: ${err.message}`,
      err,
      500
    );
  }
});
