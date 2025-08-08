import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import config from './config.js';

// Handle connection errors without exiting in development
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  if (config.env === 'production') {
    process.exit(-1);
  } else {
    logger.warn('MongoDB connection error in development mode - continuing...');
  }
});

// Print MongoDB logs in development env
if (config.env === 'development') {
  mongoose.set('debug', true);
}

/**
 * Connect to MongoDB
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
const connectDB = async () => {
  try {
    const options = {
      ...config.mongoose.options,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s for faster failure
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(config.mongoose.url, options);

    logger.info(`MongoDB connected to ${mongoose.connection.host}`);

    // Return the connection
    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB connection error:', error);

    // In development, we can continue without database for testing
    if (config.env === 'development') {
      logger.warn('Continuing without database connection in development mode...');
      throw error; // Throw error but don't exit process
    } else {
      // In production, exit process with failure
      process.exit(1);
    }
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Drop the entire database (use with caution!)
 * @returns {Promise<void>}
 */
const dropDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    logger.info('Database dropped successfully');
  } catch (error) {
    logger.error('Error dropping database:', error);
    throw error;
  }
};

const connection = mongoose.connection;

export { connectDB, disconnectDB, dropDatabase, connection };
