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
  modelName: "album",
  timestamps: true,
})
export class Album extends Model {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  @NotNull
  id;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  user_id;

  @Attribute(DataTypes.STRING)
  @NotNull
  name;

  @Attribute(DataTypes.STRING)
  @NotNull
  slug;

  @Attribute(DataTypes.TEXT)
  @NotNull
  @Default("-")
  image;
}
