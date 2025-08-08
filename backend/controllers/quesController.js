import asyncHandler from "express-async-handler";
import Question from "../models/quesModel.js";
import Exam from "./../models/examModel.js";
import {
  ScoreMultiChoice,
  ScoreTrueFalse,
  ScoreSingleWord,
  ScoreEssay
} from "../score/score.js";

const getQuestionsByExamId = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  // console.log("Question Exam id ", examId);

  if (!examId) {
    return res.status(400).json({
      success: false,
      error: "examId is missing or invalid"
    });
  }

  const questions = await Question.find({ examId });

  res.status(200).json(questions);
});

const getQuestionsByExamQuestionId = asyncHandler(async (req, res) => {
  const { examId, questionId } = req.params;
  if (!examId && !questionId) {
    return res.status(400).json({
      success: false,
      error: "examId or questionId is missing or invalid"
    });
  }

  const questionById = await Question.findOne({ examId, _id: questionId });

  res.status(200).json(questionById);
});

const createQuestion = asyncHandler(async (req, res) => {
  console.log(`Creating questions...`);
  const { 
    examId,
    _question,
    _questionType,
    _subject,
    _topic,
    _difficulty,
    _multiOptions,
    _selectedOneValue,
    _singleWordAnswers,
    _essayAnswer,
    _isPublished,
    _mark,
    _negativeMark,
   } = req.body;
  if (!examId) {
    return res.status(400).json({
      success: false,
      error: "examId is missing or invalid",
    });
  }

  const newQuestion = new Question({
    examId,
    question: _question,
    questionType: _questionType,
    subject: _subject,
    topic: _topic,
    difficulty: _difficulty,
    isPublished: _isPublished,
    mark: _mark,
    negativeMark: _negativeMark,
  });
  if(_questionType === 'Multichoice') {
    newQuestion.multiOptions = _multiOptions;
  };
  if(_questionType === 'TrueFalse') {
    newQuestion.selectedOneValue = _selectedOneValue;
  };
  if(_questionType === 'SingleWord') {
    newQuestion.singleWordAnswers = _singleWordAnswers;
  };
  if(_questionType === 'Essay') {
    newQuestion.essay = _essayAnswer;
  };

  const questions = await Question.find({examId});
  const exam = await Exam.findOne({examId})
  if(questions.length >= exam.totalQuestions) {
    console.log(`Error while crating questinos. You have reached the maximum limit of ${questions.length} questions.`);
    res.json({
      success: false,
      error: `You have reached the maximum limit of ${questions.length} questions.`
    })
  } else {

    const createdQuestion = await newQuestion.save();

    if (createdQuestion) {
      console.log(`Questions successfully!`);
      console.log(`Questions: ${newQuestion}`);
      res.status(201).json({
        success: true, 
        createdQuestion
      });
    } else {
      res.status(400);
      throw new Error("Invalid Question Data");
    }
  }
});

const editQuestion = asyncHandler(async (req, res) => {
  console.log(`Editing question...`)
  try {
    const { questionId, ...updateFields } = req.body; // 🔹 Extract `questionId` and update fields
    if (!questionId) {
      return res.status(400).json({
        success: false,
        error: "questionId is required",
      });
    }
    const _updateFields = {
      question: updateFields._question,
      questionType: updateFields._questionType,
      subject: updateFields._subject,
      topic: updateFields._topic,
      difficulty: updateFields._difficulty,
      singleWordAnswers: updateFields._singleWordAnswers,
      examId: updateFields.examId,
      mark: updateFields._mark,
      negativeMark: updateFields._negativeMark,
      isPublished: updateFields._isPublished,
      multiOptions: updateFields._multiOptions,
      essay: updateFields._essayAnswer,
      selectedOneValue: updateFields._selectedOneValue,
    }
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: _updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedQuestion) {
      console.log(`Error updating question. Question not found!`);
      return res.status(404).json({
        success: false,
        error: "Question not found"
      });
    }
    console.log(`Edited question successfully!`)
    res.json({
      success: true,
      message: "Question updated successfully", 
      updatedQuestion
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
})

const deleteQuestion = asyncHandler(async (req, res) => {
  console.log(`Deleting question...`)
  try {
    const { questionId } = req.params;
    
    if(!questionId) {
      console.log(`Error deleting question. QuestionId is required!`)
      return res.status(400).json({
        success: false,
        error: "questionId is required"
      })
    }

    const deletedQuestion = await Question.findByIdAndDelete(questionId);
    
    if(!deletedQuestion) {
      console.log('Error deleting question. Question not found!')
      return res.status(404).json({
        success: false,
        error: 'Question not found.'
      })
    }
    console.log('Question deleted successfully!')
    res.json({
      success: true,
      message: "Question deleted successfully!"
    })
  } catch {
    console.log(`Internal Server Error!`)
    res.status(500).json({
      success: false,
      error: 'Internal Server Error.'
    })
  }
})

const scoreAnswer = asyncHandler(async (req, res) => {
  console.log(`Scoring answers. Please just a min...`);
  try {
    const answers = req.body.totalAnswers;
    const length = req.body.examInfo.totalQuestions;
    const examId = req.body.examInfo.examId;
    
    // Get all questions for this exam to access correct answers
    const questions = await Question.find({ examId });
    
    let totalScore = 0;
    let result = [];
    
    for (let i = 0; i < length; i++) {
      const question = questions[i];
      const userAnswer = answers[i];
      
      if (!userAnswer || !question) continue;
      
      const weight = userAnswer?.weight || 1;
      let score = 0;
      
      // The user's submitted answer for this question
      const userAnswerPayload = { ...userAnswer };

      // The correct answer data from the database
      const correctAnswerPayload = {
        correctAnswer: question.correctAnswer || [],
        multiOptions: question.multiOptions || [],
        selectedOneValue: question.selectedOneValue,
        singleWordAnswers: question.singleWordAnswers || [],
        essay: question.essay || ''
      };

      // Score based on question type
      if (question.questionType === 'Multichoice') {
        score = ScoreMultiChoice({
          multiChoices: userAnswerPayload.multiChoices || [],
          multiOptions: correctAnswerPayload.multiOptions,
        }) || 0;
      } 
      else if (question.questionType === 'TrueFalse') {
        score = ScoreTrueFalse({
          trueFalseSubmit: userAnswerPayload.trueFalseAnswer,
          correctAnswer: correctAnswerPayload.selectedOneValue,
        }) || 0;
      }
      else if (question.questionType === 'SingleWord') {
        let userWords = userAnswerPayload.singleWords || [];
        // Defensively ensure userWords is an array, as frontend might send a single string
        if (!Array.isArray(userWords)) {
          userWords = [String(userWords)];
        }
        const scorePayload = {
          singleWords: userWords,
          correctAnswer: correctAnswerPayload.singleWordAnswers,
        };
        console.log('--- Sending to ScoreSingleWord ---');
        console.log(JSON.stringify(scorePayload, null, 2));
        score = ScoreSingleWord(scorePayload) || 0;
      }
      else if (question.questionType === 'Essay') {
        const essayScore = await ScoreEssay({
          submitEssay: userAnswerPayload.submitEssay || '',
          correctAnswer: correctAnswerPayload.essay,
        });
        score = essayScore.score || 0;
      }
      
      // Calculate weighted score
      const weightedScore = (score * weight) / 10;
      totalScore += weightedScore;
      
      // Add to results
      result.push({
        question: question.question,
        questionType: question.questionType,
        score: weightedScore,
        isCorrect: score === 10, // Check for a perfect score for correctness
        weight: weight,
        userAnswer: userAnswer,
        correctAnswer: question.questionType === 'Multichoice' ? 
          (question.multiOptions || []).filter(opt => opt.isCorrect).map(opt => opt.optionText) :
          question.questionType === 'TrueFalse' ? question.selectedOneValue :
          question.questionType === 'SingleWord' ? question.singleWordAnswers :
          question.essay
      });
    }
    console.log(`Score: ${totalScore.toFixed(2)}`);
    res.json({
      success: true,
      score: (totalScore).toFixed(2),
      result: result
    });
  } catch {
    console.log('Internal Server Error');
    res.status(500).json({
    success: false,
    error: 'Internal Server Error.'
  })
}
})

export {
  getQuestionsByExamId,
  createQuestion,
  deleteQuestion,
  editQuestion,
  scoreAnswer,
  getQuestionsByExamQuestionId
};
