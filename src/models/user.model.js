import { Model, DataTypes } from "@sequelize/core";
import {
  Table,
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  Default,
  Unique,
  BeforeCreate,
  BeforeUpdate,
  BeforeBulkCreate,
} from "@sequelize/core/decorators-legacy";
import bcrypt from "bcrypt";

@Table({ freezeTableName: true, underscored: false, modelName: "user" })
export class User extends Model {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  @NotNull
  id;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  email;

  @Attribute(DataTypes.STRING)
  @NotNull
  password;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Default("-")
  refresh_token;

  @Attribute(DataTypes.ENUM("user", "artist", "admin"))
  @NotNull
  @Default("user")
  role;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  username;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Default("")
  avatar;

  @Attribute(DataTypes.TEXT)
  @NotNull
  @Default("No description provided")
  description;

  @BeforeCreate static async hashUserPassword(User, options) {
    User.password = await createHash(User.password);
  }
  @BeforeCreate static async ensureSingleAdmin(user, options) {
    if (user.role === "admin") {
      const existingAdmin = await User.findOne({ where: { role: "admin" } });
      if (existingAdmin) throw new Error("An admin user already exists.");
    }
  }
  @BeforeUpdate static async hashUserPassword(User, options) {
    User.password = await createHash(User.password);
  }
  @BeforeBulkCreate static async hashUserPassword(users) {
    if (Array.isArray(users)) {
      for (const user of users) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    } else if (users && typeof users === "object" && users.password) {
      users.password = await bcrypt.hash(users.password, 10);
    }
  }
}

const createHash = async (string) => {
  const salt = await bcrypt.genSalt(10);
  const hashed_string = await bcrypt.hash(string, salt);
  return hashed_string;
};
