import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Alert, LinearProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WifiIcon from '@mui/icons-material/Wifi';
import axios from '../../../utils/axios';

// Helper function to measure latency to a given URL
const measureLatency = async (url, timeout = 3000) => {
  const startTime = performance.now();
  try {
    await axios.head(url, { timeout });
    return Math.round(performance.now() - startTime);
  } catch (error) {
    console.warn(`Latency measurement to ${url} failed:`, error.message);
    return null;
  }
};

// Fallback speed test when the backend is not available
const runFallbackSpeedTest = async () => {
  try {
    // Try Cloudflare's speed test first
    const cloudflareLatency = await measureLatency('https://1.1.1.1');
    
    // If we can't measure latency, the connection is likely down
    if (cloudflareLatency === null) {
      throw new Error('Cannot connect to the internet');
    }
    
    // Run a simple download test
    const startTime = performance.now();
    const response = await fetch('https://httpbin.org/bytes/500000', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Read the response to measure actual download time
    const reader = response.body.getReader();
    let receivedLength = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedLength += value.length;
    }
    
    const elapsedTime = (performance.now() - startTime) / 1000; // Convert to seconds
    
    if (elapsedTime <= 0) {
      throw new Error('Invalid time measurement');
    }
    
    // Calculate speed in Mbps
    const speedMbps = (receivedLength * 8) / (elapsedTime * 1000000);
    return {
      download: Math.max(0.1, parseFloat(speedMbps.toFixed(2))),
      upload: Math.max(0.1, parseFloat((speedMbps * 0.7).toFixed(2))), // Estimate upload as 70% of download
      ping: cloudflareLatency,
      isFallback: true
    };
    
  } catch (error) {
    console.error('Fallback speed test failed:', error);
    throw error;
  }
};

const InternetCheck = ({ onCheckComplete }) => {
  const [status, setStatus] = useState('pending'); // pending, success, warning, error
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [latency, setLatency] = useState(0);
  const [progress, setProgress] = useState(0);
  const [testInProgress, setTestInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  // Minimum requirements
  const MIN_DOWNLOAD_SPEED = 2; // Minimum download speed in Mbps
  const MIN_UPLOAD_SPEED = 1;   // Minimum upload speed in Mbps
  const MAX_LATENCY = 500;      // Maximum acceptable latency in milliseconds
  
  // Recommended requirements
  const RECOMMENDED_DOWNLOAD_SPEED = 5; // Mbps
  const RECOMMENDED_UPLOAD_SPEED = 2;   // Mbps
  const RECOMMENDED_LATENCY = 100; // ms

  const evaluateResults = useCallback((download, upload, ping) => {
    // Warnings should be shown with ping above 100 ms, download speed less than 5mbps, upload speed less than 1 mbps
    const downloadSpeedOk = download >= 5;
    const uploadSpeedOk = upload >= 1;
    const pingOk = ping <= 100;

    if (downloadSpeedOk && uploadSpeedOk && pingOk) {
      setStatus('success');
      onCheckComplete(true);
      setErrorMessage('');
    } else {
      setStatus('warning');
      onCheckComplete(false); // Or true if you want to allow proceeding with a warning

      const issues = [];
      if (!downloadSpeedOk) {
        issues.push(`Download speed is ${download.toFixed(2)} Mbps (recommended: 5+ Mbps)`);
      }
      if (!uploadSpeedOk) {
        issues.push(`Upload speed is ${upload.toFixed(2)} Mbps (recommended: 1+ Mbps)`);
      }
      if (!pingOk) {
        issues.push(`Ping is ${ping} ms (recommended: < 100 ms)`);
      }
      setErrorMessage(issues.join('; '));
    }
  }, [onCheckComplete]);

  const checkInternetSpeed = useCallback(async () => {
    if (testInProgress) return;
    
    setTestInProgress(true);
    setStatus('pending');
    setProgress(0);
    setErrorMessage('');
    
    
    try {
      // Initial connectivity check
      setProgress(10);
      
      // Check if we're online
      if (!navigator.onLine) {
        throw new Error('No internet connection detected. Please check your network connection.');
      }
      
      // Try the backend speed test first
      try {
        setProgress(20);
        
        // First check if the backend is available
        const healthCheck = await axios.get('/api/health', { timeout: 5000 });
        
        if (healthCheck.data?.status === 'ok') {
          // Backend is available, use it for the speed test
          const response = await axios.get('/api/speedtest/test', {
            timeout: 30000, // 30 second timeout
            onDownloadProgress: (progressEvent) => {
              // Update progress based on the test progress
              const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
              setProgress(20 + Math.min(70, percentCompleted * 0.7)); // Cap at 90%
            }
          });
          
          if (response.data && response.data.success) {
            const dSpeed = parseFloat(response.data.download.toFixed(2));
            const uSpeed = parseFloat(response.data.upload.toFixed(2));
            const ping = parseFloat(response.data.ping.toFixed(2));

            setDownloadSpeed(dSpeed);
            setUploadSpeed(uSpeed);
            setLatency(ping);
            
            setProgress(95);
            evaluateResults(dSpeed, uSpeed, ping);
            return; // Success, exit the function
          }
        }
      } catch (backendError) {
        console.warn('Backend speed test not available, falling back to client-side test:', backendError);
      }
      
      // If we get here, the backend test failed or is not available
      
      setStatus('warning');
      setProgress(30);
      
      // Run the fallback test
      const fallbackResult = await runFallbackSpeedTest();
      
      const dSpeed = fallbackResult.download;
      const uSpeed = fallbackResult.upload;
      const ping = fallbackResult.ping;

      setDownloadSpeed(dSpeed);
      setUploadSpeed(uSpeed);
      setLatency(ping);
      setProgress(95);
      evaluateResults(dSpeed, uSpeed, ping);
      
    } catch (error) {
      console.error('Speed test failed:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to test internet connection');
    } finally {
      setTestInProgress(false);
      setProgress(100);
    }
  }, [evaluateResults, testInProgress]);

  useEffect(() => {
    // Check if online
    if (!navigator.onLine) {
      setStatus('error');
      return;
    }
    
    // Listen for online/offline events
    const handleOnline = () => setStatus('pending');
    const handleOffline = () => setStatus('error');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Start the speed test
    checkInternetSpeed();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkInternetSpeed]);



  const getSpeedRating = (speed, type) => {
    if (status === 'pending') return 'Testing...';
    if (status === 'error') return 'Error';
    
    const minThreshold = type === 'download' ? MIN_DOWNLOAD_SPEED : MIN_UPLOAD_SPEED;
    const recommendedThreshold = type === 'download' ? RECOMMENDED_DOWNLOAD_SPEED : RECOMMENDED_UPLOAD_SPEED;
    
    if (speed >= recommendedThreshold) return 'Excellent';
    if (speed >= minThreshold) return 'Acceptable';
    return 'Too slow';
  };

  const getLatencyRating = (latency) => {
    if (latency <= RECOMMENDED_LATENCY) return 'Excellent';
    if (latency <= MAX_LATENCY) return 'Acceptable';
    return 'Too high';
  };

  const renderStatusMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }
    
    switch (status) {
      case 'pending':
        return 'Testing your internet connection...';
      case 'success':
        return 'Your internet connection meets the requirements.';
      case 'warning':
        return 'Your internet connection might be slow. Some features may not work optimally.';
      case 'error':
        return 'Unable to test your internet connection. Please check your connection and try again.';
      default:
        return 'Ready to test your internet connection.';
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Internet Connection Check
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        We need to verify that your internet connection is fast enough for the exam.
      </Typography>
      
      {!navigator.onLine && (
        <Alert 
          severity="error"
          sx={{ mb: 3 }}
        >
          You appear to be offline. Please check your internet connection and try again.
        </Alert>
      )}
      
      {navigator.onLine && status === 'pending' && (
        <Box sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {renderStatusMessage()}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 10, borderRadius: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {progress < 20 ? 'Measuring latency' : 
               progress < 60 ? 'Testing download speed' : 
               'Testing upload speed'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
        </Box>
      )}
      
      {navigator.onLine && status !== 'pending' && (
        <Box sx={{ 
          maxWidth: 500, 
          mx: 'auto', 
          mb: 3,
          p: 2,
          border: '1px solid #ddd',
          borderRadius: 2
        }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WifiIcon sx={{ mr: 1 }} />
            Connection Results
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Download Speed: {downloadSpeed.toFixed(2)} Mbps
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1
            }}>
              <Typography variant="caption" color="text.secondary">0 Mbps</Typography>
              <Typography variant="caption" color="text.secondary">15+ Mbps</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(downloadSpeed / 15 * 100, 100)} 
              sx={{ 
                height: 8, 
                borderRadius: 1,
                bgcolor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  bgcolor: downloadSpeed >= RECOMMENDED_DOWNLOAD_SPEED ? 'success.main' : 
                          downloadSpeed >= MIN_DOWNLOAD_SPEED ? 'warning.main' : 'error.main'
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: downloadSpeed >= RECOMMENDED_DOWNLOAD_SPEED ? 'success.main' : 
                       downloadSpeed >= MIN_DOWNLOAD_SPEED ? 'warning.main' : 'error.main'
              }}
            >
              {getSpeedRating(downloadSpeed, 'download')}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Upload Speed: {uploadSpeed.toFixed(2)} Mbps
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1
            }}>
              <Typography variant="caption" color="text.secondary">0 Mbps</Typography>
              <Typography variant="caption" color="text.secondary">10+ Mbps</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(uploadSpeed / 10 * 100, 100)} 
              sx={{ 
                height: 8, 
                borderRadius: 1,
                bgcolor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  bgcolor: uploadSpeed >= RECOMMENDED_UPLOAD_SPEED ? 'success.main' : 
                          uploadSpeed >= MIN_UPLOAD_SPEED ? 'warning.main' : 'error.main'
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: uploadSpeed >= RECOMMENDED_UPLOAD_SPEED ? 'success.main' : 
                       uploadSpeed >= MIN_UPLOAD_SPEED ? 'warning.main' : 'error.main'
              }}
            >
              {getSpeedRating(uploadSpeed, 'upload')}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Latency: {latency} ms
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1
            }}>
              <Typography variant="caption" color="text.secondary">0 ms</Typography>
              <Typography variant="caption" color="text.secondary">300+ ms</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(latency / 300 * 100, 100)} 
              sx={{ 
                height: 8, 
                borderRadius: 1,
                bgcolor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  bgcolor: latency <= RECOMMENDED_LATENCY ? 'success.main' : 
                          latency <= MAX_LATENCY ? 'warning.main' : 'error.main'
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: latency <= RECOMMENDED_LATENCY ? 'success.main' : 
                       latency <= MAX_LATENCY ? 'warning.main' : 'error.main'
              }}
            >
              {getLatencyRating(latency)}
            </Typography>
          </Box>
        </Box>
      )}
      
      {status === 'success' && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />} 
          severity="success"
          sx={{ mb: 2 }}
        >
          Your internet connection meets all the recommended requirements for the exam.
        </Alert>
      )}
      
      {status === 'warning' && (
        <Alert 
          icon={<WarningAmberIcon fontSize="inherit" />}
          severity="warning"
          sx={{ mb: 2 }}
        >
          {errorMessage}
        </Alert>
      )}
      
      {status === 'error' && (
        <Alert 
          icon={<ErrorOutlineIcon fontSize="inherit" />}
          severity="error"
          sx={{ mb: 2 }}
        >
          {errorMessage}
        </Alert>
      )}
      

      
      {/* No action buttons - parent will handle the continue action */}
      <Box mt={2}>
        <Typography variant="body2" color="textSecondary" align="center">
          {status === 'success' ? '✓ Internet check passed' : 
           status === 'warning' ? '⚠️ Internet check completed with warnings' :
           status === 'error' ? '✗ Internet check failed' :
           'Testing internet connection...'}
        </Typography>
      </Box>
    </Box>
  );
};

export default InternetCheck;
