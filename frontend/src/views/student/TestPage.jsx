import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Grid,
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  LinearProgress
} from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import MultipleChoiceQuestion from './Components/MultipleChoiceQuestion';
import NumberOfQuestions from './Components/NumberOfQuestions';
import WebCam from './Components/WebCam';
import PreExamCheck from './Components/PreExamCheck';
import Proctoring from './Components/Proctoring';
import { useGetExamsQuery, useGetQuestionsQuery, useSubmitTestMutation } from '../../slices/examApiSlice';
import { useSaveCheatingLogMutation } from 'src/slices/cheatingLogApiSlice';
import { toast } from 'react-toastify';

const TestPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  
  // State declarations
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState({});
  const [totalWeight, setTotalWeight] = useState(10);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDurationInSeconds, setExamDurationInSeconds] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [score, setScore] = useState(0);
  const [testResult, setTestResult] = useState([]);
  const [isStartExam, setIsStartExam] = useState(true);
  const [showPreExamCheck, setShowPreExamCheck] = useState(true);
  const [checkResults, setCheckResults] = useState({
    camera: false,
    microphone: false,
    system: false,
    browser: false,
    internet: false
  });
  

  
  // API Calls
  const { 
    data: userExamdata, 
    isSuccess: isExamsSuccess, 
    isError: isExamsError, 
    error: examsError 
  } = useGetExamsQuery();
  
  const [submitTest, { loading }] = useSubmitTestMutation();
  const [questions, setQuestions] = useState([]);
  
  const { 
    data: questionsData, 
    isError: isQuestionsError, 
    error: questionsError 
  } = useGetQuestionsQuery(examId, { skip: !examId });
  
  const [saveCheatingLogMutation] = useSaveCheatingLogMutation();

  // Handle exam data loading
  useEffect(() => {
    if (isExamsSuccess && userExamdata) {
      const exam = userExamdata.find((exam) => exam.examId === examId);
      if (exam) {
        setSelectedExam(exam);
        setExamDurationInSeconds(exam.duration * 60);
      } else {
        toast.error('Exam not found.');
        const timer = setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isExamsSuccess, userExamdata, examId, navigate]);

  // Handle errors
  useEffect(() => {
    if (isExamsError) {
      toast.error(examsError?.data?.message || 'Failed to fetch exams. Please try again later.');
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (isQuestionsError) {
      toast.error(questionsError?.data?.message || 'Failed to fetch questions. Please try again later.');
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isExamsError, isQuestionsError, examsError, questionsError, navigate]);
  const [cheatingLog, setCheatingLog] = useState({
    noFaceCount: 0,
    multipleFaceCount: 0,
    cellPhoneCount: 0,
    ProhibitedObjectCount: 0,
    noiseCount: 0,
    examId: examId,
    username: '',
    email: '',
  });

  useEffect(() => {
    if (questionsData) {
      setQuestions(questionsData);
      setTotalAnswers((prev) => {
        const updatedAnswers = { ...prev };
        for (let i = 0; i < questionsData.length; i++) {
          const question = questionsData[i];
          updatedAnswers[i] = {
            ...updatedAnswers[i],
            question: question?.question,
            questionType: question?.questionType,
            weight: question?.mark || 1,
            // Add correct answer information based on question type
            correctAnswer: question?.questionType === 'Multichoice' ? 
              question.multiOptions || [] :
              question?.questionType === 'TrueFalse' ? 
              question.selectedOneValue :
              question?.questionType === 'SingleWord' ?
              question.singleWordAnswers || [] :
              question.essay || '',
            // Add options for reference
            multiOptions: question?.multiOptions || [],
            selectedOneValue: question?.selectedOneValue,
            singleWordAnswers: question?.singleWordAnswers || [],
            essay: question?.essay || ''
          };
        }
        return updatedAnswers;
      });
    }
  }, [questionsData]);

  const handleTestSubmission = useCallback(async () => {
    try {
      // Check if questions are loaded and valid
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        toast.error('No questions found for this exam. Please try again.');
        return;
      }

      // Ensure user info is available
      if (!userInfo) {
        toast.error('User information not available. Please log in again.');
        return;
      }

      setIsStartExam(false);
      
      // Prepare cheating log with proper defaults
      const updatedLog = {
        ...cheatingLog,
        username: userInfo.name || 'User',
        email: userInfo.email || '',
        examId: examId || ''
      };
      
      // Calculate total weight safely
      const sum = questions.reduce((acc, question) => {
        return acc + (Number(question?.mark) || 0);
      }, 0);
      
      setTotalWeight(sum);
      
      // Prepare exam info with validation
      const examInfo = {
        name: userInfo.name || 'User',
        email: userInfo.email || '',
        examId: examId || '',
        totalQuestions: questions.length,
        totalWeight: sum,
      };
      
      try {
        // Create a deep copy of totalAnswers to avoid mutating state directly
        const cleanedAnswers = JSON.parse(JSON.stringify(totalAnswers));

        // Iterate over the questions to clean the answers based on question type
        questions.forEach((question, index) => {
          const answer = cleanedAnswers[index];
          if (!answer) return;

          switch (question.questionType) {
            case 'SingleWord':
              if (answer.singleWords && Array.isArray(answer.singleWords)) {
                answer.singleWords = answer.singleWords.map(word => word.trim());
              }
              break;
            case 'Essay':
              if (typeof answer.submitEssay === 'string') {
                answer.submitEssay = answer.submitEssay.trim();
              }
              break;
            // No cleaning needed for 'Multichoice' or 'TrueFalse' as they are selection-based
            default:
              break;
          }
        });

        // Submit test and handle response
        const res = await submitTest({
          totalAnswers: cleanedAnswers, // Send the cleaned answers
          examInfo
        }).unwrap();
        
        // Save cheating log if needed
        try {
          await saveCheatingLogMutation(updatedLog).unwrap();
        } catch (logError) {
          console.error('Failed to save cheating log:', logError);
          // Don't fail the entire submission if logging fails
        }
        
        // Handle successful submission
        if (res?.success) {
          setScore(Number(res.score) || 0);
          setTestResult(Array.isArray(res.result) ? res.result : []);
          setOpenModal(true);
        } else {
          navigate('/dashboard');
          toast.error(res?.message || 'Failed to submit test. Please try again later.');
        }
      } catch (error) {
        console.error('Test submission error:', error);
        toast.error(error?.data?.message || 'Failed to submit test. Please check your connection and try again.');
      }
    } catch (error) {
      console.error('Error in test submission:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  }, [questions, userInfo, cheatingLog, examId, totalAnswers, navigate, saveCheatingLogMutation, submitTest]);

  useEffect(() => {
    const saveCheatingLog = async () => {
      try {
        await saveCheatingLogMutation(cheatingLog).unwrap();
      } catch (error) {
        console.error('Failed to save cheating log:', error);
      }
    };

    if (totalAnswers && Object.keys(totalAnswers).length === questions.length) {
      const timer = setTimeout(() => {
        saveCheatingLog();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [cheatingLog, saveCheatingLogMutation, questions, totalAnswers]);

  const handleAutoSubmit = useCallback(() => {
    toast.error('Exam auto-submitted due to multiple violations.');
    handleTestSubmission();
  }, [handleTestSubmission]);

  const handleClose = () => {
    setOpenModal(false);
    navigate(`/dashboard`);
  };

  const formatUserAnswer = (result) => {
    if (!result || !result.userAnswer) return 'No answer provided';

    const { userAnswer, questionType } = result;

    switch (questionType) {
      case 'Multichoice':
        if (userAnswer.multiChoices && userAnswer.multiChoices.length > 0) {
          return userAnswer.multiChoices
            .map(index => userAnswer.multiOptions[index]?.optionText || `Option ${index + 1}`)
            .join(', ');
        }
        return 'No selection';
      case 'TrueFalse':
        return userAnswer.trueFalseAnswer || 'Not answered';
      case 'SingleWord':
        return (userAnswer.singleWords || []).join(', ');
      case 'Essay':
        return userAnswer.submitEssay || 'No answer provided';
      default:
        return 'N/A';
    }
  };

  // Render test results in a modal
  const renderTestResults = () => (
    <Modal
      open={openModal}
      onClose={handleClose}
      aria-labelledby="test-results-modal"
      aria-describedby="test-results-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 800,
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        overflowY: 'auto',
        background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
      }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
          🎓 Exam Results
        </Typography>
        
        <Box sx={{ 
          mt: 3, 
          p: 3, 
          bgcolor: 'white', 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {score} / {totalWeight}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {Math.round((score / totalWeight) * 100)}% Correct
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(score / totalWeight) * 100} 
              sx={{ 
                height: 12, 
                borderRadius: 6, 
                mt: 2,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                }
              }}
            />
          </Box>
          
          {testResult.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid #eee', pb: 1 }}>
                Detailed Results
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
                {testResult.map((result, index) => (
                  <ListItem 
                    key={index} 
                    divider
                    sx={{ 
                      bgcolor: result.isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                      mb: 1.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(5px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} dangerouslySetInnerHTML={{ __html: `Q${index + 1}: ${result.question}` }} />
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary" display="block" sx={{ mt: 1 }}>
                            Your answer: {formatUserAnswer(result)}
                          </Typography>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            sx={{ 
                              color: result.isCorrect ? 'success.main' : 'error.main',
                              fontWeight: 'bold',
                              display: 'inline-block',
                              mt: 0.5
                            }}
                          >
                            {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </Typography>
                          {!result.isCorrect && result.correctAnswer && (
                            <Typography component="span" variant="body2" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              Correct answer: {Array.isArray(result.correctAnswer) ? result.correctAnswer.join(', ') : result.correctAnswer}
                            </Typography>
                          )}
                        </>
                      }
                      sx={{ '& .MuiListItemText-secondary': { mt: 1 } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button 
              onClick={handleClose} 
              variant="contained" 
              color="primary"
              size="large"
              sx={{
                minWidth: 200,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Return to Dashboard
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );

  useEffect(() => {
    if (
      questions[currentQuestion]?.questionType === "SingleWord"
    ) {
      setTotalAnswers((prevAnswers) => {
        const updatedAnswers = {...prevAnswers};

        if ( !totalAnswers[currentQuestion]?.singleWords || 
          totalAnswers[currentQuestion]?.singleWords.length === 0
        ) {
          updatedAnswers[currentQuestion] = {
            ...updatedAnswers[currentQuestion],
            singleWords: [""],
          };
        }
        if(questions[currentQuestion]?.singleWordAnswers && 
          questions[currentQuestion]?.singleWordAnswers.length > 0) {
            updatedAnswers[currentQuestion] = {
              ...updatedAnswers[currentQuestion],
              singleWords: [ ...Array(questions[currentQuestion].singleWordAnswers.length).fill("")],
            };
          }

        return updatedAnswers;
      });
    }
  }, [currentQuestion, questions, totalAnswers]);

  const handleCheckComplete = useCallback((checkName, result) => {
    setCheckResults(prevResults => ({
      ...prevResults,
      [checkName]: result,
    }));
  }, []);

  useEffect(() => {
    if (Object.values(checkResults).every(Boolean)) {
      const timer = setTimeout(() => {
        setShowPreExamCheck(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [checkResults]);

  return (
    <>
      {renderTestResults()}
      <PageContainer title="Test" description="Test page">
        {showPreExamCheck ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Pre-Exam Check
            </Typography>
            <PreExamCheck onCheckComplete={handleCheckComplete} />
            {Object.values(checkResults).every(Boolean) && (
              <Box mt={4} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowPreExamCheck(false)}
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  Continue to Exam
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Proctoring onAutoSubmit={handleAutoSubmit}>
            <Box pt="3rem">
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <BlankCard>
                    <Box p={3} minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
                      {questions.length === 0 ? (
                        <Typography>No questions found for this exam.</Typography>
                      ) : (
                        <MultipleChoiceQuestion
                          question={questions[currentQuestion]}
                          answers={totalAnswers}
                          setAnswers={setTotalAnswers}
                          currentQuestion={currentQuestion}
                        />
                      )}
                    </Box>
                  </BlankCard>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <NumberOfQuestions
                    questions={questions}
                    currentQuestion={currentQuestion}
                    setCurrentQuestion={setCurrentQuestion}
                    answers={totalAnswers}
                    submitTest={handleTestSubmission}
                    selectedExam={selectedExam}
                    examDurationInSeconds={examDurationInSeconds}
                  />

                  <WebCam
                    cheatingLog={cheatingLog}
                    setCheatingLog={setCheatingLog}
                    isStartExam={isStartExam}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleTestSubmission}
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Submit Test'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Proctoring>
        )}
      </PageContainer>
    </>
  );
};

export default TestPage;
