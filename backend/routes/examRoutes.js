import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createExam, getExams } from "../controllers/examController.js";
import {
  createQuestion,
  editQuestion,
  deleteQuestion,
  getQuestionsByExamId,
  getQuestionsByExamQuestionId,
  scoreAnswer,
} from "../controllers/quesController.js";
import {
  getCheatingLogsByExamId,
  saveCheatingLog,
} from "../controllers/cheatingLogController.js";

const examRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Exam management and question handling
 */

/**
 * @swagger
 * /api/exams/exam:
 *   get:
 *     summary: Get all exams
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 *   post:
 *     summary: Create a new exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamInput'
 *     responses:
 *       201:
 *         description: Exam created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 *       400:
 *         description: Invalid exam data
 */
examRoutes.route("/")
  .get(protect, getExams)
  .post(protect, createExam);

/**
 * @swagger
 * /api/exams/exam/questions:
 *   post:
 *     summary: Add a new question to an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionInput'
 *     responses:
 *       201:
 *         description: Question added successfully
 *       400:
 *         description: Invalid question data
 */
examRoutes.route("/questions").post(protect, createQuestion);

/**
 * @swagger
 * /api/exams/exam/questions/edit:
 *   post:
 *     summary: Edit an existing question
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionInput'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Invalid question data
 */
examRoutes.route("/questions/edit").post(protect, editQuestion);

/**
 * @swagger
 * /api/exams/questions/{examId}:
 *   get:
 *     summary: Get all questions for a specific exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the exam
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       404:
 *         description: Exam not found
 */
examRoutes.route("/questions/:examId").get(protect, getQuestionsByExamId);

/**
 * @swagger
 * /api/exams/questions/{examId}/{questionId}:
 *   get:
 *     summary: Get a specific question from an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the exam
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the question
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 */
examRoutes.route("/questions/:examId/:questionId").get(protect, getQuestionsByExamQuestionId);

/**
 * @swagger
 * /api/exams/questions/delete/{questionId}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the question to delete
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */
examRoutes.route("/questions/delete/:questionId").delete(protect, deleteQuestion);

/**
 * @swagger
 * /api/exams/cheatingLogs/{examId}:
 *   get:
 *     summary: Get cheating logs for a specific exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the exam
 *     responses:
 *       200:
 *         description: Cheating logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CheatingLog'
 */
examRoutes.route("/cheatingLogs/:examId").get(protect, getCheatingLogsByExamId);

/**
 * @swagger
 * /api/exams/cheatingLogs/:
 *   post:
 *     summary: Save a cheating log entry
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheatingLogInput'
 *     responses:
 *       201:
 *         description: Cheating log saved successfully
 *       400:
 *         description: Invalid cheating log data
 */
examRoutes.route("/cheatingLogs/").post(protect, saveCheatingLog);

/**
 * @swagger
 * /api/exams/exam/submit:
 *   post:
 *     summary: Submit an answer for scoring
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerInput'
 *     responses:
 *       200:
 *         description: Answer scored successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Score'
 *       400:
 *         description: Invalid answer data
 */
examRoutes.route("/exam/submit").post(protect, scoreAnswer);

/**
 * @swagger
 * components:
 *   schemas:
 *     Exam:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the exam
 *         name:
 *           type: string
 *           description: The name of the exam
 *         description:
 *           type: string
 *           description: A description of the exam
 *         duration:
 *           type: number
 *           description: Duration of the exam in minutes
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: When the exam starts
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: When the exam ends
 *         isActive:
 *           type: boolean
 *           description: Whether the exam is currently active
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the exam
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ExamInput:
 *       type: object
 *       required:
 *         - name
 *         - startTime
 *         - endTime
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         duration:
 *           type: number
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         examId:
 *           type: string
 *         questionText:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: string
 *         correctAnswer:
 *           type: string
 *         marks:
 *           type: number
 *     QuestionInput:
 *       type: object
 *       required:
 *         - examId
 *         - questionText
 *         - options
 *         - correctAnswer
 *         - marks
 *       properties:
 *         examId:
 *           type: string
 *         questionText:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: string
 *         correctAnswer:
 *           type: string
 *         marks:
 *           type: number
 *     CheatingLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         examId:
 *           type: string
 *         userId:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         eventType:
 *           type: string
 *         description:
 *           type: string
 *     CheatingLogInput:
 *       type: object
 *       required:
 *         - examId
 *         - eventType
 *       properties:
 *         examId:
 *           type: string
 *         eventType:
 *           type: string
 *         description:
 *           type: string
 *     AnswerInput:
 *       type: object
 *       required:
 *         - examId
 *         - questionId
 *         - answer
 *       properties:
 *         examId:
 *           type: string
 *         questionId:
 *           type: string
 *         answer:
 *           type: string
 *     Score:
 *       type: object
 *       properties:
 *         isCorrect:
 *           type: boolean
 *         score:
 *           type: number
 *         feedback:
 *           type: string
 */

export default examRoutes;
