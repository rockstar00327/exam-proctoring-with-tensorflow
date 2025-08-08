const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
// const fsSync = require('fs');
const logger = require('./logger');
const AppError = require('./appError');
// const { promisify } = require('util');
// const stream = require('stream');
const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
// const config = require('../config/config');

// Initialize S3 client if AWS credentials are provided
let s3Client;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Local storage configuration
const storageTypes = {
  local: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  }),
  s3: multer.memoryStorage(),
};

// File filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  
  cb(new AppError('Only image, PDF, and document files are allowed!', 400));
};

// Initialize multer upload
const upload = multer({
  storage: s3Client ? storageTypes.s3 : storageTypes.local,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Upload file to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - File name
 * @param {string} mimetype - File mimetype
 * @returns {Promise<Object>} Upload result
 */
// const uploadToS3 = async (buffer, filename, mimetype) => {
//   if (!s3Client) {
//     throw new AppError('S3 client not configured', 500);
//   }

//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET,
//     Key: filename,
//     Body: buffer,
//     ContentType: mimetype,
//     ACL: 'public-read',
//   };

//   try {
//     const command = new PutObjectCommand(params);
//     await s3Client.send(command);
    
//     return {
//       key: filename,
//       location: `https://${params.Bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`,
//     };
//   } catch (error) {
//     logger.error('Error uploading to S3:', error);
//     throw new AppError('Error uploading file', 500);
//   }
// };

/**
 * Delete file from S3
 * @param {string} key - File key in S3
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (key) => {
  if (!s3Client) {
    throw new AppError('S3 client not configured', 500);
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    logger.info(`File ${key} deleted from S3`);
  } catch (error) {
    logger.error('Error deleting from S3:', error);
    throw new AppError('Error deleting file', 500);
  }
};

/**
 * Delete a file from the local filesystem
 * @param {string} filename - The name of the file to delete
 * @returns {Promise<void>}
 */
const deleteLocalFile = async (filename) => {
  const filePath = path.join(__dirname, '../../uploads', filename);
  
  try {
    await fs.unlink(filePath);
    logger.info(`File ${filename} deleted from local storage`);
  } catch (error) {
    // Don't throw error if file doesn't exist
    if (error.code !== 'ENOENT') {
      logger.error(`Error deleting file ${filename}:`, error);
      throw new AppError('Error deleting file', 500);
    }
  }
};

/**
 * Delete a file (handles both local and S3)
 * @param {string} filePath - Path or key of the file to delete
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  if (!filePath) return;
  
  try {
    if (s3Client) {
      // If using S3, extract the key from the URL
      const key = filePath.split('/').pop();
      await deleteFromS3(key);
    } else {
      // Local file system
      await deleteLocalFile(path.basename(filePath));
    }
  } catch (error) {
    logger.error('Error in deleteFile:', error);
    throw error;
  }
};

/**
 * Get file stream from S3
 * @param {string} key - File key in S3
 * @returns {Promise<ReadableStream>} File stream
 */
const getFileStream = async (key) => {
  if (!s3Client) {
    throw new AppError('S3 client not configured', 500);
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    return response.Body;
  } catch (error) {
    logger.error('Error getting file from S3:', error);
    throw new AppError('Error retrieving file', 500);
  }
};

module.exports = {
  upload,
  deleteFile,
  getFileStream,
  s3Client: s3Client || null,
};
