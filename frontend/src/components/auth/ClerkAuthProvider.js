import React from 'react';
import useClerkAuth from '../../hooks/useClerkAuth';

/**
 * This component acts as a provider for Clerk authentication.
 * It calls the useClerkAuth hook to sync the Clerk user with the backend.
 * By wrapping the application in this provider, we ensure that the auth logic
 * is handled in a single, stable place, preventing re-renders from causing
 * infinite loops.
 */
const ClerkAuthProvider = ({ children }) => {
  // This hook will now run in a stable context.
  useClerkAuth();

  // We simply render the children, allowing the rest of the app to function normally.
  // The hook handles the auth state in the background.
  return <>{children}</>;
};

export default ClerkAuthProvider;
