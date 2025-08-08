# Clerk Authentication Setup Guide for Ai-Proctor

This guide will help you set up Clerk authentication with LinkedIn as the only social provider for the Ai-Proctor application.

## 1. Create a Clerk Account and Application

1. Go to [Clerk's website](https://clerk.com/) and sign up for an account
2. Create a new application from the Clerk dashboard
3. Name your application (e.g., "Ai-Proctor")

## 2. Configure LinkedIn as a Social Provider

1. In your Clerk dashboard, navigate to **User & Authentication** > **Social Connections**
2. Enable LinkedIn as a social provider
3. You'll need to create a LinkedIn OAuth application:
   - Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
   - Create a new app
   - Configure the OAuth settings:
     - Add redirect URLs: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth/callback`
     - Request the following OAuth scopes:
       - `r_emailaddress`
       - `r_liteprofile`
   - Copy the Client ID and Client Secret

4. Return to Clerk dashboard and enter your LinkedIn Client ID and Client Secret
5. Save your changes

## 3. Configure Clerk Environment Variables

1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** and **Secret Key**
3. Add these to your environment variables:

   For the backend (`.env` file in the root directory):
   ```
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

   For the frontend (`.env` file in the frontend directory):
   ```
   REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

## 4. Enable CORS for Clerk

1. In your Clerk dashboard, go to **Settings** > **CORS & URLs**
2. Add your application URLs:
   - Development: `http://localhost:3000`
   - Production: `https://your-production-url.com`

## 5. Testing the Authentication Flow

1. Start your application with `npm run dev`
2. Navigate to the login page
3. You should see the LinkedIn social login button
4. Click on it and test the authentication flow

## 6. Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify your environment variables are set correctly
3. Ensure your Clerk application is properly configured
4. Check that CORS settings are correct
5. Verify your LinkedIn OAuth application settings

## 7. Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [Clerk React SDK Documentation](https://clerk.com/docs/references/react/overview)
