import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Proctoring API',
      version: '1.0.0',
      description: 'API documentation for AI Proctoring System',
      contact: {
        name: 'Support',
        email: 'support@aiproctoring.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000', // Update this with your actual server URL
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
