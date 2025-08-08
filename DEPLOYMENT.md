# Deployment Guide for Ai-Proctor with Clerk Authentication

This guide provides instructions for deploying the Ai-Proctor application with Clerk authentication in both development and production environments.

## Environment Setup

### Development Environment

1. **Backend (.env in root directory)**
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:3000
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

2. **Frontend (.env in frontend directory)**
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   REACT_APP_ENV=development
   ```

### Production Environment

1. **Backend (Render Environment Variables)**
   ```
   NODE_ENV=production
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=https://ai-proctor-sigma.vercel.app
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ALLOWED_ORIGINS=https://ai-proctor-sigma.vercel.app,https://*.vercel.app
   ```

2. **Frontend (Vercel Environment Variables)**
   ```
   REACT_APP_API_URL=https://ai-proctor-backend.onrender.com
   REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   REACT_APP_ENV=production
   ```

## Clerk Configuration

1. **Create a Clerk Application**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Configure LinkedIn as the only social provider

2. **Configure CORS & URLs in Clerk Dashboard**
   - Go to Settings > CORS & URLs
   - Add the following URLs:
     - Development: `http://localhost:3000`
     - Production: `https://ai-proctor-sigma.vercel.app`

3. **Configure LinkedIn OAuth**
   - Create a LinkedIn OAuth application at [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
   - Configure the redirect URLs to point to your Clerk domain
   - Add the required scopes: `r_emailaddress` and `r_liteprofile`
   - Copy the Client ID and Client Secret to your Clerk dashboard

## Deployment Steps

### Backend (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Select the repository and branch
4. Configure the build command: `npm install && npm run build`
5. Configure the start command: `npm start`
6. Add all environment variables listed in the Production Environment section
7. Deploy the application

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Create a new project
3. Select the repository and branch
4. Configure the build settings:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add all environment variables listed in the Production Environment section
6. Deploy the application

## Testing the Deployment

1. **Test Authentication Flow**
   - Visit your deployed frontend application
   - Try signing up with LinkedIn
   - Verify that you're redirected back to the application after authentication
   - Check that your role is properly assigned

2. **Test Protected Routes**
   - Try accessing protected routes
   - Verify that you're redirected to login if not authenticated
   - Verify that you can access protected routes after authentication

3. **Test API Integration**
   - Check that API calls are working correctly
   - Verify that Clerk session tokens are being sent with API requests
   - Check that user data is properly synced between Clerk and your backend

## Troubleshooting

1. **CORS Issues**
   - Check that your CORS configuration includes all necessary origins
   - Verify that the `ALLOWED_ORIGINS` environment variable is set correctly
   - Check that Clerk's CORS & URLs settings include your application domains

2. **Authentication Issues**
   - Check that your Clerk keys are set correctly in both environments
   - Verify that the JWT secret is consistent across deployments
   - Check that cookies are being properly set and sent with requests

3. **API Connection Issues**
   - Verify that the API URL is set correctly in the frontend environment
   - Check that the backend is properly configured to accept requests from the frontend
   - Ensure that the Clerk session token is being sent with API requests
