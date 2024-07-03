import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Account from './pageComponents/Account';
import AdminProfLogin from './pageComponents/AdminProfLogin';
import AssignmentOverview from './pageComponents/AssignmentOverview';
import CourseHome from './pageComponents/CourseHome';
import CreateCourse from './pageComponents/CreateCourse';
import Dashboard from './pageComponents/Dashboard';
import ForgotPassword from './pageComponents/ForgotPassword';
import HelpPage from './pageComponents/HelpPage';
import JoinCourse from './pageComponents/JoinCourse';
import Login from './pageComponents/Login';
import People from './pageComponents/People';
import Signup from './pageComponents/Signup';
import StudentViewSubmissions from './pageComponents/StudentViewSubmissions';
import Logout from './sessionCheck/Logout';
import PrivateRoute from './sessionCheck/PrivateRoute';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/stu/login" element={<Login />} />
          <Route path="/stu/signup" element={<Signup />} />
          <Route path="/stu/logout" element={<Logout />} />
          {/* <Route path ="/dashboard" element={<Dashboard />} component={PrivateRoute}/> */}
          <Route path="/stu/dashboard" element={<PrivateRoute element={Dashboard} />} />
          <Route path ="/assignmentoverview" element={<AssignmentOverview />} />
          <Route path ="/account" element={<Account />} />
          <Route path ="/help" element={<HelpPage />} />
          <Route path="/joincourse" element={<JoinCourse />} />
          <Route path ="/forgotpassword" element={<ForgotPassword />} />
          <Route path ="/People" element={<People />} />
          <Route path = "/createcourse" element={<CreateCourse />} />
          <Route path = "/studentviewsubmissions" element={<StudentViewSubmissions />} />
          <Route path="/admin-proflogin" element={<AdminProfLogin />} />
          <Route path="/CourseHome" element={<CourseHome />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;