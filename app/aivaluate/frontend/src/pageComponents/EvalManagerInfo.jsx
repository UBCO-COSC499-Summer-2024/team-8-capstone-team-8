// import CircumIcon from "@klarr-agency/circum-icons-react";
// import React, { useState, useEffect } from 'react';
// import { FaSearch } from 'react-icons/fa';
// import { useNavigate, useParams } from 'react-router-dom';
// import '../EvalManagerInfo.css';
// import '../GeneralStyling.css';
// import AIvaluateNavBarAdmin from '../components/AIvaluateNavBarAdmin';
// import SideMenuBarAdmin from '../components/SideMenuBarAdmin';
// import axios from 'axios';

// const EvalManagerInfo = () => {
//     const navigate = useNavigate();
//     const { instructorId } = useParams();
//     const [searchTerm, setSearchTerm] = useState('');
//     const [evaluator, setEvaluator] = useState({});
//     const [courses, setCourses] = useState([]);
//     const [isTeachingAssistant, setIsTeachingAssistant] = useState('');

//     useEffect(() => {
//         const fetchEvaluatorDetails = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:5173/admin-api/evaluator/${instructorId}`, {
//                     credentials: 'include'
//                 });
//                 if (response.data) {
//                     setEvaluator(response.data);
//                     setIsTeachingAssistant(response.data.isTA); // Ensure this is correct
//                 }
//             } catch (error) {
//                 console.error('Error fetching evaluator details:', error);
//             }
//         };
    
//         const fetchCourses = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:5173/admin-api/evaluator/${instructorId}/courses`, {
//                     credentials: 'include'
//                 });
//                 setCourses(response.data);
//             } catch (error) {
//                 console.error('Error fetching courses:', error);
//             }
//         };
    
//         fetchEvaluatorDetails();
//         fetchCourses();
//     }, [instructorId]);
    

//     const handleRemoveCourse = async (courseCode) => {
//        const confirmRemove = window.confirm(`Are you sure you want to remove the course ${courseCode}?`);
//         if (confirmRemove) {
//             try {
//                 const response = await fetch(`http://localhost:5173/admin-api/evaluator/${instructorId}/drop/${courseCode}`, {
//                     method: 'DELETE',
//                     credentials: 'include'
//                 });
//                 if (response.ok) {
//                     setCourses(courses.filter(course => course.courseCode !== courseCode));
//                     alert(`Removed course: ${courseCode}`);
//                 } else {
//                     alert('Failed to remove the course');
//                 }
//             } catch (error) {
//                 console.error('Error removing course:', error);
//                 alert('Failed to remove the course');
//             }
//         }
//     };
    

//     const handleDeleteEvaluator = async () => {
//         try {
//             await axios.delete(`http://localhost:5173/admin-api/evaluator/${instructorId}`, {
//                 credentials: 'include'
//             });
//             navigate('/admin/evaluatormanager'); // Redirect to the evaluator manager page
//         } catch (error) {
//             console.error('Error deleting evaluator:', error);
//         }
//     };

//     const handleRegister = () => {
//         navigate('/admin/CreateAccPT');
//     };

//     const filteredCourses = courses.filter(course => 
//         course.courseName.toLowerCase().includes(searchTerm.toLowerCase())||
//         course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return (
//         <div className="admin-container">
//             <AIvaluateNavBarAdmin navBarText="Admin Home Portal" />
//             <SideMenuBarAdmin tab="evalManager" />
//             <div className="main-margin">
//                 <div className="top-bar">
//                     <div className="back-btn-div">
//                         <button className="main-back-button" onClick={() => navigate(-1)}><CircumIcon name="circle_chev_left"/></button>
//                     </div>
//                     <h1 className="eval-text">Evaluator Info</h1>
//                     <div className="empty"> </div>
//                 </div>
//                 <div className="user-info">
//                     <div className="user-details">
//                         <h2>{evaluator.firstName} {evaluator.lastName}</h2>
//                         <div className="align-check">
//                             <label className="checkbox-label2 ">
//                                 <input type="checkbox" checked={isTeachingAssistant} readOnly /> Teaching Assistant
//                             </label>
//                         </div>
//                         <div className="action-buttons">
//                             <button className="delete-button" onClick={handleDeleteEvaluator}>Delete user</button>
//                         </div>
//                     </div>
//                     <div className="info-row">
//                         <span>Email:</span>
//                         <span>{evaluator.email}</span>
//                     </div>
//                     <div className="info-row">
//                         <span>Password:</span>
//                         <span>{'*'.repeat(evaluator.userPassword ? evaluator.userPassword.length : 10)}</span>
//                     </div>
//                     <div className="info-row">
//                         <span>Department:</span>
//                         <span>{evaluator.department}</span>
//                     </div>
//                 </div>
//                 <div className="course-section">
//                     <div className="search-bar">
//                         <FaSearch className="search-icon" />
//                         <input 
//                             type="text" 
//                             placeholder="Search..." 
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)} 
//                         />
//                     </div>
//                     {filteredCourses.map((course, index) => (
//                         <div className="course-item" key={index}>
//                             <span>{course.courseCode} - {course.courseName}</span>
//                             <button className="remove-button" onClick={() => handleRemoveCourse(course.courseCode)}>Drop</button>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EvalManagerInfo;


import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AIvaluateNavBarAdmin from '../components/AIvaluateNavBarAdmin';
import SideMenuBarAdmin from '../components/SideMenuBarAdmin';

const EvalManagerInfo = () => {
    const navigate = useNavigate();
    const { instructorId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [evaluator, setEvaluator] = useState({});
    const [courses, setCourses] = useState([]);
    const [isTeachingAssistant, setIsTeachingAssistant] = useState('');

    useEffect(() => {
        const fetchEvaluatorDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5173/admin-api/evaluator/${instructorId}`, {
                    withCredentials: true
                });
                if (response.data) {
                    setEvaluator(response.data);
                    setIsTeachingAssistant(response.data.isTA);
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
                            <button onClick={handleConfirmRemove} className="confirm-button">Confirm</button>
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
                            <button onClick={handleConfirmDelete} className="confirm-button">Confirm</button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay"
        });
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
                            <h2>{evaluator.firstName} {evaluator.lastName}</h2>
                            <div className="align-check">
                                <label className="checkbox-label2 ">
                                    <input type="checkbox" checked={isTeachingAssistant} readOnly /> Teaching Assistant
                                </label>
                            </div>
                            <div className="action-buttons">
                                <button className="delete-button" onClick={handleDeleteEvaluator}>Delete user</button>
                            </div>
                        </div>
                        <div className="info-row">
                            <span>Email:</span>
                            <span>{evaluator.email}</span>
                        </div>
                        <div className="info-row">
                            <span>Password:</span>
                            <span>{'*'.repeat(evaluator.userPassword ? evaluator.userPassword.length : 10)}</span>
                        </div>
                        <div className="info-row">
                            <span>Department:</span>
                            <span>{evaluator.department}</span>
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
