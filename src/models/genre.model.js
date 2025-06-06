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
  modelName: "genre",
})
export class Genre extends Model {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  @NotNull
  id;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  name;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  slug;

  @Attribute(DataTypes.TEXT)
  @NotNull
  @Default("-")
  image;
}
