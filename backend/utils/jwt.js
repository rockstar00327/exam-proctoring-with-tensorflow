import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import config from '../config/config.js';
import logger from './logger.js';
import AppError from './appError.js';

// Promisify jwt methods
const signToken = promisify(jwt.sign);
const verifyToken = promisify(jwt.verify);

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} [secret=config.jwt.secret] - Secret key
 * @param {string} [expiresIn=config.jwt.accessExpirationMinutes] - Token expiration time
 * @returns {Promise<string>} - JWT token
 */
const generateToken = async (
  userId,
  secret = config.jwt.secret,
  expiresIn = `${config.jwt.accessExpirationMinutes}m`
) => {
  try {
    return await signToken(
      { id: userId },
      secret,
      { expiresIn }
    );
  } catch (error) {
    logger.error('Error generating token:', error);
    throw new AppError('Error generating authentication token', 500);
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} [secret=config.jwt.secret] - Secret key
 * @returns {Promise<Object>} - Decoded token payload
 */
const verifyJwtToken = async (token, secret = config.jwt.secret) => {
  try {
    return await verifyToken(token, secret);
  } catch (error) {
    logger.error('Token verification failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your token has expired! Please log in again.', 401);
    }
    
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please log in again!', 401);
    }
    
    throw new AppError('Authentication failed!', 401);
  }
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Refresh token
 */
const generateRefreshToken = async (userId) => {
  return generateToken(
    userId,
    config.jwt.refreshSecret,
    `${config.jwt.refreshExpirationDays}d`
  );
};

/**
 * Generate reset password token
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Reset password token
 */
const generateResetPasswordToken = async (userId) => {
  return generateToken(
    userId,
    config.jwt.resetPasswordSecret,
    `${config.jwt.resetPasswordExpirationMinutes}m`
  );
};

export {
  generateToken,
  verifyJwtToken,
  generateRefreshToken,
  generateResetPasswordToken,
};
