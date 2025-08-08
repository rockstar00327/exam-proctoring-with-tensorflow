import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Card, CardContent, Typography, Avatar, Grid, Divider } from '@mui/material';

const ProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const initialUserValues = {
    name: userInfo.name || '',
    email: userInfo.email || '',
    password: userInfo.password || '',
    confirm_password: '',
    role: userInfo.role || 'student',
  };

  // Styling for the avatar and card
  const avatarStyles = {
    backgroundColor: initialUserValues.role === 'student' ? '#4caf50' : '#2196f3',
    width: 100,
    height: 100,
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Card style={{ padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Avatar style={avatarStyles}>
              {initialUserValues.name.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h4" align="center" gutterBottom>
              {initialUserValues.name}
            </Typography>
          </Grid>
        </Grid>
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" color="textSecondary">
                Role:
              </Typography>
              <Typography variant="body1">{initialUserValues.role === 'student' ? 'Student' : 'Teacher'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" color="textSecondary">
                Email Address:
              </Typography>
              <Typography variant="body1">{initialUserValues.email}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;