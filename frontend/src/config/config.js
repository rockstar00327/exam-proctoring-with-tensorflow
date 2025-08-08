// Environment-specific configuration

// Get the current environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Backend API URLs
const DEV_API_URL = 'http://localhost:5000';
const PROD_API_URL = 'https://ai-proctor-backend.onrender.com'; // Production backend URL

// Frontend URLs
const DEV_FRONTEND_URL = 'http://localhost:3000';
const PROD_FRONTEND_URL = 'https://ai-proctor-sigma.vercel.app'; // Production frontend URL

// Export configuration based on environment
const config = {
  // API base URL
  apiUrl: isDevelopment ? DEV_API_URL : PROD_API_URL,
  
  // Frontend base URL
  frontendUrl: isDevelopment ? DEV_FRONTEND_URL : PROD_FRONTEND_URL,
  
  // Clerk configuration will be added here
};

export default config;
