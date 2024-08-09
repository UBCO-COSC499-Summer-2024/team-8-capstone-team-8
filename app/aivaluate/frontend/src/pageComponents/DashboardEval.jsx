import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CourseCards.css';
import '../Dashboard.css';
import '../GeneralStyling.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import CourseCards from '../components/CourseCards';

const DashboardEval = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [accountId, setAccountId] = useState("");
  
  var notification = false;
  var notificationText = "YOU HAVE NO NEW NOTIFICATIONS...";

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log(`menu open - ${!menuOpen}`); 
  };

  if (notification === true) {
    notificationText = "YOU HAVE NEW NOTIFICATIONS!";
  }

  useEffect(() => {
    const fetchStudentData = async () => {
        try {
            const { data: { instructorId } } = await axios.get('http://localhost:5173/eval-api/instructor/me', {
                withCredentials: true
            });
            setAccountId(instructorId);

            const firstNameResponse = await axios.get(`http://localhost:5173/eval-api/instructor/${instructorId}/firstName`);
            setFirstName(firstNameResponse.data.firstName);
        } catch (error) {
            console.error('There was an error fetching the instructor data:', error);
        }
    };
    fetchStudentData();
}, []);

  return (
    <div>
      <div className="message-container">
        <div className="notification-container">
        </div>
        <h1>Your courses...</h1>
        
      </div>
      <AIvaluateNavBarEval navBarText={`Hello ${firstName}`} tab="home" />
      <CourseCards page="prof/dashboard"/>
    </div>
  );
};

export default DashboardEval;
