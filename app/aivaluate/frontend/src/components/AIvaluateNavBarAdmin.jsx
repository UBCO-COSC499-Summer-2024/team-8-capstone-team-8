import axios from 'axios';
import React, { useState } from 'react';
import '../GeneralStyling.css';
import '../NavBar.css';

const AIvaluateNavBarAdmin = ({navBarText , tab}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log(`menu open - ${!menuOpen}`); 
  };

  const boostFromTop = {
    marginTop: '120px'
  };

  const handleLogout = async () => {
    window.location.href = '/admin/login';
    try {
      // Clear  all backup tables
      await axios.delete('http://localhost:5173/admin-api/clear-backups', {
          withCredentials: true
      });

      const response = await axios.get('http://localhost:5173/admin-api/logout', {
        withCredentials: true // Ensures cookies are included in the request
      });

      if (response.status === 200) {
        // Clear local storage
        window.localStorage.clear();

        // Redirect to login page
        history.push('/admin/login'); // Use history.push to navigate to the login page
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
                <a href="/admin/evaluatormanager" style={boostFromTop} className={`${tab === 'home' ? 'primary-color-text' : 'third-color-text'}`}>
                  Home
                </a>
                <a href="/admin/account" className={`${tab === 'account' ? 'primary-color-text' : 'third-color-text'}`}>
                  Account
                </a>
                <a href="/admin/help" className={`${tab === 'help' ? 'primary-color-text' : 'third-color-text'}`}>
                  Get Help
                </a>
                <button onClick={handleLogout} className="logout">Logout</button>
                </div>
                </div>
            </header>
        </div>
    ) 
}
export default AIvaluateNavBarAdmin;