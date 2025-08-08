import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const CameraCheck = ({ onCheckComplete }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [stream, setStream] = useState(null);

  const checkCamera = useCallback(async () => {
    try {
      setStatus('pending');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setStatus('success');
      onCheckComplete(true);
    } catch (error) {
      console.error('Camera access error:', error);
      setErrorMessage(error.message || 'Could not access camera');
      setStatus('error');
      onCheckComplete(false);
    }
  }, [onCheckComplete]);

  useEffect(() => {
    checkCamera();
    
    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    }, [checkCamera, stream]);



  const handleRetry = () => {
    // Stop current stream if it exists
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Try again
    checkCamera();
  };

  // No need for handleContinue anymore as we auto-report to parent

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Camera Check
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        We need to verify that your camera is working properly. Please allow camera access when prompted.
      </Typography>
      
      <Box sx={{ 
        width: '100%', 
        maxWidth: 400, 
        height: 300, 
        mx: 'auto', 
        mb: 2, 
        bgcolor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {status === 'pending' && (
          <CircularProgress />
        )}
        
        {status === 'error' && (
          <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main' }} />
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          style={{ 
            width: '100%', 
            height: '100%', 
            display: status === 'success' ? 'block' : 'none' 
          }} 
        />
      </Box>
      
      {status === 'success' && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />} 
          severity="success"
          sx={{ mb: 2 }}
        >
          Camera is working properly!
        </Alert>
      )}
      
      {status === 'error' && (
        <Alert 
          severity="error"
          sx={{ mb: 2 }}
        >
          {errorMessage || 'Camera check failed. Please ensure your camera is connected and you have granted permission.'}
        </Alert>
      )}
      
      {status === 'error' && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </Box>
      )}
      {status === 'success' && (
        <Alert 
          severity="success"
          sx={{ mt: 2 }}
        >
          Camera check passed! The continue button is now enabled.
        </Alert>
      )}
    </Box>
  );
};

export default CameraCheck;
