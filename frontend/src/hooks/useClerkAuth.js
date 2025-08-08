import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authSlice';
import { useAuthUserWithClerkMutation } from '../slices/usersApiSlice';

// A module-level lock to prevent multiple sync operations from running simultaneously.
// This is crucial to prevent race conditions and infinite loops during authentication.
let isSyncing = false;

/**
 * Custom hook to integrate Clerk authentication with our Redux store
 * This ensures that when a user authenticates with Clerk, we also authenticate them with our backend
 */
const useClerkAuth = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [authUserWithClerk, { isLoading }] = useAuthUserWithClerkMutation();

  useEffect(() => {
    const syncClerkWithBackend = async () => {
      // Only sync if the user is signed in, not yet in our Redux store, and a sync is not already in progress.
      if (isSignedIn && user && !userInfo && !isSyncing) {
        try {
          isSyncing = true; // Acquire lock

          // Get the user's role from localStorage (set during signup)
          const role = localStorage.getItem('userRole') || 'student';
          
          // Get primary email
          const primaryEmail = user.primaryEmailAddress?.emailAddress;
          
          if (!primaryEmail) {
            console.error('No primary email found for user');
            return;
          }
          
          // Send the Clerk user data to our backend
          const res = await authUserWithClerk({
            clerkId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: primaryEmail,
            role
          }).unwrap();
          
          // Store the user info in Redux
          dispatch(setCredentials({ ...res }));
          
          // Clear the role from localStorage after it's been sent to backend
          localStorage.removeItem('userRole');
        } catch (err) {
          console.error('Failed to authenticate with backend:', err);
        } finally {
          isSyncing = false; // Release lock
        }
      }
    };
    
    syncClerkWithBackend();
    }, [isSignedIn, user, userInfo, dispatch, authUserWithClerk]);
  
  return { isLoading };
};

export default useClerkAuth;
