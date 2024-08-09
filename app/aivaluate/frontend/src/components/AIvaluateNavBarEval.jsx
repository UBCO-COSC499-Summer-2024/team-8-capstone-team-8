import axios from 'axios';
import React, { useState, useEffect } from 'react';
import '../GeneralStyling.css';
import '../NavBar.css';

const AIvaluateNavBarEval = ({ navBarText, tab }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTA, setIsTA] = useState(false);
  const [instructorId, setInstructorId] = useState('');

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log(`menu open - ${!menuOpen}`); 
  };

  const boostFromTop = {
    marginTop: '120px'
  };

  // Fetch instructorId and isTA attribute
  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const response = await axios.get('http://localhost:5173/eval-api/instructor/me', {
          withCredentials: true
        });
        const instructorId = response.data.instructorId;
        setInstructorId(instructorId);

        const isTAResponse = await axios.get(`http://localhost:5173/eval-api/instructor/${instructorId}/isTA`, {
          withCredentials: true
        });
        setIsTA(isTAResponse.data.isTA);
      } catch (error) {
        console.error('There was an error fetching the instructor data:', error);
      }
    };

    fetchInstructorData();
  }, []);

  const handleLogout = async () => {
    window.location.href = '/eval/login';
    try {
      const response = await axios.get('http://localhost:5173/eval-api/logout', {
        withCredentials: true // Ensures cookies are included in the request
      });

      if (response.status === 200) {
        // Clear local storage
        window.localStorage.clear();

        // Redirect to login page
        history.push('/eval/login'); // Use history.push to navigate to the login page
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally handle error messages
    }
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
            <a href="/eval/dashboard" style={boostFromTop} className={`${tab === 'home' ? 'primary-color-text' : 'third-color-text'}`}>
              Home
            </a>
            <a href="/eval/account" className={`${tab === 'account' ? 'primary-color-text' : 'third-color-text'}`}>
              Account
            </a>
            <a href="/eval/help" className={`${tab === 'help' ? 'primary-color-text' : 'third-color-text'}`}>
              Get Help
            </a>
            {!isTA && (
              <a href="/eval/ai/settings" className={`${tab === 'ai' ? 'primary-color-text' : 'third-color-text'}`}>
                AI Settings
              </a>
            )}
            <button onClick={handleLogout} className="logout">Logout</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default AIvaluateNavBarEval;
