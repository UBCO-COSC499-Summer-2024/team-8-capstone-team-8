import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import PrivateRouteAdmin from './SessionCheck/PrivateRouteAdmin';
import PrivateRouteEval from './SessionCheck/PrivateRouteEval';
import PrivateRouteStu from './SessionCheck/PrivateRouteStudent';
import Account from './pageComponents/Account';
import AdminLogin from './pageComponents/AdminLogin';
import AssignmentOverview from './pageComponents/AssignmentOverview';
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
import SelectedAssignment from './pageComponents/SelectedAssignment';
import Signup from './pageComponents/Signup';
import SignupAdmin from './pageComponents/SignupAdmin';
import StudentGrades from './pageComponents/StudentGrades';
import StudentManager from './pageComponents/StudentManager';
import StudentViewSubmissions from './pageComponents/StudentViewSubmissions';

import StuAssignmentSubmissionpage from './pageComponents/StuAssignmentSubmissionpage';

import Students from './pageComponents/Students';
import AssignmentProf from './pageComponents/AssignmentProf';
import BrowseAllAssignmentsEval from './pageComponents/BrowseAllAssignmentsEval';


const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* No session validation routes required */}
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assignmentoverview" element={<AssignmentOverview />} />
          <Route path="/account" element={<Account />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path ="/dashboard" element={<Dashboard />} />
          <Route path ="/admin/evaluatormanager" element={<EvaluatorManager />} />
          <Route path ="/admin/studentmanager" element={<StudentManager />} />
          <Route path ="/assignmentoverview" element={<AssignmentOverview />} />
          <Route path ="/account" element={<Account />} />
          <Route path ="/help" element={<HelpPage />} />
          <Route path="/joincourse" element={<JoinCourse />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/people" element={<People />} />
          <Route path="/createcourse" element={<CreateCourse />} />
          <Route path="/studentviewsubmissions" element={<StudentViewSubmissions />} />
          <Route path="/admin-proflogin" element={<AdminProfLogin />} />
          <Route path="/coursehome" element={<CourseHome />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="/CourseHome" element={<CourseHome />} />
          <Route path="eval/dashboard" element={<DashboardEval />} />
          <Route path="/stuassignmentsubmissionpage" element={<StuAssignmentSubmissionpage/>} />
          
        
          
=
          <Route path="/stu/login" element={<Login />} />
          <Route path="/stu/signup" element={<Signup />} />
          <Route path ="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/eval/login" element={<EvalLogin />} />
          <Route path="/admin/signup" element={<SignupAdmin />} />
          {/* Session validation routes for student */}
          <Route path="/stu/dashboard" element={<PrivateRouteStu element={Dashboard} />} />
          <Route path="/stu/assignment" element={<PrivateRouteStu element={AssignmentOverview} />} /> {/* this was called AssignmentOverview but I changed the name cause that made no sense */}
          <Route path="/stu/account" element={<PrivateRouteStu element={Account} />} />
          <Route path="/stu/help" element={<PrivateRouteStu element={HelpPage} />} />
          <Route path="/stu/join-course" element={<PrivateRouteStu element={JoinCourse} />} />
          <Route path="/stu/people" element={<PrivateRouteStu element={People} />} />
          <Route path="/stu/grades" element={<PrivateRouteStu element={StudentGrades} />} />
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
          <Route path="/eval/students" element={<PrivateRouteEval element={Students} />} />
          <Route path="/eval/grades" element={<PrivateRouteEval element={EvaluatorGrades} />} />
          <Route path="/eval/selected/assignment" element={<PrivateRouteEval element={SelectedAssignment} />} />
          <Route path="/eval/assignments" element={<PrivateRouteEval element={AssignmentProf} />} />
          <Route path="/eval/browse/assignment" element={<PrivateRouteEval element={BrowseAllAssignmentsEval} />} />
>
          
        </Routes>
      </div>
    </Router>
  );
};

export default App;