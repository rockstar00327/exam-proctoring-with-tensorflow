/**
 * Wraps an async function to catch any errors and pass them to the next middleware
 * @param {Function} fn - The async function to wrap
 * @returns {Function} A middleware function that handles errors
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
