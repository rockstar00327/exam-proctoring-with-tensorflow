import React from 'react';
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';

/* Import Components */
import PrivateRoute from "src/views/authentication/PrivateRoute";
import TeacherRoute from "src/views/authentication/TeacherRoute";
import FullLayout from "../layouts/full/FullLayout";
import ExamLayout from "../layouts/full/ExamLayout";
import BlankLayout from "../layouts/blank/BlankLayout";

/* Pages */
import ExamPage from "../views/student/ExamPage";
import SamplePage from "../views/sample-page/SamplePage";
import Success from "../views/Success";
import ResultPage from "../views/student/ResultPage";
import ExamDetails from "../views/student/ExamDetails";
import TestPage from "../views/student/TestPage";
import CreateExamPage from "../views/teacher/CreateExamPage";
import AddQuestions from "../views/teacher/AddQuestions";
import EditQuestions from "../views/teacher/EditQuestions";
import EditQuestion from "../views/teacher/EditQuestion";
import ExamLogPage from "../views/teacher/ExamLogPage";
import UserAccount from "../views/authentication/UserAccount";
import Profile from "../views/authentication/Profile";
import Register from "../views/authentication/Register";
import Login from "../views/authentication/Login";
import Signup from "../views/authentication/Signup";
// LinkedIn authentication removed - will be replaced with Clerk
import Error from "../views/authentication/Error";

const qRouter = createBrowserRouter([
  {
    path: '',
    element: <PrivateRoute />, // Protects all child routes
    children: [
      {
        path: '/',
        element: <FullLayout />, // Main layout
        children: [
          { index: true, element: <Navigate to="/dashboard" /> }, // Redirect to dashboard
          { path: 'dashboard', element: <ExamPage /> },
          { path: 'sample-page', element: <SamplePage /> },
          { path: 'success', element: <Success /> },
          { path: 'exam', element: <ExamPage /> },
          { path: 'result', element: <ResultPage /> },
          {
            path: '',
            element: <TeacherRoute />, // Teacher-specific routes
            children: [
              { path: 'create-exam', element: <CreateExamPage /> },
              { path: 'add-questions', element: <AddQuestions /> },
              { path: 'exam-log', element: <ExamLogPage /> },
              { path: 'edit-exam', element: <EditQuestions />},
              { path: 'edit-exam/:examId/:questionId', element: <EditQuestion />},
            ],
          },
        ],
      },
      {
        path: '/',
        element: <ExamLayout />, // Exam-specific layout
        children: [
          { path: 'exam/:examId', element: <ExamDetails /> },
          { path: 'exam/:examId/:testId', element: <TestPage /> },
        ],
      },
    ],
  },
  {
    path: '/user',
    element: <FullLayout />, // User layout
    children: [
      { path: 'account', element: <UserAccount /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />, // Authentication layout
    children: [
      { path: '404', element: <Error /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      // LinkedIn callback route removed - will be replaced with Clerk
    ],
  },
]);

const MERNRouter = () => {
  return <RouterProvider router={qRouter} />;
};

export default MERNRouter;