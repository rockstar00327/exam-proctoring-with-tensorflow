# Backend Setup and Build Fix Documentation

## Issues Fixed

The backend build was failing due to several issues that have now been resolved:

### 1. MongoDB Connection Issues
**Problem**: The application was trying to connect to MongoDB Atlas but failing due to network/authentication issues.

**Solution**: 
- Modified the database connection to be more resilient in development mode
- Added fallback to local MongoDB instance
- Improved error handling to prevent app crashes when database is unavailable

### 2. CORS Configuration Issues
**Problem**: The CORS configuration was trying to split an undefined environment variable, causing runtime errors.

**Solution**:
- Added proper error handling for undefined `CORS_ALLOW_ORIGIN`
- Set default CORS origins if environment variable is not provided
- Added credentials support for CORS

### 3. Environment Variable Validation
**Problem**: Strict validation was requiring MongoDB URL even in development.

**Solution**:
- Made `MONGO_URL` optional in development mode
- Added conditional validation based on environment
- Set sensible defaults for development

### 4. Code Cleanup
**Problem**: Unused imports and potential runtime issues.

**Solution**:
- Removed unused imports (`protect`, `restrictTo` from auth middleware)
- Improved error handling throughout the application

## Setup Instructions

### Option 1: Local MongoDB (Recommended for Development)
1. Install MongoDB locally or use MongoDB Compass
2. The application will automatically connect to `mongodb://localhost:27017/ai-proctoring-dev`
3. No additional configuration needed

### Option 2: MongoDB Atlas (Production)
1. Update the `.env` file with your MongoDB Atlas connection string:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Set `NODE_ENV=production` in your `.env` file

### Option 3: Run Without Database (Testing Only)
1. The application can now run without a database connection in development mode
2. Database-dependent features will not work, but the server will start successfully

## Running the Backend

```bash
# Install dependencies
npm install

# Start development server
npm run server

# Or start production server
npm start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Optional (has defaults)
CORS_ALLOW_ORIGIN=http://localhost:3000
MONGO_URL=mongodb://localhost:27017/ai-proctoring-dev

# Optional (for email functionality)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@yourapp.com

# Optional (for OpenAI integration)
OPENAI_API_KEY=your_openai_api_key
```

## API Documentation

Once the server is running, you can access the API documentation at:
- http://localhost:5000/api-docs

## Testing the Setup

1. Start the server: `npm run server`
2. Check if the server is running: Open http://localhost:5000 in your browser
3. You should see "server is running" message
4. Check API docs: http://localhost:5000/api-docs

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally if using local setup
- Check MongoDB Atlas IP whitelist if using cloud setup
- Verify connection string format and credentials

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using the port: `netstat -ano | findstr :5000`

### CORS Issues
- Ensure `CORS_ALLOW_ORIGIN` includes your frontend URL
- For multiple origins, separate with commas: `http://localhost:3000,http://localhost:3001`

## Next Steps

1. Set up your preferred MongoDB solution
2. Configure environment variables for your specific setup
3. Test API endpoints using the Swagger documentation
4. Set up the frontend to connect to this backend
