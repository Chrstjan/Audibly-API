import fs from "fs";
import path from "path";

const AUDIO_SOURCE = "./app/data/audio/";
const AUDIO_TARGET = "/app/audiofiles";

export const copyFilesToVolume = () => {
  if (fs.existsSync(AUDIO_TARGET)) {
    fs.mkdirSync(AUDIO_TARGET, { recursive: true });
  }

  const files = fs.readdirSync(AUDIO_SOURCE);

  for (const file of files) {
    const src = path.join(AUDIO_SOURCE, file);
    const dest = path.join(AUDIO_TARGET, file);
    fs.copyFileSync(src, dest);
  }

  console.log("Files copied to volume");
};
