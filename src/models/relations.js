import { Album } from "../models/album.model.js";
import { User } from "../models/user.model.js";

export const setRelations = async () => {
  // User / Album Relation
  Album.belongsTo(User, {
    foreignKey: "user_id",
    as: "artist",
    "foreignKey.onDelete": "CASCADE",
  });

  User.hasMany(Album, {
    foreignKey: "user_id",
    as: "albums",
    "foreignKey.onDelete": "CASCADE",
  });
};
