import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

// Get the API URL based on environment
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://ai-proctor-backend.onrender.com';

const baseQuery = fetchBaseQuery({ 
  baseUrl: API_URL,
  credentials: 'include', // This ensures cookies are sent with requests
  prepareHeaders: (headers) => {
    // Add Clerk session token if available
    if (window.Clerk && window.Clerk.session) {
      headers.set('clerk-session-token', window.Clerk.session.id);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User'],
  // it like a prent to other api
  // it a build in builder
  endpoints: () => ({}),
});
