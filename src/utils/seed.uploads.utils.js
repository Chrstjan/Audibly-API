import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const AUDIO_SOURCE = isProd
  ? path.join(process.cwd(), "dist", "dummyData", "audio")
  : path.join(process.cwd(), "src", "dummyData", "audio");
const AUDIO_TARGET = "/app/songFiles/audio";

const IMAGE_SOURCE = isProd
  ? path.join(process.cwd(), "dist", "dummyData", "image")
  : path.join(process.cwd(), "src", "dummyData", "image");
const IMAGE_TARGET = "/app/songFiles/image";

export const copyFilesToVolume = () => {
  fs.mkdirSync(AUDIO_TARGET, { recursive: true });
  fs.mkdirSync(IMAGE_TARGET, { recursive: true });

  const audiofiles = fs.readdirSync(AUDIO_SOURCE);

  for (const file of audiofiles) {
    const src = path.join(AUDIO_SOURCE, file);
    const dest = path.join(AUDIO_TARGET, file);
    fs.copyFileSync(src, dest);
  }

  const imagefiles = fs.readdirSync(IMAGE_SOURCE);

  for (const file of imagefiles) {
    const src = path.join(IMAGE_SOURCE, file);
    const dest = path.join(IMAGE_TARGET, file);
    fs.copyFileSync(src, dest);
  }

  console.log("Files copied to volume");
};
