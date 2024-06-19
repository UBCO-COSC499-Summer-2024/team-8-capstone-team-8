import React from 'react';
import '../GeneralStyling.css';
import '../styles.css';

const SideMenuBar2 = ({tab}) => {
  
return (
        <div className="fourth-colorbg side-menu rborder">
            <a href="dashboard" className={`${tab === "home" ? 'primary-color-text' : 'third-color-text'}`}>Home</a>
            <a className={`${tab === "Student Grades" ? 'primary-color-text' : 'third-color-text'}`}>Student Grades</a>
            <a href="Grading Assignments" className={`${tab === "Grading Assignments" ? 'primary-color-text' : 'third-color-text'}`}>Assignments</a>
            <a href="Students" className={`${tab === "Students" ? 'primary-color-text' : 'third-color-text'}`}>Students</a>
            <a className={`${tab === "All Submissions" ? 'primary-color-text' : 'third-color-text'}`}>All Submissions</a>
            <a className={`${tab === "Rubrics" ? 'primary-color-text' : 'third-color-text'}`}>Rubrics</a>

        </div>
)
}
export default SideMenuBar2;