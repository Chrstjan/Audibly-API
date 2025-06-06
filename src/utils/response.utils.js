/**
 * Sends a success response to the client.
 *
 * @param {Object} res - Express response object used for returning a response.
 * @param {any} data - The data that goes with the response.
 * @param {string} [message="Success"] - Optinal message that descripes the response (default is "Success").
 * @param {number} [statusCode=200] - HTTP-statuscode from the response (default is 200 ok).
 */

export const successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  const response = { message };

  if (data) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Sends a error response to the client.
 *
 * @param {Object} res - Express response object used for returning a response.
 * @param {string} [message="Internal Server Error"] - Optinal message that descripes the error (default is "Internal Server Error").
 * @param {number} [statusCode=500] - HTTP-statuscode for the error (default is 500 Internal Server Error).
 */
export const errorResponse = (
  res,
  message = "Internal Server Error",
  error = {},
  statusCode = 500
) => {
  let errorObj = { message: message };

  if (error.name === "SequelizeValidationError") {
    errorObj.sequlize_validate_errors = error.errors.map((err) => ({
      field: err.path,
      message: err.message,
    }));
  }

  res.status(statusCode).json(errorObj);
};
