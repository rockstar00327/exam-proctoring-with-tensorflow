import { apiSlice } from '../slices/apiSlice';

/**
 * Adds Clerk session token to API requests
 * This ensures that the backend can verify the user's identity using Clerk
 * @param {Object} api - The API instance
 * @returns {Object} - The modified API instance
 */
export const addClerkSessionToRequests = (api) => {
  const baseQuery = api.query;
  const baseMutation = api.mutation;

  // Override the query method to add the Clerk session token
  api.query = async (args) => {
    try {
      // Get the Clerk session token if available
      const token = await getClerkSessionToken();
      
      // Add the token to the request headers if it exists
      if (token) {
        args.headers = {
          ...args.headers,
          'clerk-session-token': token
        };
      }
      
      return baseQuery(args);
    } catch (error) {
      console.error('Error adding Clerk session token to query:', error);
      return baseQuery(args);
    }
  };

  // Override the mutation method to add the Clerk session token
  api.mutation = async (args) => {
    try {
      // Get the Clerk session token if available
      const token = await getClerkSessionToken();
      
      // Add the token to the request headers if it exists
      if (token) {
        args.headers = {
          ...args.headers,
          'clerk-session-token': token
        };
      }
      
      return baseMutation(args);
    } catch (error) {
      console.error('Error adding Clerk session token to mutation:', error);
      return baseMutation(args);
    }
  };

  return api;
};

/**
 * Gets the Clerk session token if available
 * @returns {Promise<string|null>} - The Clerk session token or null if not available
 */
const getClerkSessionToken = async () => {
  try {
    // Check if Clerk is available
    if (window.Clerk && window.Clerk.session) {
      return window.Clerk.session.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting Clerk session token:', error);
    return null;
  }
};
