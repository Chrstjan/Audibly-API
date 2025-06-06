import { Model, DataTypes } from "@sequelize/core";
import {
  Table,
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  Default,
} from "@sequelize/core/decorators-legacy";

@Table({
  freezeTableName: true,
  underscored: false,
  modelName: "song_contributor",
  timestamps: true,
})
export class SongContributor extends Model {
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
  user_id;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Default("")
  role;
}
