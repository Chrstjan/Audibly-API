import fs from "fs";
import csv from "csv-parser";
import path from "path";
import sequelize from "../config/sequelize.config.js";

/**
 * Reads data from a CSV file and returns it as an array of objects.
 * @param {string} fileName - The name of the CSV file.
 * @returns {Promise<Array>} - A promise that resolves with the parsed CSV data.
 */
const getCsvData = async (fileName) => {
  const csvPath = path.resolve(`./src/data/${fileName}`);
  const data = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        if ("is_single" in row) {
          row.is_single = row.is_single === "true";
        }

        if ("num_plays" in row) {
          row.num_plays = parseInt(row.num_plays, 10);
        }

        data.push(row);
      })
      .on("end", () => resolve(data))
      .on("error", (err) => reject(err));
  });
};

/**
 * Seeds the database with data from a CSV file.
 * @param {string} fileName - The name of the CSV file to import data from.
 * @param {Object} model - The Sequelize model to insert data into.
 */
const seedFromCsv = async (fileName, model) => {
  try {
    const result = await sequelize.transaction(async (transaction) => {
      const data = await getCsvData(fileName);
      await model.bulkCreate(data, { transaction });
      console.log(`Seeding complete for ${fileName}`);
      return fileName;
    });

    return result;
  } catch (err) {
    console.error("Seeding error:", err);
  }
};

export { getCsvData, seedFromCsv };
