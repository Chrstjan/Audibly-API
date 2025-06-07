import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { setRelations } from "./models/relations.js";
import { dbController } from "./controllers/db.controller.js";
import { authController } from "./controllers/auth.controller.js";
import { userController } from "./controllers/user.controller.js";
const app = express();
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

dotenv.config();

const port = process.env.PORT;

app.get("/", async (req, res) => {
  res.send({ message: "audibly api" });
});

await setRelations();

app.use(dbController, authController, userController);

app.listen(port, () => {
  console.log(`Server live on http://localhost:${port}`);
});
