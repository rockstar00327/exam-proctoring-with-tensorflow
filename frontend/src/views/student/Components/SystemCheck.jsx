import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
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
import DevicesIcon from '@mui/icons-material/Devices';
import TabIcon from '@mui/icons-material/Tab';

const SystemCheck = ({ onCheckComplete }) => {
  const [status, setStatus] = useState('pending'); // pending, success, warning, error
  const [deviceInfo, setDeviceInfo] = useState({
    type: '',
    os: '',
    isDesktop: false,
    isMobile: false,
    isTablet: false
  });
  const [checkingComplete, setCheckingComplete] = useState(false);
  const [tabCount, setTabCount] = useState(0);

  const tabId = useRef(`tab_${Date.now()}_${Math.random()}`);
  const TABS_KEY = 'ai-proctor-active-tabs';
  const HEARTBEAT_INTERVAL = 2000; // 2 seconds
  const STALE_THRESHOLD = 5000; // 5 seconds, must be > HEARTBEAT_INTERVAL

  // Function to update and sync tab count across tabs
  const syncTabs = useCallback(() => {
    let currentTabs = {};
    try {
      const storedTabs = localStorage.getItem(TABS_KEY);
      if (storedTabs) {
        const parsedTabs = JSON.parse(storedTabs);
        if (
          typeof parsedTabs === 'object' &&
          parsedTabs !== null &&
          !Array.isArray(parsedTabs)
        ) {
          currentTabs = parsedTabs;
        }
      }
    } catch (e) {
      console.error('Failed to parse tabs from localStorage. Resetting tabs.', e);
      currentTabs = {};
    }

    const now = Date.now();

    // Update this tab's heartbeat
    currentTabs[tabId.current] = now;

    // Remove stale tabs
    const activeTabs = Object.keys(currentTabs)
      .filter((id) => now - currentTabs[id] <= STALE_THRESHOLD)
      .reduce((obj, id) => {
        obj[id] = currentTabs[id];
        return obj;
      }, {});

    try {
      localStorage.setItem(TABS_KEY, JSON.stringify(activeTabs));
      const count = Object.keys(activeTabs).length;
      setTabCount(count > 0 ? count : 1);
    } catch (e) {
      console.error('Failed to set tabs in localStorage:', e);
      setTabCount(1);
    }
  }, []);

  // Function to check device and OS information
  const checkSystem = useCallback(() => {
    setStatus('pending');

    const userAgent = navigator.userAgent;
    let deviceType = 'unknown';
    let os = 'unknown';
    let isDesktop = false;
    let isMobile = false;
    let isTablet = false;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = /iPad|tablet|Tablet/i.test(userAgent) ? 'tablet' : 'mobile';
      isTablet = deviceType === 'tablet';
      isMobile = deviceType === 'mobile';
    } else {
      deviceType = 'desktop';
      isDesktop = true;
    }

    if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Macintosh|Mac OS X/i.test(userAgent)) os = 'macOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';

    setDeviceInfo({ type: deviceType, os, isDesktop, isMobile, isTablet });
    setCheckingComplete(true);
  }, []);

  // Sync tabs periodically and on relevant events
  useEffect(() => {
    syncTabs();

    const intervalId = setInterval(syncTabs, HEARTBEAT_INTERVAL);

    const handleStorageChange = (event) => {
      if (event.key === TABS_KEY) {
        syncTabs();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // If the tab comes back into focus, force immediate sync
        syncTabs();
      }
    };

    const handleFocus = () => {
      // Also force sync on window focus (handles minimized windows)
      syncTabs();
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    const cleanup = () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      try {
        const storedTabs = localStorage.getItem(TABS_KEY);
        let activeTabs = {};
        if (storedTabs) {
          activeTabs = JSON.parse(storedTabs);
          if (
            typeof activeTabs !== 'object' ||
            activeTabs === null ||
            Array.isArray(activeTabs)
          ) {
            activeTabs = {};
          }
        }
        delete activeTabs[tabId.current];
        localStorage.setItem(TABS_KEY, JSON.stringify(activeTabs));
      } catch (e) {
        console.error('Failed to cleanup tab:', e);
      }
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [syncTabs]);

  // Initial device check
  useEffect(() => {
    checkSystem();
  }, [checkSystem]);

  // Evaluate status whenever dependencies change
  useEffect(() => {
    const evaluateResults = () => {
      if (!checkingComplete) return;

      const deviceStatus = deviceInfo.isDesktop
        ? 'success'
        : deviceInfo.isTablet
        ? 'warning'
        : 'error';
      const tabStatus = tabCount <= 1 ? 'success' : 'error';

      if (deviceStatus === 'error' || tabStatus === 'error') {
        setStatus('error');
      } else if (deviceStatus === 'warning') {
        setStatus('warning');
      } else {
        setStatus('success');
      }
    };

    evaluateResults();
  }, [tabCount, deviceInfo, checkingComplete]);

  const handleRetry = () => {
    setCheckingComplete(false);
    checkSystem();
    syncTabs();
  };

  useEffect(() => {
    if (checkingComplete) {
      onCheckComplete(status !== 'error');
    }
  }, [status, checkingComplete, onCheckComplete]);

  const getDeviceTypeDisplay = (type) => {
    const types = {
      desktop: 'Desktop Computer',
      tablet: 'Tablet Device',
      mobile: 'Mobile Phone',
      unknown: 'Unknown Device'
    };
    return types[type] || type;
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        System Environment Check
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        We need to verify that your device and system environment are suitable for the exam.
      </Typography>

      {!checkingComplete ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              maxWidth: 500,
              mx: 'auto',
              mb: 3,
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 2
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DevicesIcon sx={{ mr: 1 }} />
              Device Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  {deviceInfo.isDesktop ? (
                    <CheckCircleOutlineIcon color="success" />
                  ) : deviceInfo.isTablet ? (
                    <WarningAmberIcon color="warning" />
                  ) : (
                    <ErrorOutlineIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Device Type"
                  secondary={getDeviceTypeDisplay(deviceInfo.type)}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Operating System" secondary={deviceInfo.os} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TabIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Browser Tabs"
                  secondary={`${tabCount} tab${tabCount !== 1 ? 's' : ''} detected`}
                />
                {tabCount > 1 && (
                  <ListItemIcon>
                    <ErrorOutlineIcon color="error" />
                  </ListItemIcon>
                )}
              </ListItem>
            </List>
          </Box>

          {status === 'success' && (
            <Alert
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              severity="success"
              sx={{ mb: 2 }}
            >
              Your system environment is suitable for the exam.
            </Alert>
          )}

          {status === 'warning' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Your device (tablet) is supported but not ideal. A desktop computer is recommended for
              the best exam experience.
            </Alert>
          )}

          {status === 'error' && deviceInfo.isMobile && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Mobile phones are not supported for taking exams. Please use a desktop computer or
              tablet.
            </Alert>
          )}

          {tabCount > 1 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Multiple browser tabs detected. Please close all other tabs before starting the exam.
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Requirements:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Desktop computer (recommended) or tablet
              <br />
              • Only one browser tab should be open
              <br />
              • No other applications running in the background
            </Typography>
          </Box>
        </>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        {checkingComplete && (
          <Button variant="outlined" onClick={handleRetry}>
            Retry Check
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SystemCheck;
