// import React from 'react';
import '../DesignAssignment.css'; // Adjust the path if needed
import '../styles.css'; // Adjust the path if needed
import SideMenuBar from '../components/SideMenuBar';
import AIvaluateNavBar from '../components/AIvaluateNavBar';

const AssignmentsPage = () => {
  return (
    <div>
      <AIvaluateNavBar navBarText='COSC 499 - Software Engineering Capstone' />
      <SideMenuBar tab='assignments' />
    <div className="assignments-container">
      
      <main className="contentt">
        <div className="dashboard">
          <button className="primary-button">+ Create new assignment</button>
          <button className="secondary-button">Browse my assignments</button>
        </div>
        <div className="course-card">
          <h3>Lab 1</h3>
          <p>Posted</p>
        </div>
        <div className="course-card">
          <h3>Lab 2</h3>
          <p>Posted</p>
        </div>
        <div className="course-card">
          <h3>Lab 3</h3>
          <p>Not Yet Active</p>
        </div>
        <div className="course-card">
          <h3>Assignment 1</h3>
          <p>Not Yet Active</p>
        </div>
      </main>
    </div>
    </div>
  );
};

export default AssignmentsPage;

