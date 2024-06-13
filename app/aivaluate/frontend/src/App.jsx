import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AssignmentOverview from './pageComponents/AssignmentOverview';
import Dashboard from './pageComponents/Dashboard';
import Login from './pageComponents/Login';
import Signup from './pageComponents/Signup';
import DesignAssignment from './pageComponents/DesignAssignment';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path ="/dashboard" element={<Dashboard />} />
          <Route path ="/AssignmentOverview" element={<AssignmentOverview />} />
          <Route path ="/designAssignment" element={<DesignAssignment />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
