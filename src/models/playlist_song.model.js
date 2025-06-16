import { Model, DataTypes } from "@sequelize/core";
import {
  Table,
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
} from "@sequelize/core/decorators-legacy";

@Table({
  freezeTableName: true,
  underscored: false,
  modelName: "playlist_song",
  timestamps: true,
})
export class PlaylistSong extends Model {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  @NotNull
  id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  user_id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  playlist_id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  song_id;
}
