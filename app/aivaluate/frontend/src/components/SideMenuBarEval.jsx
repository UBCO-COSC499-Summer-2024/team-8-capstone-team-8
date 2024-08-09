import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios'; // Import axios
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom'; // to prevent page reload
import '../GeneralStyling.css';
import '../SideMenu.css';

const SideMenuBarEval = ({ tab }) => {
    const { courseId } = useParams();
    const courseIdNavBar = sessionStorage.getItem('courseId') || courseId;
    const [isTA, setIsTA] = useState(null); // Initialize as null to handle loading state
    const [loading, setLoading] = useState(true); // Manage loading state

    useEffect(() => {
        const fetchTAStatus = async () => {
            // Check if TA status is already in session storage
            const storedIsTA = sessionStorage.getItem('isTA');
            if (storedIsTA !== null) {
                setIsTA(JSON.parse(storedIsTA));
                setLoading(false); // No need to fetch if status is already available
                return;
            }

            try {
                const response = await axios.get('http://localhost:5173/eval-api/instructor/me', { withCredentials: true });
                const { data } = await axios.get(`http://localhost:5173/eval-api/instructor/${response.data.instructorId}/isTA`, { withCredentials: true });
                setIsTA(data.isTA);
                sessionStorage.setItem('isTA', JSON.stringify(data.isTA)); // Store the status in session storage
            } catch (error) {
                console.error('Error fetching TA status:', error);
            } finally {
                setLoading(false); // Set loading to false once fetching is done
            }
        };

        fetchTAStatus();
    }, []); // Empty dependency array ensures it runs only once on mount

    if (loading) {
        return <div>Loading...</div>; // Display a loading message or spinner
    }

    return (
        <div className="fourth-colorbg side-menu">
            {isTA === false && ( // Render only if isTA is explicitly false
                <div className="class-selection">
                    <div className="icon-div">
                        <CircumIcon name="home" />
                    </div>
                    <div className="link-div">
                        <Link to={`/eval/coursehome/${courseIdNavBar}`} className={`${tab === "home" ? 'primary-color-text' : 'third-color-text'}`}>Management</Link>
                    </div>
                </div>
            )}

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="medical_cross" />
                </div>
                <div className="link-div">
                    <Link to={`/eval/grades/${courseIdNavBar}`} className={`${tab === "grades" ? 'primary-color-text' : 'third-color-text'}`}>Student Grades</Link>
                </div>
            </div>

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="file_on" />
                </div>
                <div className="link-div">
                    <Link to={`/eval/assignments/${courseIdNavBar}`} className={`${tab === "assignments" ? 'primary-color-text' : 'third-color-text'}`}>Assignments</Link>
                </div>
            </div>

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="user" />
                </div>
                <div className="link-div">
                    <Link to={`/eval/students/${courseIdNavBar}`} className={`${tab === "students" ? 'primary-color-text' : 'third-color-text'}`}>Students</Link>
                </div>
            </div>

            {/* <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="folder_on" />
                </div>
                <div className="link-div">
                    <Link to={`/eval/submissions/${courseIdNavBar}`} className={`${tab === "submissions" ? 'primary-color-text' : 'third-color-text'}`}>All Submissions</Link>
                </div>
            </div> */}

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="vault" />
                </div>
                <div className="link-div">
                    <Link to={`/eval/rubrics/${courseIdNavBar}`} className={`${tab === "rubrics" ? 'primary-color-text' : 'third-color-text'}`}>Rubrics</Link>
                </div>
            </div>
        </div>
    );
}

SideMenuBarEval.propTypes = {
    tab: PropTypes.string.isRequired,
};

export default SideMenuBarEval;
