/**
 * Gets attributes from request or standard
 * @param {Object} query req.query object
 * @param {string} default_attr default attributes
 * @param {string} prefix Name of the model for attributes
 * @returns {Array} A list of attributes
 */
export const getQueryAttributes = (query, default_attr, prefix = "") => {
  const key = prefix ? `${prefix}_attributes` : "attributes";
  const attr = query[key] || default_attr;
  return attr.split(",").map((item) => item.trim());
};

/**
 * Gets sorting params from request or standard
 * @param {Object} query req.query object
 * @param {string} prefix Name of the model for order
 * @returns {Array} An array in Sequelize's order format (column - direction)
 */
export const getQueryOrder = (query, prefix = "") => {
  const key = prefix ? `${prefix}_order_key` : "order_key";
  const dir = prefix ? `${prefix}_order_dir` : "order_dir";

  const orderKeys = query[key]?.split(",") || ["id"];
  const orderDirs = query[dir]?.split(",") || ["ASC"];

  return orderKeys.map((k, d) => [k.trim(), orderDirs[d]?.trim() || "ASC"]);
};

/**
 * Gets query limit from request or standard(10)
 * @param {Object} req.query object
 * @param {string} prefix Name of the model for limit
 * @returns {number} query limit amount
 */
export const getQueryLimit = (query, prefix = "") => {
  const key = prefix ? `${prefix}_limit` : "limit";
  return Number(query[key]) || 10;
};
