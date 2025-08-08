import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  TextField,
  TextareaAutosize,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Grid,
  Typography,
  RadioGroup,
  Radio,
  Slider,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';

import swal from 'sweetalert';
import { useCreateQuestionMutation, useGetExamsQuery } from 'src/slices/examApiSlice';
import DashboardCard from 'src/components/shared/DashboardCard';
import { toast } from 'react-toastify';
import questionData from '../QuestionsData';
import { ThemeContext } from 'src/theme/ThemeContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import './addQuestion.css';

const AddQuestionForm = () => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const { mode } = useContext(ThemeContext);

  const [questionType, setQuestionType] = useState(questionData?.questionTypes.length > 0 ? questionData.questionTypes[0].value: 'Select QuestionType');
  const [subject, setSubject] = useState(questionData?.questionSubjects.length > 0 ? questionData.questionSubjects[0].value: 'Select Subject');
  const [topic, setTopic] = useState(questionData?.questionTopics.length > 0 ? questionData.questionTopics[0].value: 'Select Topic');

  const [difficulty, setDifficulty] = useState(1);
  const [question, setQuestion] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [mark, setMark] = useState(1);
  const [negativeMark, setNegativeMark] = useState(0);

  const [createQuestion] = useCreateQuestionMutation();
  const { data: examsData, refetch } = useGetExamsQuery();

  const navigate = useNavigate();
  const handleCancel = () => {
    navigate('/dashboard');
  }
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  useEffect(() => {
    if (examsData && examsData.length > 0) {
      setSelectedExamId(examsData[0].examId);
    }
  }, [examsData]);

  // Muiti Choice
  const [multiChoiceOptions, setMultiChoiceOptions] = useState([
    { optionText: "", isCorrect: false },
  ]);
  const [error, setError] = useState(false);

  const handleMultiChoiceAddOption = () => {
    if (!multiChoiceOptions[multiChoiceOptions.length - 1].optionText.trim()) {
      setError(true);
      return;
    }

    setError(false);
    setMultiChoiceOptions([...multiChoiceOptions, { optionText: "", isCorrect: false }]);
  };

  const handleMultiChoiceOptionChange = (index, value) => {
    const updatedOptions = multiChoiceOptions.map((option, i) =>
      i === index ? { ...multiChoiceOptions, optionText: value, isCorrect: option.isCorrect } : option
    );
    setMultiChoiceOptions(updatedOptions);

    if (value.trim()) {
      setError(false);
    }
  };

  const handleMultiChoiceCorrectChange = (index) => {
    const updatedOptions = multiChoiceOptions.map((option, i) =>
      i === index ? { ...option, isCorrect: !option.isCorrect } : option
    );
    setMultiChoiceOptions(updatedOptions);
  };

  const handleMultiDleteOption = (index) => {
    const updatedMultiOptions = multiChoiceOptions.filter((_, i) => i !== index)
    if (updatedMultiOptions?.length > 0) {
      setMultiChoiceOptions(updatedMultiOptions)
    } else setMultiChoiceOptions([{ optionText: "", isCorrect: false }])
  }

  // True/False
  const [selectedOneValue, setSelectedOneValue] = useState("False");

  const handleOneChange = (e) => {
    setSelectedOneValue(e.target.value);
  };

  // Single Word
  const [singleWordAnswers, setSingleWordAnswers] = useState(['']);
  const [singleWordError, setSingleWordError] = useState(false);
  const addSingleWordNewInput = () => {
    if (singleWordAnswers.some((answer) => !answer.trim())) {
      setSingleWordError(true);
      return;
    }

    setSingleWordError(false);
    setSingleWordAnswers([...singleWordAnswers, ""]);
  };

  const handleSingleWordInputChange = (index, value) => {
    const updatedAnswers = [...singleWordAnswers];
    updatedAnswers[index] = value;
    setSingleWordAnswers(updatedAnswers);

    if (value.trim()) {
      setSingleWordError(false);
    }
  };

  const handleDeleteSingleWord = (index) => {
    const updatedSingleWords = singleWordAnswers.filter((_, i) => i !== index);
    if(updatedSingleWords?.length > 0) {
      setSingleWordAnswers(updatedSingleWords);
    } else setSingleWordAnswers(['']);
  };

  // Essay
  const [essayAnswer, setEssayAnswer] = useState("");
  const [essayError, setEssayError] = useState(false);

  const handleEssayChange = (e) => {
    setEssayAnswer(e.target.value);
    setError(false);
  };

  // Add Question
  const [questionError, setQuestionError] = useState(false);

  // Validate All Question Data Field
  const validateQuestionData = () => {
    if (question.trim() === "" || question.replace(/<(.|\n)*?>/g, "").trim === "") {
      setQuestionError(true);
      return false;
    }
    else if (multiChoiceOptions.some((multioption) => !multioption?.optionText.trim()) && questionType === 'Multichoice') {
      setQuestionError(false);
      setError(true);
      return false;
    }
    else if (singleWordAnswers.some((answer) => !answer.trim()) && questionType === 'SingleWord') {
      setQuestionError(false);
      setSingleWordError(true);
      return false;
    }
    else if(!essayAnswer.trim() && questionType === 'Essay') {
      setQuestionError(false);
      setEssayError(true);
      return false;
    } else {
      setQuestionError(false);
      setEssayError(false);
      return true;
    }
  };

  // Submit Question Data
  const submitQuestionData = async (e) => {
    let newQuestionObj = {};
    newQuestionObj = {
      examId: selectedExamId,
      _question: question,
      _questionType: questionType,
      _subject: subject,
      _topic: topic,
      _difficulty: difficulty,
      _isPublished: isPublished,
      _mark: mark,
      _negativeMark: negativeMark,
    };
    if(questionType === 'Multichoice'){
      newQuestionObj._multiOptions = multiChoiceOptions;
    };
    if(questionType === 'TrueFalse') {
      newQuestionObj._selectedOneValue = selectedOneValue;
    };
    if(questionType === 'SingleWord') {
      newQuestionObj._singleWordAnswers = singleWordAnswers;
    };
    if(questionType === 'Essay') {
      newQuestionObj._essayAnswer = essayAnswer;
    };

    try {
      const res = await createQuestion(newQuestionObj).unwrap();
      if (res.success === true) {
        toast.success(`Question ${e} successfully!!!`);
      }
      if (res.success === false) {
        toast.error(res.error ? res.error : "Error")
      }
      setQuestion('');
      setMultiChoiceOptions([{ optionText: "", isCorrect: false }]);
      setSelectedOneValue("False");
      setSingleWordAnswers(['']);
      setEssayAnswer('');
      setMark(1);
      setNegativeMark(0);
    } catch {
      swal('', 'Failed to create question. Please try again.', 'error');
    }
  };

  // Handle Publish
  const handlePublish = () => {
    setIsPublished(true);
    if(!validateQuestionData()) {
      return;
    } else {
      submitQuestionData('published');
    };
  };


  return (<div>
    <Grid container spacing={2}>
      <Grid item xs={12}>
      <Select
        // label="Select Exam"
        value={selectedExamId}
        onChange={(e) => setSelectedExamId(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        {examsData?.map((exam) => (
            <MenuItem key={exam.examId} value={exam.examId}>
              {exam.examName}
            </MenuItem>
          ))}
      </Select>
      </Grid>
      {/* Question Type, Subject, Topic*/}
      <Grid item xs={8}>
        <Grid container spacing={2}>
          <Grid item>
            <Typography mb={1}>Question Type</Typography>
            <Select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
              {questionData?.questionTypes?.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.value}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            <Typography mb={1}>Subject</Typography>
            <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {questionData?.questionSubjects?.map((_subject) => (
                <MenuItem key={_subject.value} value={_subject.value}>
                  {_subject.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            <Typography mb={1}>Topic/section</Typography>
            <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
              {questionData?.questionTopics?.map((_topic) => (
                <MenuItem key={_topic.value} value={_topic.value}>
                  {_topic.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Grid>

      {/* Input Question, Answer */}
      <Grid item xs={12} sm={8} pr={2}>
        {/* Qustion */}
        <Typography>Add Question</Typography>

        <Grid mt={1}>
          <ReactQuill
            theme="snow"
            value={question}
            onChange={(e) => setQuestion(e)}
            placeholder="Enter the question text here..."
            className={mode === "light" ? "quill-light" : "quill-dark"}
          />
          {/* </Box> */}
          {questionError && 
            <div style={{ color: '#FA896B', marginTop: '5px', fontSize:'0.75rem'}}>
              Please Add Question.
            </div>}
        </Grid>

        <Typography mb={1} mt={3}>Add Answer</Typography>

        {/* Answer Section */}
        <Grid mb={2}>
          {/* MultiChoice*/}
          {questionType === "Multichoice" && (
            <>
              {multiChoiceOptions.map((option, index) => (
                <Grid item xs={12} key={index}>
                  <TextField
                    label={`Option ${index + 1}`}
                    value={option.optionText}
                    onChange={(e) => handleMultiChoiceOptionChange(index, e.target.value)}
                    fullWidth
                    placeholder="Enter answer text here"
                    error={error && !option.optionText.trim()} 
                    helperText={
                      error && !option.optionText.trim()
                        ? "This field cannot be empty"
                        : ""
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={option.isCorrect}
                        onChange={() => handleMultiChoiceCorrectChange(index)}
                      />
                    }
                    label="Is Correct"
                  />
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleMultiDleteOption(index)}
                    style={{ marginLeft: '10px' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  color="primary"
                  onClick={handleMultiChoiceAddOption}
                >
                  Add Option
                </Button>
              </Grid>
            </>
          )}

          {/* True/False*/}
          {questionType === "TrueFalse" && (
            <RadioGroup 
              row 
              value={selectedOneValue}
              onChange={handleOneChange}
              >
              <FormControlLabel value="True" control={<Radio />} label="True" />
              <FormControlLabel value="False" control={<Radio />} label="False" />
            </RadioGroup>
          )}

          {/* Single Word*/}
          {questionType === "SingleWord" && (
            <>
              {singleWordAnswers.map((answer, index) => (
                <Grid container alignItems="center" spacing={1} key={index}>
                  <Grid item xs={11}>
                    <TextField
                      // key={index}
                      variant="outlined"
                      placeholder={`Answer ${index + 1}`}
                      label={`Answer ${index + 1}`}
                      value={answer}
                      onChange={(e) => handleSingleWordInputChange(index, e.target.value)}
                      fullWidth
                      style={{ marginBottom: '10px' }}
                      error={singleWordError && !answer.trim()}
                      helperText={
                        singleWordError && !answer.trim()
                          ? "This field cannot be empty"
                          : ""
                      }
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteSingleWord(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addSingleWordNewInput}
                >Add More</Button>
            </>
          )}

          {/* Essay*/}
          {questionType === "Essay" && (
            <TextField
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              placeholder="Write your answer here..."
              label="Write your answer here..."
              value={essayAnswer}
              onChange={handleEssayChange}
              error={essayError}
              helperText={essayError ? "This field cannot be empty" : ""}
              InputProps={{
                inputComponent: TextareaAutosize,
                inputProps: {
                  minRows: 8,
                  maxRows: 15,
                },
              }}
            />
          )}
        </Grid>
      </Grid>

      {/* Difficulty and Mark Section */}
      <Grid item xs={12} sm={4} pl={2}>
        <DashboardCard>
          <Typography>Difficulty Level</Typography>
          <Slider
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            min={1}
            max={3}
            step={1}
            marks={[
              { value: 1 },
              { value: 2 },
              { value: 3 },
            ]}
            valueLabelDisplay="auto"
            sx={{
              height: '10px',
              // '& .MuiSlider-track': {
              //   background: 'linear-gradient(90deg, #ff5722 0%, #1a237e 100%)',
              // },
              // '& .MuiSlider-thumb': {
              //   backgroundColor: '#ff4081',
              //   border: '4px solid #ff4081',
              //   width: '20px',
              //   height: '20px',
              //   '&:hover': {
              //     backgroundColor: '#f50057',
              //     borderColor: '#f50057',
              //   },
              // },
              // '& .MuiSlider-rail': {
              //   backgroundColor: '#3f51b5',
              // },
            }}
          />
          <Typography mb={2}>Mark</Typography>
          <TextField
            label="Mark"
            type="number"
            value={mark}
            onChange={(e) => setMark(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <Typography mt={2} mb={2}>Negative Mark</Typography>
          <TextField
            label="Negative Mark"
            type="number"
            value={negativeMark}
            onChange={(e) => setNegativeMark(e.target.value)}
            variant="outlined"
            fullWidth
          />
        </DashboardCard>
      </Grid>
    </Grid>
    
    {/* Buttons Section */}
    <Grid item xs={12} mt={2}>
      <Grid container spacing={2} justifyContent="flex-end">
        <Grid item>
          <Button 
            variant="outlined"
            startIcon={<CancelIcon />}
            color="secondary"
            onClick={handleCancel}
            >
              Cancel</Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            >Save</Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            color="success"
            onClick={handlePublish}
          >Publish</Button>
        </Grid>
      </Grid>
    </Grid>
  </div>
  );
};

export default AddQuestionForm;
