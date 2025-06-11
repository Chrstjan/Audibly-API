import fs from "fs";
import path from "path";

const AUDIO_SOURCE = "./src/dummyData/audio/";
const AUDIO_TARGET = "/app/songFiles/audio";

const IMAGE_SOURCE = "./src/dummyData/image/";
const IMAGE_TARGET = "/app/songFiles/image";

export const copyFilesToVolume = () => {
  if (fs.existsSync(AUDIO_TARGET) && fs.existsSync(IMAGE_TARGET)) {
    fs.mkdirSync(AUDIO_TARGET, { recursive: true });
    fs.mkdirSync(IMAGE_TARGET, { recursive: true });
  }

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
