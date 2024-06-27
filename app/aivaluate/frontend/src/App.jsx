import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import PrivateRouteAdmin from './SessionCheck/PrivateRouteAdmin';
import PrivateRouteEval from './SessionCheck/PrivateRouteEval';
import PrivateRouteStu from './SessionCheck/PrivateRouteStudent';
import Account from './pageComponents/Account';
import AdminLogin from './pageComponents/AdminLogin';
import AssignmentFeedback from './pageComponents/AssignmentFeedback';
import CourseHome from './pageComponents/CourseHome';
import CreateAssignment from './pageComponents/CreateAssignment';
import CreateCourse from './pageComponents/CreateCourse';
import Dashboard from './pageComponents/Dashboard';
import DashboardEval from './pageComponents/DashboardEval';
import EvalLogin from './pageComponents/EvalLogin';
import EvalViewSubmissions from './pageComponents/EvalViewSubmissions';
import EvaluatorGrades from './pageComponents/EvaluatorGrades';
import EvaluatorManager from './pageComponents/EvaluatorManager';
import ForgotPassword from './pageComponents/ForgotPassword';
import GradingAssignments from './pageComponents/GradingAssignments';
import HelpPage from './pageComponents/HelpPage';
import JoinCourse from './pageComponents/JoinCourse';
import Login from './pageComponents/Login';
import People from './pageComponents/People';
import Rubrics from './pageComponents/Rubrics';
import Signup from './pageComponents/Signup';
import SignupAdmin from './pageComponents/SignupAdmin';
import StudentManager from './pageComponents/StudentManager';
import StudentViewSubmissions from './pageComponents/StudentViewSubmissions';
import CreateAccPT from './pageComponents/CreateAccPT';
import CourseHome from './pageComponents/CourseHome';
import AdminHome from './pageComponents/AdminHome';
import CreateAssignment from './pageComponents/CreateAssignment';
const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* No session validation routes required */}
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/stu/login" element={<Login />} />
          <Route path="/stu/signup" element={<Signup />} />
          <Route path ="/forgotpassword" element={<ForgotPassword />} />
          <Route path ="/people" element={<People />} />
          <Route path = "/createcourse" element={<CreateCourse />} />
          <Route path = "/studentviewsubmissions" element={<StudentViewSubmissions />} />
          <Route path="/global/login" element={<AdminProfLogin />} />
          <Route path="/eval/gradingassignments" element={<GradingAssignments />} />
          <Route path="eval/dashboard" element={<DashboardEval />} />
          <Route path="/eval/submissions" element={<EvalViewSubmissions />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/people" element={<People />} />
          <Route path="/createcourse" element={<CreateCourse />} />
          <Route path="/studentviewsubmissions" element={<StudentViewSubmissions />} />
          <Route path="/admin-proflogin" element={<AdminProfLogin />} />
          <Route path="/coursehome/:courseId" element={<CourseHome />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="eval/dashboard" element={<DashboardEval />} />
          <Route path="/adminhome" element={<AdminHome />} />
          <Route path="/admin/create-assignment" element={<CreateAssignment />} />
          <Route path="eval/rubrics" element={<Rubrics />} />
          <Route path="/stu/grades" element={<StudentGrades />} />
          <Route path="/eval/grades" element={<EvaluatorGrades />} />
          <Route path="/eval/gradingassignments" element={<GradingAssignments />} />
          <Route path="eval/dashboard" element={<DashboardEval />} />
          <Route path="/admin/CreateAcc" element={<CreateAccPT/>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/eval/login" element={<EvalLogin />} />
          <Route path="/admin/signup" element={<SignupAdmin />} />
          {/* Session validation routes for student */}
          <Route path="/stu/dashboard" element={<PrivateRouteStu element={Dashboard} />} />
          <Route path="/stu/assignment-feedback" element={<PrivateRouteStu element={AssignmentFeedback} />} /> {/* this was called AssignmentOverview but I changed the name cause that made no sense */}
          <Route path="/stu/account" element={<PrivateRouteStu element={Account} />} />
          <Route path="/stu/help" element={<PrivateRouteStu element={HelpPage} />} />
          <Route path="/stu/join-course" element={<PrivateRouteStu element={JoinCourse} />} />
          <Route path="/stu/people" element={<PrivateRouteStu element={People} />} />
          <Route path="/stu/create-course" element={<PrivateRouteStu element={CreateCourse} />} />
          <Route path="/stu/submissions" element={<PrivateRouteStu element={StudentViewSubmissions} />} />
          {/* Session validation routes for admin */}
          <Route path="/admin/evaluatormanager" element={<PrivateRouteAdmin element={EvaluatorManager} />} />
          <Route path="/admin/studentmanager" element={<PrivateRouteAdmin element={StudentManager} />} />
          
          {/* Session validation routes for evaluators */}
          <Route path="/eval/grading" element={<PrivateRouteEval element={GradingAssignments} />} />
          <Route path="/eval/dashboard" element={<PrivateRouteEval element={DashboardEval} />} />
          <Route path="/eval/submissions" element={<PrivateRouteEval element={EvalViewSubmissions} />} />
          <Route path="/eval/createcourse" element={<PrivateRouteEval element={CreateCourse} />} />
          <Route path="/eval/coursehome/:courseId" element={<PrivateRouteEval element={CourseHome} />} />
          <Route path="/eval/create-assignment" element={<PrivateRouteEval element={CreateAssignment} />} />
          <Route path="/eval/rubrics" element={<PrivateRouteEval element={Rubrics} />} />
          <Route path="/eval/grades" element={<PrivateRouteEval element={EvaluatorGrades} />} />
          <Route path="/eval/gradingassignments" element={<PrivateRouteEval element={GradingAssignments} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;