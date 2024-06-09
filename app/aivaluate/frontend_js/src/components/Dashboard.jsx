import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log(`menu open - ${!menuOpen}`); // Logging state change
  };

  const clickedMenu = {
    color: 'white',
    background: '#4d24d4',
    float: 'right',
    marginBottom: '10px'
  };

  const boostFromTop = {
    marginTop: '120px',
    color: '#4d24d4',
  };

  return (
    <div>
      <header className="header">
        <div className="circle"></div>
        <h1>Hello Colton</h1>
        <div className="menu">
          <button onClick={toggleMenu}>
            &#9776;
          </button>
          <div className={`dropdown ${menuOpen ? 'show' : ''}`}>
          <button onClick={toggleMenu}  style={clickedMenu}>
            &#9776;
          </button>
            <a href="#" style={boostFromTop} className="selected">Home</a>
            <a href="#">Account</a>
            <a href="login">Logout</a>
            <a href="#">Join a Course</a>
            <a href="#">Get Help...</a>
          </div>
        </div>
      </header>
      <div className="dashboard">
        <div className="course-card">
          <img src="../../public/webpic.svg" alt="Course" />
          <h2>COSC 499</h2>
          <p>Software Engineering Capstone</p>
        </div>
        <div className="course-card">
          <img src="../../public/webpic.svg" alt="Course" />
          <h2>COSC 360</h2>
          <p>Intro to Web Development</p>
        </div>
        <div className="course-card">
          <img src="../../public/webpic.svg" alt="Course" />
          <h2>COSC 304</h2>
          <p>Web Development II</p>
        </div>
        <div className="course-card">
          <img src="../../public/webpic.svg" alt="Course" />
          <h2>COSC 395</h2>
          <p>Intro to Frontend Development</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
