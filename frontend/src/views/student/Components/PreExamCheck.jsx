import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Stepper, 
  Step, 
  StepLabel,
  Paper,
  CircularProgress
} from '@mui/material';

// Import check components
import CameraCheck from './CameraCheck';
import MicrophoneCheck from './MicrophoneCheck';
import SystemCheck from './SystemCheck';
import BrowserCheck from './BrowserCheck';
import InternetCheck from './InternetCheck';

const steps = [
  { label: 'Camera Check', key: 'camera' },
  { label: 'Microphone Check', key: 'microphone' },
  { label: 'System Check', key: 'system' },
  { label: 'Browser Check', key: 'browser' },
  { label: 'Internet Check', key: 'internet' }
];

const PreExamCheck = ({ onCheckComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentCheckStatus, setCurrentCheckStatus] = useState({
    isSuccessful: false,
    isCompleted: false
  });
  const [isLoading] = useState(false);

  const handleLocalCheckComplete = useCallback((result) => {
    setCurrentCheckStatus({
      isSuccessful: result,
      isCompleted: true,
    });
  }, []);

  useEffect(() => {
    if (currentCheckStatus.isCompleted) {
      onCheckComplete(steps[activeStep].key, currentCheckStatus.isSuccessful);
    }
  }, [currentCheckStatus, activeStep, onCheckComplete]);

  const handleRetry = () => {
    setCurrentCheckStatus({
      isSuccessful: false,
      isCompleted: false,
      retry: true
    });
    
    // Notify parent about the retry
    if (onCheckComplete) {
      onCheckComplete(steps[activeStep].key, false);
    }
  };

  const handleNext = () => {
    if (currentCheckStatus.isSuccessful && activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
      setCurrentCheckStatus({
        isSuccessful: false,
        isCompleted: false
      });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      setCurrentCheckStatus({
        isSuccessful: false,
        isCompleted: false
      });
    }
  };

  // Render the current step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <CameraCheck onCheckComplete={handleLocalCheckComplete} onRetry={handleRetry} />;
      case 1:
        return <MicrophoneCheck onCheckComplete={handleLocalCheckComplete} onRetry={handleRetry} />;
      case 2:
        return <SystemCheck onCheckComplete={handleLocalCheckComplete} onRetry={handleRetry} />;
      case 3:
        return <BrowserCheck onCheckComplete={handleLocalCheckComplete} onRetry={handleRetry} />;
      case 4:
        return <InternetCheck onCheckComplete={handleLocalCheckComplete} />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Pre-Exam System Check
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4 }}>
        Please complete all system checks before starting your exam
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.key}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '300px', mb: 4 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {React.cloneElement(getStepContent(activeStep), {
              key: currentCheckStatus.retry ? 'retry' : 'initial',
              onCheckComplete: handleLocalCheckComplete
            })}
            {currentCheckStatus.isCompleted && !currentCheckStatus.isSuccessful && (
              <Box textAlign="center" mt={2}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleRetry}
                >
                  Retry
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
        <Button
          disabled={activeStep === 0 || isLoading}
          onClick={handleBack}
          variant="outlined"
          color="primary"
        >
          Back
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          {currentCheckStatus.isCompleted && !currentCheckStatus.isSuccessful && (
            <Typography color="error" variant="body2">
              Please complete the current check to continue
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={isLoading || !currentCheckStatus.isSuccessful}
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PreExamCheck;
