import { importModels, Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import dotenv from "dotenv";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { User } from "../models/user.model.js";
import { Album } from "../models/album.model.js";
import { Genre } from "../models/genre.model.js";
import { Audiofile } from "../models/audiofile.model.js";
import { Image } from "../models/image.model.js";
import { Song } from "../models/song.model.js";
import { SongInfo } from "../models/song_info.model.js";
import { SongContributor } from "../models/song_contributor.model.js";
import { Playlist } from "../models/playlist.model.js";
import { FavoriteArtist } from "../models/favorite_artist.model.js";
import { FavoriteSong } from "../models/favorite_song.model.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

export const sequelize = new Sequelize({
  dialect: PostgresDialect,
  database: process.env.DBNAME,
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  models: [
    Genre,
    User,
    Album,
    Audiofile,
    Image,
    Song,
    SongInfo,
    SongContributor,
    Playlist,
    FavoriteArtist,
    FavoriteSong,
  ],
});

export default sequelize;
