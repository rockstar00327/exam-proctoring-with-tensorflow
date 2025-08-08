const { errorResponse } = require('../utils/apiResponse');

/**
 * Validates the request against the provided schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
const validate = (schema) => (req, res, next) => {
  const validationOptions = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };

  // Validate request against the schema
  const { error, value } = schema.validate(
    { ...req.body, ...req.params, ...req.query },
    validationOptions
  );

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/['"]/g, ''),
    }));

    return errorResponse(
      res,
      400,
      'Validation Error',
      errors
    );
  }

  // Replace request with validated values
  req.body = value;
  next();
};

module.exports = validate;
