import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, 
    Box, 
    Card, 
    Typography, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Button,
    TextField,
    Divider,
    IconButton,
    InputAdornment,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';

import { useSelector } from 'react-redux';
import { SignUp, useAuth } from '@clerk/clerk-react';

import { useRegisterMutation } from '../../slices/usersApiSlice';

const Signup = () => {
  const [register] = useRegisterMutation()
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [signupMethod, setSignupMethod] = useState('email'); // 'clerk' or 'email'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { isSignedIn, userId } = useAuth();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // If user is already authenticated with Redux, redirect to dashboard
    if (userInfo) {
      navigate('/');
    }
    // If user is authenticated with Clerk but not with Redux yet
    else if (isSignedIn && userId) {
      // We'll handle this in a separate backend integration
      console.log('User authenticated with Clerk:', userId);
      console.log('Selected role:', role);
      // Here we would typically send the role to the backend
    }
  }, [navigate, userInfo, isSignedIn, userId, role]);

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    // Store the role in localStorage to use after Clerk authentication
    localStorage.setItem('userRole', event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignup = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Here you would implement your email signup logic
      // This could be a call to your backend API or another authentication service
      
      const signupData = {
        ...formData,
        role: role
      };

      const res = await register(signupData)

      if(res?.error?.status === 400 || !res.data?.success) {
        toast.error(res?.error?.data?.message ?? res?.data?.message ?? 'An error occurred during signup. Please try again.')
      } else {
        toast.success(res?.data?.message)
        navigate('/auth/login');
      }

      // Example API call (replace with your actual implementation)
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(signupData),
      // });
      
      // if (response.ok) {
      //   navigate('/auth/verify-email');
      // } else {
      //   const error = await response.json();
      //   setErrors({ submit: error.message });
      // }

      // For demo purposes, simulate success
      setIsLoading(false);

    } catch {
      setIsLoading(false);
      toast.error('An error occurred during signup. Please try again.')
    }
  };

  const renderEmailSignupForm = () => (
    <Box component="form" onSubmit={handleEmailSignup}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            name="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            disabled={isLoading}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            disabled={isLoading}
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        name="email"
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        error={!!errors.email}
        helperText={errors.email}
        disabled={isLoading}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleInputChange}
        error={!!errors.password}
        helperText={errors.password}
        disabled={isLoading}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                disabled={isLoading}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        disabled={isLoading}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
                disabled={isLoading}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 2,
          backgroundColor: '#0A66C2',
          '&:hover': {
            backgroundColor: '#0e5cad'
          },
          '&:disabled': {
            backgroundColor: '#ccc'
          }
        }}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </Box>
  );

  const renderClerkSignup = () => (
    <Box display="flex" justifyContent="center" sx={{ width: '100%' }}>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: {
              backgroundColor: '#0A66C2',
              '&:hover': {
                backgroundColor: '#0e5cad'
              }
            },
            card: {
              boxShadow: 'none',
              width: '100%'
            },
            headerTitle: {
              display: 'none'
            },
            headerSubtitle: {
              display: 'none'
            },
            socialButtonsBlockButton: {
              backgroundColor: '#0A66C2',
              color: 'white',
              border: 'none'
            }
          }
        }}
        routing="path"
        path="/auth/signup"
        signInUrl="/auth/login"
      />
    </Box>
  );

  return (
    <PageContainer title="Sign Up" description="this is Sign Up page">
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            item
            xs={12}
            sm={12}
            lg={4}
            xl={3}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card elevation={9} sx={{ p: 4, maxWidth: 450, width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h2" textAlign="center" fontWeight="700" mb={1}>
                  Sign Up
                </Typography>
                <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={3}>
                  CREATE YOUR ACCOUNT TO CONDUCT SECURE ONLINE EXAMS
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="role-select-label">Select Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={role}
                    label="Select Role"
                    onChange={handleRoleChange}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                  </Select>
                </FormControl>

                {/* Signup Method Toggle */}
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                    <Button
                      variant={signupMethod === 'email' ? 'contained' : 'outlined'}
                      onClick={() => setSignupMethod('email')}
                      sx={{ 
                        mr: 1,
                        backgroundColor: signupMethod === 'email' ? '#0A66C2' : 'transparent',
                        borderColor: '#0A66C2',
                        color: signupMethod === 'email' ? 'white' : '#0A66C2'
                      }}
                    >
                      Email Signup
                    </Button>
                    <Button
                      variant={signupMethod === 'clerk' ? 'contained' : 'outlined'}
                      onClick={() => setSignupMethod('clerk')}
                      sx={{ 
                        backgroundColor: signupMethod === 'clerk' ? '#0A66C2' : 'transparent',
                        borderColor: '#0A66C2',
                        color: signupMethod === 'clerk' ? 'white' : '#0A66C2'
                      }}
                    >
                      Social Signup
                    </Button>
                  </Box>
                  
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {signupMethod === 'email' ? 'Sign up with email' : 'Sign up with social accounts'}
                    </Typography>
                  </Divider>
                </Box>

                {/* Render appropriate signup form */}
                {signupMethod === 'email' ? renderEmailSignupForm() : renderClerkSignup()}
                
                <Box mt={3} textAlign="center">
                  <Typography variant="body2" color="textSecondary" component="div">
                    Already have an account?{' '}
                    <Button
                      onClick={() => navigate('/auth/login')}
                      sx={{
                        textTransform: 'none',
                        padding: '0px 4px',
                        minWidth: 'auto',
                        fontWeight: 'bold',
                        color: '#0A66C2',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Sign In
                    </Button>
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Signup;