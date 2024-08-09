import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CourseCards.css';
import '../Dashboard.css';
import '../GeneralStyling.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import CourseCards from '../components/CourseCards';

const Dashboard = () => {
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
            const { data: { studentId } } = await axios.get('http://localhost:5173/stu-api/student/me', {
                withCredentials: true
            });
            setAccountId(studentId);

            const firstNameResponse = await axios.get(`http://localhost:5173/stu-api/student/${studentId}/firstName`);
            setFirstName(firstNameResponse.data.firstName);
        } catch (error) {
            console.error('There was an error fetching the student data:', error);
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
      <AIvaluateNavBar navBarText={`Hello ${firstName}`} tab="home" />
      <CourseCards page="stu/dashboard"/>
    </div>
  );
};

export default Dashboard;
