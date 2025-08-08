import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors, json } = format;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Development logger with colored output and stack traces
const devLogger = () => {
  return createLogger({
    level: 'debug', // Log everything in development
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }), // Include stack traces
      consoleFormat
    ),
    transports: [new transports.Console()],
  });
};

// Production logger with JSON format and file transport
const prodLogger = () => {
  return createLogger({
    level: 'info', // Only log important info in production
    format: combine(
      timestamp(),
      errors({ stack: true }),
      json()
    ),
    defaultMeta: { service: 'ai-proctoring' },
    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],
  });
};

// Select the logger based on environment
const logger = process.env.NODE_ENV === 'production' ? prodLogger() : devLogger();

// Log unhandled exceptions and rejections
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  // Consider exiting the process in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);
  // Consider exiting the process in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

export default logger;
