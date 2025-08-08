import React, { useRef, useState, useEffect } from 'react';

import * as cocossd from '@tensorflow-models/coco-ssd';
import Webcam from 'react-webcam';


import { Box, Card } from '@mui/material';
import swal from 'sweetalert';

export default function WebCam({ _cheatingLog = {}, setCheatingLog = () => {}, isStartExam: StartExam = false }) {
  // Ensure setCheatingLog is a function
  const safeSetCheatingLog = React.useCallback((updater) => {
    if (typeof updater === 'function' && typeof setCheatingLog === 'function') {
      setCheatingLog(updater);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('setCheatingLog is not a function');
    }
  }, [setCheatingLog]);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [intervalId, setIntervalId] = useState(null);
  const streamRef = useRef(null);
  const audioContext = useRef(new (window.AudioContext || window.webkitAudioContext)());

  const stopAudioAnalysis = React.useCallback(() => {
    console.log('Stopping audio analysis');
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [intervalId]);

  const analyzeAudio = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = audioContext.current.createMediaStreamSource(stream);
      const analyser = audioContext.current.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const id = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

        console.log('Volume Level:', volume);

        if (volume > 70) {
          console.log('Voice detected!');
          safeSetCheatingLog((prevLog) => ({
            ...prevLog,
            noiseCount: (prevLog?.noiseCount || 0) + 1,
          }));

          if (StartExam) {
            swal('Noise Place Detected', 'Action has been Recorded', 'error');
          }
        }
      }, 3000);

      setIntervalId(id);
    } catch {
      if (StartExam) {
        console.log(StartExam);
        swal('Your device is not open', 'Please turn on your device', 'error');
      }
    }
  }, [StartExam, safeSetCheatingLog]);

  const detect = React.useCallback(
    async (net) => {
      if (
        typeof webcamRef.current !== 'undefined' &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const obj = await net.detect(video);

        let person_count = 0;
        if (obj.length < 1) {
          safeSetCheatingLog((prevLog) => ({
            ...prevLog,
            noFaceCount: (prevLog?.noFaceCount || 0) + 1,
          }));
          swal('Face Not Visible', 'Action has been Recorded', 'error');
        }
        obj.forEach((element) => {
          if (element.class === 'cell phone') {
            safeSetCheatingLog((prevLog) => ({
              ...prevLog,
              cellPhoneCount: (prevLog?.cellPhoneCount || 0) + 1,
            }));
            swal('Cell Phone Detected', 'Action has been Recorded', 'error');
          }
          if (element.class === 'book') {
            safeSetCheatingLog((prevLog) => ({
              ...prevLog,
              ProhibitedObjectCount: (prevLog?.ProhibitedObjectCount || 0) + 1,
            }));
            swal('Prohibited Object Detected', 'Action has been Recorded', 'error');
          }

          if (!element.class === 'person') {
            swal('Face Not Visible', 'Action has been Recorded', 'error');
          }
          if (element.class === 'person') {
            person_count++;
            if (person_count > 1) {
              safeSetCheatingLog((prevLog) => ({
                ...prevLog,
                multipleFaceCount: (prevLog?.multipleFaceCount || 0) + 1,
              }));
              swal('Multiple Faces Detected', 'Action has been Recorded', 'error');
              person_count = 0;
            }
          }
        });
      }
    },
    [safeSetCheatingLog]
  );

  const runCoco = React.useCallback(async () => {
    const net = await cocossd.load();
    console.log('Ai models loaded.');

    setInterval(() => {
      detect(net);
    }, 500);
  }, [detect]);

  useEffect(() => {
    console.log(StartExam);
    if (StartExam) {
      console.log('start');
      analyzeAudio();
    } else {
      console.log('not start');
      stopAudioAnalysis();
    }
  }, [StartExam, analyzeAudio, stopAudioAnalysis]);

  useEffect(() => {
    runCoco();
  }, [runCoco]);

  useEffect(() => {
    // Cleanup function to stop audio analysis if the component unmounts
    return () => {
      stopAudioAnalysis();
    };
  }, [stopAudioAnalysis]);
  
  // if(isStartExam) {debugger
  //   // **Call analyzeAudio() every 3 seconds**
  //   setInterval(analyzeAudio, 3000);
  // }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, width: 160, height: 120, borderRadius: 2, overflow: 'hidden', zIndex: 1300, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <Card variant="outlined" sx={{ 
        position: 'relative',
        width: 160, 
        height: 120,
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: 3,
        '&:hover': {
          boxShadow: 6,
        },
        transition: 'all 0.3s ease-in-out'
      }}>
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          videoConstraints={{
            width: 160,
            height: 120,
            facingMode: 'user'
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 10,
          }}
        />
      </Card>
    </Box>
  );
}
