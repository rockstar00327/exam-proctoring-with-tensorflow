import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Checkbox,
  TextField,
  Radio,
  FormControlLabel,
  FormControl,
  Card,
  CardContent,
  Typography,
  Stack,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// --- Helper Functions ---
const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getDifficultyText = (dif) => {
  const level = Number(dif) || 1;
  switch(level) {
    case 1: return 'Beginner';
    case 2: return 'Intermediate';
    case 3: return 'Expert';
    default: return 'Beginner';
  }
};

// --- Answer Type Components ---

const MultiChoiceAnswer = React.memo(({ options, answer, onChange }) => {
  const handleSelection = (optionIndex) => {
    const currentChoices = answer.multiChoices || [];
    const newChoices = currentChoices.includes(optionIndex)
      ? currentChoices.filter(i => i !== optionIndex)
      : [...currentChoices, optionIndex];
    onChange({ multiChoices: newChoices });
  };

  return (
    <Stack spacing={1}>
      {options.map((option, index) => {
        const optionText = safeString(option.optionText || option, `Option ${index + 1}`);
        const isChecked = (answer.multiChoices || []).includes(index);
        return (
          <FormControlLabel
            key={index}
            control={<Checkbox checked={isChecked} onChange={() => handleSelection(index)} />}
            label={<Typography dangerouslySetInnerHTML={{ __html: optionText }} />}
            sx={{ 
              border: '1px solid #eee',
              borderRadius: 1,
              m: 0, 
              p: 1,
              bgcolor: isChecked ? 'action.hover' : 'transparent'
            }}
          />
        );
      })}
    </Stack>
  );
});

const TrueFalseAnswer = React.memo(({ answer, onChange }) => (
  <Stack spacing={1}>
    <FormControlLabel
      control={<Radio checked={answer.trueFalseAnswer === 'True'} onChange={() => onChange({ trueFalseAnswer: 'True' })} />}
      label="True"
    />
    <FormControlLabel
      control={<Radio checked={answer.trueFalseAnswer === 'False'} onChange={() => onChange({ trueFalseAnswer: 'False' })} />}
      label="False"
    />
  </Stack>
));

const SingleWordAnswer = React.memo(({ answer, onChange }) => {
  const words = answer.singleWords || [''];

  const handleWordChange = (index, value) => {
    const newWords = [...words];
    newWords[index] = value;
    onChange({ singleWords: newWords });
  };

  return (
    <Stack spacing={2}>
      {words.map((word, index) => (
        <TextField
          key={index}
          variant="outlined"
          label={`Answer ${index + 1}`}
          value={word}
          onChange={(e) => handleWordChange(index, e.target.value)}
          onBlur={(e) => handleWordChange(index, e.target.value.trim())}
          fullWidth
        />
      ))}
    </Stack>
  );
});

const EssayAnswer = React.memo(({ answer, onChange }) => (
  <TextField
    variant="outlined"
    fullWidth
    multiline
    rows={8}
    placeholder="Write your answer here..."
    label="Your Answer"
    value={answer.submitEssay || ''}
    onChange={(e) => onChange({ submitEssay: e.target.value })}
    onBlur={(e) => onChange({ submitEssay: e.target.value.trim() })}
  />
));


// --- Main Question Component ---

export default function MultipleChoiceQuestion({
  question: propQuestion = {},
  answers = {},
  setAnswers = () => {},
  currentQuestion = 0,
  setCurrentQuestion = () => {},
}) {

  // --- Hooks and State ---
  // All hooks are at the top level, before any conditional returns.

  const [currentAnswer, setCurrentAnswer] = useState({});

  const question = useMemo(() => {
    if (!propQuestion || typeof propQuestion !== 'object') return null;
    return {
      ...propQuestion,
      question: safeString(propQuestion.question, 'Question text not available'),
      difficulty: Number(propQuestion.difficulty) || 1,
      multiOptions: Array.isArray(propQuestion.multiOptions) ? propQuestion.multiOptions : [],
    };
  }, [propQuestion]);

  useEffect(() => {
    setCurrentAnswer(answers[currentQuestion] || {});
  }, [answers, currentQuestion]);

  const handleAnswerChange = useCallback((answerUpdate) => {
    setAnswers(prev => {
      const updatedAnswers = { ...prev };
      const current = updatedAnswers[currentQuestion] || {
        question: question.question,
        questionType: question.questionType,
        weight: question.mark || 1,
      };
      updatedAnswers[currentQuestion] = { ...current, ...answerUpdate };
      return updatedAnswers;
    });
  }, [currentQuestion, question, setAnswers]);


  // --- Render Logic ---

  if (!question) {
    return (
      <Card sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Loading question...</Typography>
      </Card>
    );
  }

  const renderAnswerForm = () => {
    switch(question.questionType) {
      case 'Multichoice':
        return <MultiChoiceAnswer options={question.multiOptions} answer={currentAnswer} onChange={handleAnswerChange} />;
      case 'TrueFalse':
        return <TrueFalseAnswer answer={currentAnswer} onChange={handleAnswerChange} />;
      case 'SingleWord':
        return <SingleWordAnswer answer={currentAnswer} onChange={handleAnswerChange} />;
      case 'Essay':
        return <EssayAnswer answer={currentAnswer} onChange={handleAnswerChange} />;
      default:
        return <Typography color="error">Unsupported question type: {question.questionType}</Typography>;
    }
  };

  const difficultyText = getDifficultyText(question.difficulty);

  return (
    <Card sx={{ width: '90%', maxWidth: '800px', mx: 'auto', my: 2, overflow: 'visible' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">Question {currentQuestion + 1}</Typography>
          <Typography variant="caption" sx={{ bgcolor: 'action.selected', px: 1, py: 0.5, borderRadius: 1 }}>
            {difficultyText}
          </Typography>
        </Stack>
        
        <Typography component="div" mb={3} sx={{ '& p': { m: 0 } }} dangerouslySetInnerHTML={{ __html: question.question }} />
        
        <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
          {renderAnswerForm()}
        </FormControl>
        
        <Stack direction="row" sx={{ gap: 2 }} justifyContent="flex-end">
          <Fab
            color="default"
            size="small"
            aria-label="previous"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowBackIcon />
          </Fab>
          <Fab
            color="primary"
            size="small"
            aria-label="next"
            onClick={() => setCurrentQuestion(prev => prev + 1)}
          >
            <ArrowForwardIcon />
          </Fab>
        </Stack>
      </CardContent>
    </Card>
  );
}
