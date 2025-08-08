import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { useUpdateUserMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography
} from '@mui/material';

/**
 * Component for displaying and updating user profile information
 * Integrates with Clerk user data
 */
const ClerkUserProfile = () => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [updateProfile, { isLoading }] = useUpdateUserMutation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  
  useEffect(() => {
    // Initialize form with user data
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setRole(userInfo.role || 'student');
    }
  }, [userInfo]);
  
  // Sync with Clerk user data when it loads
  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      // Only update if the values are empty or if Clerk has different values
      if (!name && clerkUser.firstName && clerkUser.lastName) {
        setName(`${clerkUser.firstName} ${clerkUser.lastName}`);
      }
      
      if (!email && clerkUser.primaryEmailAddress) {
        setEmail(clerkUser.primaryEmailAddress.emailAddress);
      }
    }
  }, [isClerkLoaded, clerkUser, name, email]);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      // Update user profile in backend
      const res = await updateProfile({
        _id: userInfo._id,
        name,
        email,
        role
      }).unwrap();
      
      // Update Redux store
      dispatch(setCredentials(res));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'An error occurred');
    }
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          User Profile
        </Typography>
        
        {!isClerkLoaded ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={submitHandler} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!clerkUser} // Disable email field if using Clerk (email should be managed through Clerk)
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  id="role"
                  label="Role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {clerkUser && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Manage your account settings in Clerk
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => clerkUser.openUserProfile()}
            >
              Open Clerk Profile
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ClerkUserProfile;
