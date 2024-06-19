import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Account from './pageComponents/Account';
import AssignmentOverview from './pageComponents/AssignmentOverview';
import Dashboard from './pageComponents/Dashboard';
import JoinCourse from './pageComponents/JoinCourse';
import ForgotPassword from './pageComponents/ForgotPassword';
import Login from './pageComponents/Login';
import Signup from './pageComponents/Signup';
import People from './pageComponents/People';
import CreateCourse from './pageComponents/CreateCourse';
import HelpPage from './pageComponents/HelpPage';
import StudentViewSubmissions from './pageComponents/StudentViewSubmissions';
import AdminProfLogin from './pageComponents/AdminProfLogin';
import CourseHome from './pageComponents/CourseHome';
import AllSubmissions from './pageComponents/AllSubmissions';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path ="/dashboard" element={<Dashboard />} />
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
          <Route path="/AllSubmissions" element={<AllSubmissions/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
