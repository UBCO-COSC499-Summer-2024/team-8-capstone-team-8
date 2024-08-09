import CircumIcon from "@klarr-agency/circum-icons-react";
import React from 'react';
import { Link, useParams } from 'react-router-dom'; // to prevent page reload
import '../GeneralStyling.css';
import '../SideMenu.css';

const SideMenuBar = ({ tab }) => {
    const { courseId } = useParams(); // Hook to get the courseId from the URL
    return (
        <div className="fourth-colorbg side-menu">
            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="home"/>
                </div>
                <div className="link-div">
                    <Link to={`/stu/dashboard`} className={`${tab === "dashboard" ? 'primary-color-text' : 'third-color-text'}`}>Home</Link>
                </div>
            </div>

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="medical_cross"/>
                </div>
                <div className="link-div">
                    <Link to={`/stu/grades/${courseId}`} className={`${tab === "grades" ? 'primary-color-text' : 'third-color-text'}`}>Grades</Link>
                </div>
            </div>

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="file_on"/>
                </div>
                <div className="link-div">
                    <Link to={`/stu/assignment/${courseId}`} className={`${tab === "assignments" ? 'primary-color-text' : 'third-color-text'}`}>Assignments</Link>
                </div>
            </div>

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="user"/>
                </div>
                <div className="link-div">
                    <Link to={`/stu/people/${courseId}`} className={`${tab === "people" ? 'primary-color-text' : 'third-color-text'}`}>People</Link>
                </div>
            </div>

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="folder_on"/>
                </div>
                <div className="link-div">
                    <Link to={`/stu/submissions/${courseId}`} className={`${tab === "submissions" ? 'primary-color-text' : 'third-color-text'}`}>Submissions</Link>
                </div>
            </div>
            
            
            
        </div>
    );
};

export default SideMenuBar;
