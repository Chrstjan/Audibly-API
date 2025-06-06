import { Model, DataTypes } from "@sequelize/core";
import {
  Table,
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  Default,
  AllowNull,
} from "@sequelize/core/decorators-legacy";

@Table({
  freezeTableName: true,
  underscored: false,
  modelName: "song_info",
  timestamps: true,
})
export class SongInfo extends Model {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  @NotNull
  id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  song_id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @Default(0)
  length;

  @Attribute(DataTypes.TEXT)
  @NotNull
  @Default("")
  credit_text;

  @Attribute(DataTypes.INTEGER)
  @AllowNull
  original_artist_id;

  @Attribute(DataTypes.STRING)
  @AllowNull
  original_artist_name;
}
