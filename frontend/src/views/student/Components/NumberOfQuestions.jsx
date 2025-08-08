import React, { useEffect, useState, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';


import { Box, Button, Stack, Typography } from '@mui/material';

const NumberOfQuestions = ({
  questions = [],
  currentQuestion = 0,
  setCurrentQuestion = () => {},
  _answers = {},
  submitTest = () => {},
  _selectedExam = {},
  examDurationInSeconds = 600
}) => {
  const totalQuestions = questions?.length || 0;
  const questionNumbers = Array.from({ length: totalQuestions }, (_, index) => index + 1);

  const rows = [];
  for (let i = 0; i < questionNumbers.length; i += 5) {
    rows.push(questionNumbers.slice(i, i + 5));
  }

  // Timer related states - use examDurationInSeconds if available, otherwise default to 10 minutes
  const [timeLeft, setTimeLeft] = useState(examDurationInSeconds || 600);

  // Use a ref to hold the latest submitTest function to avoid re-triggering the effect
  const submitTestRef = useRef(submitTest);
  useEffect(() => {
    submitTestRef.current = submitTest;
  }, [submitTest]);
  
  // Countdown timer effect
  useEffect(() => {
    // Don't start the timer if there's no time left
    if (timeLeft <= 0) {
      submitTestRef.current();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          submitTestRef.current();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);
  
  // Update time left when exam duration changes
  useEffect(() => {
    setTimeLeft(examDurationInSeconds || 600);
  }, [examDurationInSeconds]);

  return (
    <>
      <Box
        position="sticky"
        top="0"
        zIndex={1}
        // bgcolor="white"
        paddingY="10px"
        width="100%"
        px={3}
        // mb={5}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Questions: {currentQuestion + 1}/{totalQuestions}</Typography>
          <Typography variant="h6">
            Time Left: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </Typography>
          <Button variant="contained" onClick={submitTest} color="error">
            Finish Test
          </Button>
        </Stack>
      </Box>

      <Box p={3} mt={5} maxHeight="270px">
        <Grid container spacing={1}>
          {rows.map((row, rowIndex) => (
            <Grid key={rowIndex} item xs={12}>
              <Stack direction="row" alignItems="center" justifyContent="start">
              {row.map((questionNumber) => (
                <Avatar
                  key={questionNumber}
                  variant="rounded"
                  style={{
                    width: "40px",
                    height: "40px",
                    fontSize: "20px",
                    cursor: "pointer",
                    margin: "3px",
                    background: currentQuestion === questionNumber - 1 ? "#4CAF50" : "#ccc",
                    color: "#fff",
                  }}
                  onClick={() => setCurrentQuestion(questionNumber - 1)}
                >
                  {questionNumber}
                </Avatar>
              ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default NumberOfQuestions;
