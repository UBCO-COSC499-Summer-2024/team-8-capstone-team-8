import axios from 'axios';
import React, { useState } from 'react';
import '../GeneralStyling.css';
// import '../styles.css';

const AIvaluateNavBar = ({ navBarText, tab }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log(`menu open - ${!menuOpen}`);
  };

  const handleLogout = async () => {
    window.location.href = '/stu/login';
    try {
      const response = await axios.get('http://localhost:4000/stu/logout', {
        withCredentials: true // Ensures cookies are included in the request
      });

      if (response.status === 200) {
        // Clear local storage
        window.localStorage.clear();

        // Redirect to login page
        history.push('/stu/login'); // Use history.push to navigate to the login page
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally handle error messages
    }
  };


  const boostFromTop = {
    marginTop: '120px',
  };

  return (
    <div>
      <header className="header primary-colorbg rborder">
        <div className="circle secondary-colorbg"></div>
        <h1>{navBarText}</h1>
        <div className="menu">
          <button onClick={toggleMenu} className={menuOpen ? 'active' : ''}>
            &#9776;
          </button>
          <div className={`dropdown ${menuOpen ? 'show secondary-colorbg' : 'primary-colorbg'}`}>
            <a href="dashboard" style={boostFromTop} className={`${tab === 'home' ? 'primary-color-text' : 'third-color-text'}`}>
              Home
            </a>
            <a href="account" className={`${tab === 'account' ? 'primary-color-text' : 'third-color-text'}`}>
              Account
            </a>
            <a href="joincourse" className={`${tab === 'join-course' ? 'primary-color-text' : 'third-color-text'}`}>
              Join a Course
            </a>
            <a href="help" className={`${tab === 'help' ? 'primary-color-text' : 'third-color-text'}`}>
              Get Help...
            </a>
            <button onClick={handleLogout} className="logout">Logout</button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default AIvaluateNavBar;