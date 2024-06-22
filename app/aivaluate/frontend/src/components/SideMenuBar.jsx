import React from 'react';
import '../GeneralStyling.css';
import '../SideMenu.css';

const SideMenuBar = ({tab}) => {
  
return (
        <div className="fourth-colorbg side-menu rborder">
            <a href="dashboard" className={`${tab === "home" ? 'primary-color-text' : 'third-color-text'}`}>Home</a>
            <a className={`${tab === "grades" ? 'primary-color-text' : 'third-color-text'}`}>Grades</a>
            <a href="AssignmentOverview" className={`${tab === "assignments" ? 'primary-color-text' : 'third-color-text'}`}>Assignments</a>
            <a href="People" className={`${tab === "People" ? 'primary-color-text' : 'third-color-text'}`}>People</a>
            <a className={`${tab === "submissions" ? 'primary-color-text' : 'third-color-text'}`}>Submissions</a>
        </div>
)
}
export default SideMenuBar;