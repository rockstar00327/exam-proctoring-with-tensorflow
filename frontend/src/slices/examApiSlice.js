import { apiSlice } from './apiSlice';

// Define the base URL for the exams API
const EXAMS_URL = '/api/exams';

// Inject endpoints for the exam slice
export const examApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all exams
    getExams: builder.query({
      query: () => ({
        url: EXAMS_URL,
        method: 'GET',
      }),
    }),
    // Create a new exam
    createExam: builder.mutation({
      query: (data) => ({
        url: EXAMS_URL,
        method: 'POST',
        body: data,
      }),
    }),
    // Get questions for a specific exam
    getQuestions: builder.query({
      query: (examId) => ({
        url: `${EXAMS_URL}/questions/${examId}`,
        method: 'GET',
      }),
    }),
    // Get questions for a specific exam and question Id
    getQuestionById: builder.query({
      query: ({examId, questionId}) => ({
        url: `${EXAMS_URL}/questions/${examId}/${questionId}`,
        method: 'GET',
      }),
    }),
    // Create a new question for an exam
    createQuestion: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}/questions`,
        method: 'POST',
        body: data,
      }),
    }),
    // Edit question for an exam
    editQuestion: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}/questions/edit`,
        method: 'POST',
        body: data,
      }),
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `${EXAMS_URL}/questions/delete/${id}`,
        method: 'DELETE',
      }),
    }),
    // Submit a test.
    submitTest: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}/exam/submit`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export the generated hooks for each endpoint
export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useGetQuestionsQuery,
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useEditQuestionMutation,
  useDeleteQuestionMutation,
  useSubmitTestMutation,
} = examApiSlice;
