import { Model, DataTypes } from "@sequelize/core";
import {
  Table,
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  AllowNull,
  Unique,
  Default,
} from "@sequelize/core/decorators-legacy";

@Table({
  freezeTableName: true,
  underscored: false,
  modelName: "song",
  timestamps: true,
})
export class Song extends Model {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  @NotNull
  id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  user_id;

  @Attribute(DataTypes.INTEGER)
  @AllowNull
  album_id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  genre_id;

  @Attribute(DataTypes.INTEGER)
  @AllowNull
  playlist_id;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  name;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  slug;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  image_id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  audiofile_id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @Default(0)
  num_plays;

  @Attribute(DataTypes.BOOLEAN)
  @Default(false)
  is_single;

  @Attribute(DataTypes.JSONB)
  song_info;
}
