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
  modelName: "audiofile",
  timestamps: true,
})
export class Audiofile extends Model {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  @NotNull
  id;

  @Attribute(DataTypes.TEXT)
  @NotNull
  filename;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  user_id;

  @Attribute(DataTypes.TEXT)
  artist_credit;

  @Attribute(DataTypes.TEXT)
  source;

  @Attribute(DataTypes.TEXT)
  music_type;
}
