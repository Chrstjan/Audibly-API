import { Genre } from "./genre.model.js";
import { User } from "../models/user.model.js";
import { Album } from "../models/album.model.js";
import { Audiofile } from "./audiofile.model.js";
import { Image } from "./image.model.js";
import { Song } from "./song.model.js";
import { SongInfo } from "./song_info.model.js";
import { SongContributor } from "./song_contributor.model.js";
import { Playlist } from "./playlist.model.js";
import { FavoriteArtist } from "./favorite_artist.model.js";
import { FavoriteSong } from "./favorite_song.model.js";

export const setRelations = async () => {
  //#region Song Relations
  // User / Album Relation
  Album.belongsTo(User, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "artist",
  });

  User.hasMany(Album, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "albums",
  });

  // User / Song Relation
  Song.belongsTo(User, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "artist",
  });

  User.hasMany(Song, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "songs",
  });

  // Genre / Song Relation
  Song.belongsTo(Genre, {
    foreignKey: {
      name: "genre_id",
      onDelete: "CASCADE",
    },
    as: "genre",
  });

  Genre.hasMany(Song, {
    foreignKey: {
      name: "genre_id",
      onDelete: "CASCADE",
    },
    as: "songs",
  });

  // Album / Song Relation
  Song.belongsTo(Album, {
    foreignKey: {
      name: "album_id",
      onDelete: "CASCADE",
    },
    as: "album",
  });

  Album.hasMany(Song, {
    foreignKey: {
      name: "album_id",
      onDelete: "CASCADE",
    },
    as: "songs",
  });

  //#region audiofile
  // Audiofile / Song Relation
  Song.belongsTo(Audiofile, {
    foreignKey: {
      name: "audiofile_id",
      onDelete: "CASCADE",
    },
    as: "audiofile",
  });

  Audiofile.hasOne(Song, {
    foreignKey: {
      name: "audiofile_id",
      onDelete: "CASCADE",
    },
    as: "song",
  });
  //#endregion audiofile

  //#region image
  // Image / Song Relation
  Song.belongsTo(Image, {
    foreignKey: {
      name: "image_id",
      onDelete: "CASCADE",
    },
    as: "image",
  });

  Image.hasMany(Song, {
    foreignKey: {
      name: "image_id",
      onDelete: "CASCADE",
    },
    as: "song",
  });
  //#endregion image

  //#region info
  // Song / Song Info Relation
  SongInfo.belongsTo(Song, {
    foreignKey: {
      name: "song_id",
      onDelete: "CASCADE",
    },
    as: "song",
  });

  Song.hasOne(SongInfo, {
    foreignKey: {
      name: "song_id",
      onDelete: "CASCADE",
    },
    as: "info",
  });

  // Song / Song Contributor Relation
  SongContributor.belongsTo(Song, {
    foreignKey: {
      name: "song_id",
      onDelete: "CASCADE",
    },
    as: "song",
  });

  Song.hasMany(SongContributor, {
    foreignKey: {
      name: "song_id",
      onDelete: "CASCADE",
    },
    as: "contributors",
  });
  //#endregion info

  //#endregion Song Relations

  //#region User Relations
  // User / Playlist Relation
  Playlist.belongsTo(User, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "user",
  });

  User.hasMany(Playlist, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "playlists",
  });

  // User / Favorite Artist Relation
  FavoriteArtist.belongsTo(User, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "user",
  });

  User.hasMany(FavoriteArtist, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "favorite_artists",
  });

  // User / Favorite Song Relation
  FavoriteSong.belongsTo(User, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "user",
  });

  User.hasMany(FavoriteSong, {
    foreignKey: {
      name: "user_id",
      onDelete: "CASCADE",
    },
    as: "favorite_songs",
  });

  // Song / Favorite Songs Relations
  FavoriteSong.belongsTo(Song, {
    foreignKey: {
      name: "song_id",
      onDelete: "CASCADE",
    },
    as: "song",
  });
};
