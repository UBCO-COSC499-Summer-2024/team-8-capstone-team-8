import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaSearch } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AIvaluateNavBarAdmin from '../components/AIvaluateNavBarAdmin';
import SideMenuBarAdmin from '../components/SideMenuBarAdmin';
import '../EvalManagerInfo.css';
import '../GeneralStyling.css';
import '../ToastStyles.css';

const EvalManagerInfo = () => {
    const navigate = useNavigate();
    const { instructorId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [evaluator, setEvaluator] = useState({});
    const [courses, setCourses] = useState([]);
    const [isTeachingAssistant, setIsTeachingAssistant] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedFirstName, setEditedFirstName] = useState('');
    const [editedLastName, setEditedLastName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');

    useEffect(() => {
        const fetchEvaluatorDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5173/admin-api/evaluator/${instructorId}`, {
                    withCredentials: true
                });
                if (response.data) {
                    setEvaluator(response.data);
                    setIsTeachingAssistant(response.data.isTA);
                    setEditedFirstName(response.data.firstName);
                    setEditedLastName(response.data.lastName);
                    setEditedEmail(response.data.email);
                }
            } catch (error) {
                console.error('Error fetching evaluator details:', error);
            }
        };

        const fetchCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:5173/admin-api/evaluator/${instructorId}/courses`, {
                    withCredentials: true
                });
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchEvaluatorDetails();
        fetchCourses();
    }, [instructorId]);

    const handleRemoveCourse = (courseCode) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleConfirmRemove = async () => {
                    try {
                        const response = await fetch(`http://localhost:5173/admin-api/evaluator/${instructorId}/drop/${courseCode}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });
                        if (response.ok) {
                            setCourses(courses.filter(course => course.courseCode !== courseCode));
                            toast.success(`Removed course: ${courseCode}`);
                        } else {
                            toast.error('Failed to remove the course');
                        }
                    } catch (error) {
                        console.error('Error removing course:', error);
                        toast.error('Failed to remove the course');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Confirm Removal</h1>
                        <p>Are you sure you want to remove the course {courseCode}?</p>
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={handleConfirmRemove} className="cancel-button">Confirm</button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay"
        });
    };

    const handleDeleteEvaluator = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleConfirmDelete = async () => {
                    try {
                        await axios.delete(`http://localhost:5173/admin-api/evaluator/${instructorId}`, {
                            withCredentials: true
                        });
                        toast.success('Evaluator deleted successfully');
                        navigate('/admin/evaluatormanager');
                    } catch (error) {
                        console.error('Error deleting evaluator:', error);
                        toast.error('Failed to delete evaluator');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Confirm Deletion</h1>
                        <p>Are you sure you want to delete this evaluator? Deleting this evaluator will remove all associated courses and data.</p>
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={handleConfirmDelete} className="cancel-button">Confirm</button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay"
        });
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleConfirmClick = async () => {
        console.log('Updating evaluator with:', { firstName: editedFirstName, lastName: editedLastName, email: editedEmail }); // Debugging line

        // Email validation regex pattern
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(editedEmail)) {
            toast.error('Invalid email format');
            return;
        }

        try {
            await axios.put(`http://localhost:5173/admin-api/evaluator/${instructorId}`, {
                firstName: editedFirstName,
                lastName: editedLastName,
                email: editedEmail
            }, {
                withCredentials: true
            });
            setEvaluator({ ...evaluator, firstName: editedFirstName, lastName: editedLastName, email: editedEmail });
            toast.success('Your new information has been updated');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating evaluator:', error);
            toast.error('Failed to update evaluator');
        }
    };

    const handleRoleChange = async () => {
        const newRole = !isTeachingAssistant;

        confirmAlert({
            customUI: ({ onClose }) => (
                <div className="custom-ui">
                    <h1>Confirm Change</h1>
                    <p>Are you sure you want to change the role to {newRole ? 'Teaching Assistant' : 'Professor'}?</p>
                    <div className="button-group">
                        <button onClick={onClose} className="cancel-button">Cancel</button>
                        <button 
                            onClick={async () => {
                                await updateRole(newRole);
                                onClose();
                            }} 
                            className="cancel-button"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            ),
            overlayClassName: "custom-overlay"
        });
    };

    const updateRole = async (newRole) => {
        try {
            await axios.put(`http://localhost:5173/admin-api/evaluator/${instructorId}/role`, {
                isTA: newRole
            }, {
                withCredentials: true
            });
            setIsTeachingAssistant(newRole);
            setEvaluator({ ...evaluator, isTA: newRole });
            toast.success(`Role updated to ${newRole ? 'Teaching Assistant' : 'Professor'}`);
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        }
    };

    const filteredCourses = courses.filter(course => 
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <ToastContainer />
            <AIvaluateNavBarAdmin navBarText="Admin Home Portal" />
            <div className="filler-div">
                <SideMenuBarAdmin tab="evalManager" />
                <div className="main-margin">
                    <div className="top-bar">
                        <div className="back-btn-div">
                            <button className="main-back-button" onClick={() => navigate(-1)}><CircumIcon name="circle_chev_left"/></button>
                        </div>
                        <h1 className="eval-text">Evaluator Info</h1>
                    </div>
                    <div className="user-info">
                        <div className="user-details">
                            {isEditing ? (
                                <div>
                                    <input 
                                        type="text" 
                                        value={editedFirstName} 
                                        onChange={(e) => setEditedFirstName(e.target.value)} 
                                        className="user-details-input"
                                    />
                                    <input 
                                        type="text" 
                                        value={editedLastName} 
                                        onChange={(e) => setEditedLastName(e.target.value)} 
                                        className="user-details-input"
                                    />
                                </div>
                            ) : (
                                <h2>Name: {evaluator.firstName} {evaluator.lastName}</h2>
                            )}
                            <div className="action-buttons">
                                {isEditing ? (
                                    <button className="Eval-confirm-button" onClick={handleConfirmClick}>Confirm</button>
                                ) : (
                                    <button className="edit-button" onClick={handleEditClick}>Edit</button>
                                )}
                                <button className="delete-button" onClick={handleDeleteEvaluator}>Delete user</button>
                            </div>
                        </div>
                        <div className="info-row">
                            <span>Email: </span>
                            {isEditing ? (
                                <input 
                                    type="email" 
                                    value={editedEmail} 
                                    onChange={(e) => setEditedEmail(e.target.value)} 
                                    className="user-details-input"
                                />
                            ) : (
                                <span>{evaluator.email}</span>
                            )}
                        </div>
                        <div className="info-row">
                            <span>Password:</span>
                            <span>{'*'.repeat(evaluator.userPassword ? evaluator.userPassword.length : 10)}</span>
                        </div>
                        <div className="info-row">
                            <div className="align-check">
                                <div className="slider-container">
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={isTeachingAssistant} 
                                            onChange={handleRoleChange} 
                                        />
                                        <span className="slider round">
                                            <span className="slider-text">{isTeachingAssistant ? 'TA' : 'Prof'}</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="course-section">
                        <div className="search-bar">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text"
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        {filteredCourses.map((course, index) => (
                            <div className="course-item" key={index}>
                                <span>{course.courseCode} - {course.courseName}</span>
                                <button className="remove-button" onClick={() => handleRemoveCourse(course.courseCode)}>Drop</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvalManagerInfo;
