import React from 'react';
import { Box, Typography, Button, Alert, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MicIcon from '@mui/icons-material/Mic';
import LanguageIcon from '@mui/icons-material/Language';
import WifiIcon from '@mui/icons-material/Wifi';
import DevicesIcon from '@mui/icons-material/Devices';

const FinalCheck = ({ checkResults, onStartExam }) => {
  const allChecksSuccessful = Object.values(checkResults).every(result => result === true);
  const someChecksFailed = Object.values(checkResults).some(result => result === false);
  
  const getStatusIcon = (status) => {
    if (status === true) {
      return <CheckCircleOutlineIcon color="success" />;
    } else if (status === 'warning') {
      return <WarningAmberIcon color="warning" />;
    } else {
      return <ErrorOutlineIcon color="error" />;
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Pre-Exam Check Summary
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Review your system check results before starting the exam.
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3, maxWidth: 600, mx: 'auto' }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <CameraAltIcon />
            </ListItemIcon>
            <ListItemText primary="Camera" />
            <ListItemIcon>
              {getStatusIcon(checkResults.camera)}
            </ListItemIcon>
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <MicIcon />
            </ListItemIcon>
            <ListItemText primary="Microphone" />
            <ListItemIcon>
              {getStatusIcon(checkResults.microphone)}
            </ListItemIcon>
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText primary="Browser Compatibility" />
            <ListItemIcon>
              {getStatusIcon(checkResults.browser)}
            </ListItemIcon>
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <WifiIcon />
            </ListItemIcon>
            <ListItemText primary="Internet Connection" />
            <ListItemIcon>
              {getStatusIcon(checkResults.internet)}
            </ListItemIcon>
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <DevicesIcon />
            </ListItemIcon>
            <ListItemText primary="Device & System" />
            <ListItemIcon>
              {getStatusIcon(checkResults.deviceType)}
            </ListItemIcon>
          </ListItem>
        </List>
      </Paper>
      
      {allChecksSuccessful && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />} 
          severity="success"
          sx={{ mb: 3 }}
        >
          All system checks passed successfully! You're ready to start the exam.
        </Alert>
      )}
      
      {!allChecksSuccessful && !someChecksFailed && (
        <Alert 
          icon={<WarningAmberIcon fontSize="inherit" />}
          severity="warning"
          sx={{ mb: 3 }}
        >
          Some checks have warnings. You can proceed, but you may experience issues during the exam.
        </Alert>
      )}
      
      {someChecksFailed && (
        <Alert 
          icon={<ErrorOutlineIcon fontSize="inherit" />}
          severity="error"
          sx={{ mb: 3 }}
        >
          Some system checks failed. We recommend resolving these issues before starting the exam.
        </Alert>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          By starting the exam, you confirm that:
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          • You will not use unauthorized materials or assistance
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          • You will not communicate with others during the exam
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          • You will maintain academic integrity throughout the exam
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onStartExam}
          sx={{ px: 4, py: 1 }}
        >
          Start Exam
        </Button>
      </Box>
    </Box>
  );
};

export default FinalCheck;
