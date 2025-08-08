import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Grid, 
  Box, 
  Card, 
  Typography, 
  Button, 
  TextField,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Link
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import { useLoginMutation } from 'src/slices/usersApiSlice';

import { setCredentials } from '../../slices/authSlice';
import { SignIn, useAuth } from '@clerk/clerk-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [login] = useLoginMutation();
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('email'); // 'clerk' or 'email'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    // If user is already authenticated with Redux, redirect to dashboard
    if (userInfo) {
      navigate('/');
    }
    // If user is authenticated with Clerk but not with Redux yet
    else if (isSignedIn && userId) {
      // We'll handle this in a separate backend integration
      console.log('User authenticated with Clerk:', userId);
    }
  }, [navigate, userInfo, isSignedIn, userId]);

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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Here you would implement your email login logic
      // This could be a call to your backend API or another authentication service
      
      const loginData = {
        email: formData.email,
        password: formData.password
      };
      const res = await login(loginData).unwrap()
      
      if(!res?.success) {
        toast.error(res?.message ?? "Invalid User email or password")
      } else {
        dispatch(setCredentials({ ...res}));
      }
      setIsLoading(false);
      // Example API call (replace with your actual implementation)
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(loginData),
      // });
      
      // if (response.ok) {
      //   const userData = await response.json();
      //   // Dispatch user data to Redux store
      //   // dispatch(loginSuccess(userData));
      //   navigate('/');
      // } else {
      //   const error = await response.json();
      //   setErrors({ submit: error.message || 'Invalid email or password' });
      // }

      // For demo purposes, simulate login process

    } catch (error) {
      setIsLoading(false);
      setErrors({ submit: 'An error occurred during login. Please try again.' });
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page or show forgot password modal
    navigate('/auth/forgot-password');
  };

  const renderEmailLoginForm = () => (
    <Box component="form" onSubmit={handleEmailLogin}>
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
        autoComplete="email"
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
        sx={{ mb: 1 }}
        autoComplete="current-password"
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

      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={handleForgotPassword}
          sx={{
            textDecoration: 'none',
            color: '#0A66C2',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Forgot Password?
        </Link>
      </Box>

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
          mt: 1,
          backgroundColor: '#0A66C2',
          '&:hover': {
            backgroundColor: '#0e5cad'
          },
          '&:disabled': {
            backgroundColor: '#ccc'
          }
        }}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </Box>
  );

  const renderClerkLogin = () => (
    <Box display="flex" justifyContent="center" sx={{ width: '100%' }}>
      <SignIn
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
        path="/auth/login"
        signUpUrl="/auth/signup"
      />
    </Box>
  );

  return (
    <PageContainer title="Login" description="this is Login page">
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
                  Sign In
                </Typography>
                <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={3}>
                  CONDUCT SECURE ONLINE EXAMS NOW
                </Typography>

                {/* Login Method Toggle */}
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                    <Button
                      variant={loginMethod === 'email' ? 'contained' : 'outlined'}
                      onClick={() => setLoginMethod('email')}
                      sx={{ 
                        mr: 1,
                        backgroundColor: loginMethod === 'email' ? '#0A66C2' : 'transparent',
                        borderColor: '#0A66C2',
                        color: loginMethod === 'email' ? 'white' : '#0A66C2'
                      }}
                    >
                      Email Login
                    </Button>
                    <Button
                      variant={loginMethod === 'clerk' ? 'contained' : 'outlined'}
                      onClick={() => setLoginMethod('clerk')}
                      sx={{ 
                        backgroundColor: loginMethod === 'clerk' ? '#0A66C2' : 'transparent',
                        borderColor: '#0A66C2',
                        color: loginMethod === 'clerk' ? 'white' : '#0A66C2'
                      }}
                    >
                      Social Login
                    </Button>
                  </Box>
                  
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {loginMethod === 'email' ? 'Sign in with email' : 'Sign in with social accounts'}
                    </Typography>
                  </Divider>
                </Box>

                {/* Render appropriate login form */}
                {loginMethod === 'email' ? renderEmailLoginForm() : renderClerkLogin()}
                
                <Box mt={3} textAlign="center">
                  <Typography variant="body2" color="textSecondary" component="div">
                    Don't have an account?{' '}
                    <Button
                      onClick={() => navigate('/auth/signup')}
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
                      Sign Up
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

export default Login;
