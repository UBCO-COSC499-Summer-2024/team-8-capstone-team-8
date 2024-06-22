import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CourseCards.css';
import '../Dashboard.css';
import '../GeneralStyling.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import CourseCards from '../components/CourseCards';

const DashboardEval = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  var notification = false;
  var notificationText = "YOU HAVE NO NEW NOTIFICATIONS...";

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log(`menu open - ${!menuOpen}`); 
  };

  if (notification === true) {
    notificationText = "YOU HAVE NEW NOTIFICATIONS!";
  }

  return (
    <div>
      <div className="secondary-colorbg message-container">
        <div className="notification-container">
        <p className="notificationBubble">{'\u2B24'} </p><p className="notification-text">{notificationText}</p>
        </div>
        <h1>Here are your courses...</h1>
        
      </div>
      <AIvaluateNavBar navBarText='Hello Colton' tab="home" />
      <CourseCards page="prof/dashboard"/>
    </div>
  );
};

export default DashboardEval;
