import { Model, DataTypes } from "@sequelize/core";
import {
  Table,
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  Default,
  Unique,
} from "@sequelize/core/decorators-legacy";

@Table({
  freezeTableName: true,
  underscored: false,
  modelName: "playlist",
  timestamps: true,
})
export class Playlist extends Model {
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
  song_id;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  @Default("")
  name;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  @Default("")
  slug;

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  is_public;
}
