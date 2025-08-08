/**
 * Success response handler
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {Object} pagination - Pagination details (optional)
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  const response = {
    success: true,
    status: statusCode,
    message,
  };

  if (data) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} errors - Array of error details (optional)
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = []) => {
  const response = {
    success: false,
    status: statusCode,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export {
  successResponse,
  errorResponse,
};
