import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const Proctoring = ({ children, onAutoSubmit }) => {
  
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [violationCount, setViolationCount] = useState(0);
  
  
  
  const webcamRef = useRef(null);
  const MAX_VIOLATIONS = 5;

  const enterFullScreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { /* Firefox */
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE/Edge */
      element.msRequestFullscreen();
    }
  }, []);

  const incrementViolation = useCallback(() => {
    setViolationCount((count) => {
      const newCount = count + 1;
      if (newCount >= MAX_VIOLATIONS) {
        onAutoSubmit();
      }
      return newCount;
    });
  }, [onAutoSubmit]);

  const handleFullscreenChange = useCallback(() => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (!fullscreenElement) {
      setWarningMessage('You have exited full-screen mode. Please return to full-screen to continue the exam.');
      setWarningModalOpen(true);
      incrementViolation();
    }
  }, [incrementViolation]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setWarningMessage('You have switched to another tab or window. Please return to the exam tab to continue.');
      setWarningModalOpen(true);
      incrementViolation();
    }
  }, [incrementViolation]);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }, []);

  useEffect(() => {
    enterFullScreen();
    startWebcam();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enterFullScreen, handleFullscreenChange, handleVisibilityChange, startWebcam]);

  const handleReturnToExam = () => {
    setWarningModalOpen(false);
    enterFullScreen();
  };

  return (
    <>
      {children}
      <Modal
        open={warningModalOpen}
        aria-labelledby="warning-modal-title"
        aria-describedby="warning-modal-description"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center', maxWidth: 500 }}>
          <Typography id="warning-modal-title" variant="h6" component="h2" color="error">
            Warning
          </Typography>
          <Typography id="warning-modal-description" sx={{ mt: 2 }}>
            {warningMessage}
          </Typography>
          <Button onClick={handleReturnToExam} variant="contained" sx={{ mt: 3 }}>
            Return to Exam
          </Button>
        </Box>
      </Modal>

    </>
  );
};

export default Proctoring;
