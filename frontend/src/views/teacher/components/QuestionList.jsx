import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  Select,
  MenuItem,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Fab,
  Modal,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from "@mui/icons-material/Edit";

import { useGetExamsQuery, useGetQuestionsQuery, useDeleteQuestionMutation } from 'src/slices/examApiSlice';
import { toast } from 'react-toastify';

const QuestionList = () => {
  const [selectedExamId, setSelectedExamId] = useState('');

  const { data: examsData } = useGetExamsQuery();

  const [deleteQuestion] = useDeleteQuestionMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (examsData && examsData.length > 0) {
      setSelectedExamId(examsData[0].examId);
    }
  }, [examsData]);
  let { data, isLoading, refetch } = useGetQuestionsQuery(selectedExamId);
  const [questions, setQuestions] = useState([]);
  // Edit
  const handleEditQuestion = (questionId) => {
    navigate(`/edit-exam/${selectedExamId}/${questionId}`);
  };

  const [open, setOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const handleOpen = (id) => {
    setSelectedQuestionId(id);
    setOpen(true);
  }
  const handleClose = () => setOpen(false);
  const handleDelete = async (id) => {
    const res = await deleteQuestion(id).unwrap();
    if(res.success) {
      toast.success(res.message);
      const updatedData = questions.filter(dt => dt._id !== id)
      setQuestions(updatedData);
    } else {
      toast.error(res.error ? res.error : "Error")
    }
    setOpen(false);
  };
  useEffect(() => {
    if (data) {
      setQuestions(data);
    }
    refetch();
  }, [data, refetch]);

  return (<>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Select
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
      {isLoading ? (
        <CircularProgress />
        ) : questions.length === 0 ? (
          <Typography sx={{ padding: 2}}>No questions available to edit.</Typography>
        ) :
        questions.map(ques => (
          <Card 
            sx={{
              width: "100%",
              position: "relative",
              padding: 2,
              boxSizing: "border-box",
              margin: 1,
              }}
            key={ques._id}
          >
          <CardContent sx={{width: '100%'}}>
              <Typography variant="h5">
                {ques.questionType}
              </Typography>
      
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  WebkitLineClamp: 2, // 🔹 Limit text to 2 lines
                  textOverflow: "ellipsis",
                  maxWidth: "500px",  // 🔹 Ensures text doesn't overflow card
                  maxHeight: "3rem",
                  boxSizing: "border-box",
                  whiteSpace: "normal",
                  transition: "max-height 0.3s ease"
                }}
              >
                <p dangerouslySetInnerHTML={{__html: ques.question}}></p>
              </Typography>
              {/* <ListItemText
                primary={<span dangerouslySetInnerHTML={{ __html: ques.question }} />}
              /> */}
            </CardContent>
      
            <Box sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                gap: 2,
              }}
            >
              <Fab
                color="error"
                size="small"
                aria-label="delete"
                onClick={() => handleOpen(ques._id)}
                >
                <DeleteIcon />
              </Fab>
              <Fab
                color="primary"
                size="small"
                aria-label="edit"
                onClick={() => handleEditQuestion(ques._id)}
                >
                <EditIcon />
              </Fab>
            </Box>
          </Card>
      ))}
    </Grid>
    <Modal open={open} onClose={handleClose}>
      <Box 
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2
        }}
      >
        <Typography variant="h6">Confirm Deletion</Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Are you sure you want to delete this question?
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={() => handleDelete(selectedQuestionId)} color="error">Delete</Button>
        </Box>
      </Box>
    </Modal>
  </>
  )};

export default QuestionList;
