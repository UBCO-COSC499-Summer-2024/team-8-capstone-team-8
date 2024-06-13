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

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assignmentoverview" element={<AssignmentOverview />} />
          <Route path="/account" element={<Account />} />
          <Route path="/joincourse" element={<JoinCourse />} />
          <Route path ="/forgotpassword" element={<ForgotPassword />} />
          <Route path ="/People" element={<People />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
