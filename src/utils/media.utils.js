import dotenv from "dotenv";

dotenv.config();

/**
 * Helper function to generate a public media file URL.
 * Adds the domain to the media filename based on its type.
 *
 * @param {string} type - Type of media (e.g., 'image', 'audiofile').
 * @param {string} filename - The filename of the media stored on disk.
 * @returns {string} Fully qualified media URL.
 */
export const addMediaUrl = (type, filename) => {
  const domain = process.env.DOMAIN || "http://localhost:8080";
  return `${domain}/${type}/${filename}`;
};
