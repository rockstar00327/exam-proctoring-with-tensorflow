import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MicIcon from '@mui/icons-material/Mic';

const MicrophoneCheck = ({ onCheckComplete }) => {
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Check microphone access and set up audio analysis
  const setupMicrophone = useCallback(async () => {
    try {
      setStatus('pending');
      
      // Request microphone access with basic constraints
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio context and analyzer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphone.connect(analyser);
      
      // Store references
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      
      // Start analyzing audio levels
      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        setVolume(average);
        
        // If volume is above threshold, consider it as speaking
        if (average > 10) { // Adjust this threshold as needed
          if (!isSpeaking) {
            setIsSpeaking(true);
            setStatus('success');
            onCheckComplete(true);
          }
        } else {
          setIsSpeaking(false);
        }
        
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
      
      // Set a timeout to check if we can access the microphone
      const timeout = setTimeout(() => {
        if (status === 'pending' && volume < 5) {
          setErrorMessage('Could not detect any audio input. Please speak into your microphone.');
          setStatus('error');
        }
      }, 5000);
      
      return () => {
        clearTimeout(timeout);
        cancelAnimationFrame(animationFrameRef.current);
      };
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setErrorMessage('Failed to access microphone. Please check your browser permissions and ensure a microphone is connected.');
      setStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Clean up audio resources
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  // Set up and clean up on mount/unmount
  useEffect(() => {
    setupMicrophone();
    
    return () => {
      cleanup();
    };
  }, [setupMicrophone]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Microphone Check
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        We need to verify that your microphone is working properly. Please speak into your microphone.
        {status === 'success' && (
          <Box sx={{ mt: 1, color: isSpeaking ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}>
            {isSpeaking ? '🎤 Speaking detected!' : '🔇 Not speaking'}
          </Box>
        )}
      </Typography>
      
      <Box sx={{ 
        width: '100%', 
        maxWidth: 400, 
        height: 200, 
        mx: 'auto', 
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #ddd',
        borderRadius: 2,
        p: 2
      }}>
        {status === 'pending' && (
          <>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Initializing microphone...
            </Typography>
          </>
        )}
        
        {status === 'error' && (
          <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main' }} />
        )}
        
        {status === 'success' && (
          <>
            <MicIcon 
              sx={{ 
                fontSize: 60, 
                color: isSpeaking ? 'success.main' : 'primary.main', 
                mb: 2,
                transition: 'all 0.3s ease-in-out',
                transform: isSpeaking ? 'scale(1.1)' : 'scale(1)'
              }} 
            />
            <Typography variant="h6" sx={{ mt: 2, color: isSpeaking ? 'success.main' : 'text.secondary' }}>
              {isSpeaking ? '🎤 We can hear you speaking!' : '🔇 Please speak into your microphone...'}
            </Typography>
          </>
        )}
      </Box>
      
      {status === 'success' && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />} 
          severity="success"
          sx={{ mb: 2 }}
        >
          Microphone is working properly!
        </Alert>
      )}
      
      {status === 'error' && (
        <Alert 
          severity="error"
          sx={{ mb: 2 }}
        >
          {errorMessage || 'Microphone check failed. Please ensure your microphone is connected and you have granted permission.'}
        </Alert>
      )}
      
      {/* Only show Retry button on error, parent handles Continue button */}
      {status === 'error' && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => {
              cleanup();
              setupMicrophone();
            }}
          >
            Retry
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MicrophoneCheck;
