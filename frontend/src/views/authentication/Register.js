import React, { useEffect } from 'react';
import { Grid, Box, Card, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/auth/login');
  }, [navigate]);

  return (
    <PageContainer title="Register" description="this is Register page">
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
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '500px' }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h2" textAlign="center" fontWeight="700" mb={1}>
                  Sign Up
                </Typography>
                <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={3}>
                  CONDUCT SECURE ONLINE EXAMS NOW
                </Typography>
                
                <Typography variant="body1" textAlign="center" mb={3}>
                  Redirecting to login page...
                </Typography>
                
                <Typography variant="body2" textAlign="center" mt={2}>
                  You will be redirected to the login page shortly...
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};
export default Register;
