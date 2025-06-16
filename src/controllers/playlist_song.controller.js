import express from "express";
import { PlaylistSong as model } from "../models/playlist_song.model.js";
import { Authorize, getUserFromToken } from "../utils/auth.utils.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { Song } from "../models/song.model.js";
import { Playlist } from "../models/playlist.model.js";

export const playlistSongController = express.Router();
const url = "playlist-song";

/***********************
 * Add song to playlist
 ***********************/
playlistSongController.post(
  `/${url}/:playlistId/:songId`,
  Authorize,
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { playlistId, songId } = req.params;

      const song = await Song.findOne({
        where: { id: songId },
      });

      if (!song) {
        return errorResponse(res, `Song not found`, null, 404);
      }

      const playlist = await Playlist.findOne({
        where: { id: playlistId, user_id: userId },
      });

      if (!playlist) {
        return errorResponse(
          res,
          `Playlist belonging to user not found`,
          null,
          404
        );
      }

      const songInPlaylist = await model.findOne({
        where: { user_id: userId, song_id: songId, playlist_id: playlistId },
      });

      if (songInPlaylist) {
        return errorResponse(res, `Song is already in playlist`);
      }

      const result = await model.create({
        user_id: userId,
        playlist_id: playlistId,
        song_id: songId,
      });

      if (!result) {
        return errorResponse(res, "Error in adding song to playlist", result);
      }

      successResponse(res, result, "success", 201);
    } catch (err) {
      errorResponse(
        res,
        `Error in adding song to playlist: ${err.message}`,
        err,
        500
      );
    }
  }
);

/****************************
 * Remove song from playlist
 ****************************/
playlistSongController.delete(
  `/${url}/:songId/:id`,
  Authorize,
  async (req, res) => {
    try {
      const userId = await getUserFromToken(req, res);
      const { songId, id } = req.params;

      const songInPlaylist = await model.findOne({
        where: { id: id, song_id: songId, user_id: userId },
      });

      if (!songInPlaylist) {
        return errorResponse(
          res,
          `Song with id: ${songId} not found in playlist`,
          null,
          404
        );
      }

      const result = await model.destroy({
        where: { id: id, song_id: songId, user_id: userId },
      });

      if (!result) {
        return errorResponse(res, `Error in removing song from playlist`);
      }

      successResponse(res, "song removed from playlist", "success");
    } catch (err) {
      errorResponse(
        res,
        `Error in removing song from playlist: ${err.message}`,
        err,
        500
      );
    }
  }
);
