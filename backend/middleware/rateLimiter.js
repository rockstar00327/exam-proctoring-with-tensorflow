const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Rate limiter for authentication routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  skipSuccessfulRequests: true, // Only count failed requests
  handler: (req, res) => {
    errorResponse(
      res,
      429,
      'Too many login attempts from this IP, please try again after 15 minutes'
    );
  },
});

/**
 * Rate limiter for public APIs
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    errorResponse(
      res,
      429,
      'Too many requests from this IP, please try again after 15 minutes'
    );
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
