import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 

  Alert, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LanguageIcon from '@mui/icons-material/Language';



// List of supported browsers and their minimum versions
const supportedBrowsers = {
  chrome: { minVersion: 88, recommended: true },
  firefox: { minVersion: 85, recommended: true },
  edge: { minVersion: 88, recommended: true },
  safari: { minVersion: 14, recommended: true },
  opera: { minVersion: 74, recommended: false }
};

const BrowserCheck = ({ onCheckComplete }) => {
  const [status, setStatus] = useState('pending'); // pending, success, warning, error
  const [browserInfo, setBrowserInfo] = useState({
    name: '',
    version: '',
    isSupported: false,
    isRecommended: false
  });
  const [checkingComplete, setCheckingComplete] = useState(false);

  const getBrowserDisplayName = useCallback((name) => {
    const names = {
      chrome: 'Google Chrome',
      firefox: 'Mozilla Firefox',
      edge: 'Microsoft Edge',
      safari: 'Apple Safari',
      opera: 'Opera',
      unknown: 'Unknown Browser'
    };
    return names[name] || name;
  }, []);

  const checkBrowser = useCallback(() => {
    setStatus('pending');
    
    const userAgent = navigator.userAgent;
    let browserName = 'unknown';
    let browserVersion = 'unknown';
    
    // Detect browser and version
    // Chrome (must check for Chrome before Safari and Edge)
    if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1) {
      browserName = 'chrome';
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } 
    // Firefox
    else if (userAgent.indexOf("Firefox") > -1) {
      browserName = 'firefox';
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } 
    // Edge (Chromium)
    else if (userAgent.indexOf("Edg") > -1) {
      browserName = 'edge';
      const match = userAgent.match(/Edg\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } 
    // Safari (must check for Chrome first)
    else if (userAgent.indexOf("Safari") > -1) {
      browserName = 'safari';
      const match = userAgent.match(/Version\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    }
    // Opera
    else if (userAgent.indexOf("OPR") > -1) {
      browserName = 'opera';
      const match = userAgent.match(/OPR\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    }
    
    // Extract major version number
    const majorVersion = browserVersion !== 'unknown' ? parseInt(browserVersion.split('.')[0], 10) : 0;
    
    // Check if browser is supported and recommended
    const isSupported = browserName !== 'unknown' && 
      supportedBrowsers[browserName] && 
      majorVersion >= supportedBrowsers[browserName].minVersion;
    
    const isRecommended = isSupported && supportedBrowsers[browserName].recommended;
    
    // Update state
    setBrowserInfo({
      name: browserName,
      version: browserVersion,
      isSupported,
      isRecommended
    });
    
    // Set status based on browser support
    let finalStatus;
    if (isSupported) {
      finalStatus = isRecommended ? 'success' : 'warning';
    } else {
      finalStatus = 'error';
    }
    setStatus(finalStatus);
    setCheckingComplete(true);
    onCheckComplete(finalStatus !== 'error');
    }, [onCheckComplete]);

  useEffect(() => {
    checkBrowser();
  }, [checkBrowser]);



  const renderStatusAlert = () => {
    switch (status) {
      case 'success':
        return (
          <Alert 
            icon={<CheckCircleOutlineIcon fontSize="inherit" />} 
            severity="success"
            sx={{ mb: 2 }}
          >
            Your browser is fully compatible with the exam system.
          </Alert>
        );
      case 'warning':
        return (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Your browser is supported but not recommended. For the best experience, please use Chrome, Firefox, Edge, or Safari.
          </Alert>
        );
      case 'error':
        return (
          <Alert severity="error" sx={{ mb: 2 }}>
            Your browser is not supported. Please use a modern browser like Chrome (v88+), Firefox (v85+), Edge (v88+), or Safari (v14+).
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Browser Compatibility Check
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        We need to verify that your browser is compatible with the exam system.
      </Typography>
      
      {!checkingComplete ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ 
            maxWidth: 500, 
            mx: 'auto', 
            mb: 3,
            p: 2,
            border: '1px solid #ddd',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <LanguageIcon sx={{ mr: 1 }} />
              Your Browser Information
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Browser" 
                  secondary={getBrowserDisplayName(browserInfo.name)} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Version" 
                  secondary={browserInfo.version} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  {browserInfo.isSupported ? (
                    <CheckCircleOutlineIcon color="success" />
                  ) : (
                    <ErrorOutlineIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    browserInfo.isSupported 
                      ? "Your browser is supported" 
                      : "Your browser is not supported"
                  } 
                />
              </ListItem>
              {browserInfo.isSupported && !browserInfo.isRecommended && (
                <ListItem>
                  <ListItemIcon>
                    <WarningAmberIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="This browser is supported but not recommended" 
                  />
                </ListItem>
              )}
            </List>
          </Box>
          
          {renderStatusAlert()}
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recommended Browsers:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Google Chrome (v88+), Mozilla Firefox (v85+), Microsoft Edge (v88+), Safari (v14+)
            </Typography>
          </Box>
        </>
      )}
      

    </Box>
  );
};

export default React.memo(BrowserCheck);
