export const allowedKeys = {
  song_info: {
    credit: "string",
    description: "string",
    written_by: "string",
    produced_by: "string",
    year: "string",
  },
};

/**
 * Validates the structure of a given object by ensuring all its keys
 * are allowed and their values match the expected types defined in `allowedKeys`.
 *
 * @param {Object} object - The object to validate (e.g. the song_info data).
 * @param {string} keyGroup - The name of the allowed key group to validate against
 *                            (e.g. 'song_info', which exist in `allowedKeys`).
 *
 * @returns {boolean} - Returns true if all keys are allowed and values match expected types, false otherwise.
 *
 * @throws {Error} - Throws an error if no structure is defined for the provided `keyGroup`.
 *
 *  */
export const validateStructure = (object, keyGroup) => {
  const structure = allowedKeys[keyGroup];

  if (!structure) {
    throw new Error(`No allowed keys defined for "${keyGroup}"`);
  }
  return Object.entries(object).every(([key, value]) => {
    const expectedType = structure[key];
    return expectedType && typeof value === expectedType;
  });
};
