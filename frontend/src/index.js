import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeContextProvider } from './theme/ThemeContext';
import { ClerkProvider } from '@clerk/clerk-react';

// import { BrowserRouter } from 'react-router-dom';

// Get Clerk publishable key from environment variables
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Define allowed origins for Clerk based on environment
const clerkAllowedOrigins = [
  // Production domain
  'https://ai-proctor-sigma.vercel.app',
  // Development domains
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Only show LinkedIn as social provider
const appearance = {
  layout: {
    socialButtonsVariant: "iconButton"
  },
  elements: {
    // Hide all social buttons except LinkedIn
    socialButtons: {
      displayConfig: {
        google: false,
        facebook: false,
        github: false,
        // Only show LinkedIn
        linkedin_oidc: true
      }
    }
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ClerkProvider 
    publishableKey={clerkPubKey}
    appearance={appearance}
    allowedRedirectOrigins={clerkAllowedOrigins}
  >
    <ThemeContextProvider>
      <Suspense>
          <App />
      </Suspense>
    </ThemeContextProvider>
  </ClerkProvider>
);
