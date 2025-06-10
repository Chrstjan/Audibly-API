import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { setRelations } from "./models/relations.js";
import { dbController } from "./controllers/db.controller.js";
import { authController } from "./controllers/auth.controller.js";
import { adminController } from "./controllers/admin.controller.js";
import { genreController } from "./controllers/genre.controller.js";
import { userController } from "./controllers/user.controller.js";
import { roleController } from "./controllers/role.controller.js";
import { albumController } from "./controllers/album.controller.js";
import { audiofileController } from "./controllers/audiofile.controller.js";
import { imageController } from "./controllers/image.controller.js";
import { songController } from "./controllers/song.controller.js";
import { songInfoController } from "./controllers/song_info.controller.js";
import { songContributorController } from "./controllers/song_contributor.controller.js";
import { playlistController } from "./controllers/playlist.controller.js";
import { artistController } from "./controllers/artist.controller.js";
import { favoriteArtistController } from "./controllers/favorite_artist.controller.js";
import { favoriteSongController } from "./controllers/favorite_song.controller.js";

const app = express();
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

dotenv.config();

const port = process.env.PORT;

app.get("/", async (req, res) => {
  res.send({ message: "audibly api" });
});

await setRelations();

app.use(
  dbController,
  authController,
  adminController,
  genreController,
  userController,
  roleController,
  albumController,
  audiofileController,
  imageController,
  songController,
  songInfoController,
  songContributorController,
  playlistController,
  artistController,
  favoriteArtistController,
  favoriteSongController
);

app.listen(port, () => {
  console.log(`Server live on http://localhost:${port}`);
});
