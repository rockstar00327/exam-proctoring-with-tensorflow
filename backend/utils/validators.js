const Joi = require('joi');
const { errorResponse } = require('./apiResponse');

// Common validation schemas
const schemas = {
  // Authentication
  register: Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    passwordConfirm: Joi.string().valid(Joi.ref('password')).required(),
    role: Joi.string().valid('student', 'teacher', 'admin').default('student'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // User
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    currentPassword: Joi.string().min(8),
    password: Joi.string().min(8),
    passwordConfirm: Joi.string().valid(Joi.ref('password')),
  }).with('password', 'currentPassword'),

  // Exam
  createExam: Joi.object({
    title: Joi.string().required().min(5).max(100),
    description: Joi.string().allow('').max(500),
    duration: Joi.number().integer().min(1).required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().min(Joi.ref('startTime')).required(),
    maxScore: Joi.number().integer().min(1).required(),
    passingScore: Joi.number().integer().min(0).max(Joi.ref('maxScore')),
    isActive: Joi.boolean().default(true),
  }),

  // Question
  createQuestion: Joi.object({
    examId: Joi.string().required(),
    questionText: Joi.string().required(),
    questionType: Joi.string().valid('multiple_choice', 'true_false', 'short_answer', 'essay').required(),
    options: Joi.when('questionType', {
      is: Joi.valid('multiple_choice', 'true_false'),
      then: Joi.array().items(Joi.string().required()).min(2).required(),
      otherwise: Joi.forbidden(),
    }),
    correctAnswer: Joi.alternatives().conditional('questionType', [
      {
        is: 'multiple_choice',
        then: Joi.number().integer().min(0).required(),
      },
      {
        is: 'true_false',
        then: Joi.boolean().required(),
      },
      {
        otherwise: Joi.string().allow(''),
      },
    ]),
    points: Joi.number().min(0).default(1),
  }),
};

/**
 * Validate request data against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

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

    // Replace req[property] with the validated value
    req[property] = schema.validate(req[property], {
      stripUnknown: true,
    }).value;

    next();
  };
};

module.exports = {
  schemas,
  validate,
};
