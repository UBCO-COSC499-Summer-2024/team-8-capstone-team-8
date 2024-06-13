import React from 'react';
import '../GeneralStyling.css';
import '../styles.css';

const SideMenuBar = ({tab}) => {
  
return (
        <div className="fourth-colorbg side-menu rborder">
            <a href="dashboard" className={`${tab === "home" ? 'primary-color-text' : 'third-color-text'}`}>Home</a>
            <a href="grades" className={`${tab === "grades" ? 'primary-color-text' : 'third-color-text'}`}>Grades</a>
            <a href="assignments" className={`${tab === "assignments" ? 'primary-color-text' : 'third-color-text'}`}>Assignments</a>
            <a href="people" className={`${tab === "people" ? 'primary-color-text' : 'third-color-text'}`}>People</a>
            <a href="submissions" className={`${tab === "submissions" ? 'primary-color-text' : 'third-color-text'}`}>Submissions</a>
        </div>
)
}
export default SideMenuBar;