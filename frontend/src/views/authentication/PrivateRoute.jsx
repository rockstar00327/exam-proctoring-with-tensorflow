import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { isSignedIn } = useAuth();
  
  // Allow access if user is authenticated either through Redux or Clerk
  // This ensures a smooth transition between authentication systems
  const isAuthenticated = userInfo || isSignedIn;

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};
export default PrivateRoute;
