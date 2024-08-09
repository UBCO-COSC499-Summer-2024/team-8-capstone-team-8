import CircumIcon from "@klarr-agency/circum-icons-react";
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AIvaluateNavBarAdmin from '../components/AIvaluateNavBarAdmin';
import SideMenuBarAdmin from '../components/SideMenuBarAdmin';
import '../GeneralStyling.css';
import '../SelectCourseAdmin.css';
import '../ToastStyles.css';

const SelectCourseAdmin = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [course, setCourse] = useState({});
    const [instructors, setInstructors] = useState([]);
    const [tas, setTAs] = useState([]);
    const [allInstructors, setAllInstructors] = useState([]);
    const [newInstructorId, setNewInstructorId] = useState('');

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5173/admin-api/courses/${courseId}`, {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCourse(data);
            } catch (error) {
                console.error('Error fetching course details:', error);
                toast.error('Failed to fetch course details');
            }
        };

        const fetchInstructors = async () => {
            try {
                const response = await fetch('http://localhost:5173/admin-api/instructors', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAllInstructors(data);
            } catch (error) {
                console.error('Error fetching instructors:', error);
                toast.error('Failed to fetch instructors');
            }
        };

        fetchCourseDetails();
        fetchInstructors();
    }, [courseId]);

    const handleAssignInstructor = async () => {
        try {
            const response = await fetch(`http://localhost:5173/admin-api/courses/${courseId}/instructors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ instructorId: newInstructorId })
            });
            if (response.ok) {
                toast.success('Instructor assigned successfully');
                setNewInstructorId('');
                const fetchCourseDetails = async () => {
                    try {
                        const response = await fetch(`http://localhost:5173/admin-api/courses/${courseId}`, {
                            credentials: 'include'
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        setCourse(data);
                    } catch (error) {
                        console.error('Error fetching course details:', error);
                        toast.error('Failed to fetch course details');
                    }
                };
                fetchCourseDetails();
            } else {
                toast.error('Failed to assign instructor');
            }
        } catch (error) {
            console.error('Error assigning instructor:', error);
            toast.error('Failed to assign instructor');
        }
    };

    const handleDelete = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleConfirmDelete = async () => {
                    try {
                        const response = await fetch(`http://localhost:5173/admin-api/courses/${courseId}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });
                        if (response.ok) {
                            toast.success('Course deleted successfully');
                            navigate('/admin/courseManager');
                        } else {
                            toast.error('Failed to delete the course');
                        }
                    } catch (error) {
                        console.error('Error deleting course:', error);
                        toast.error('Failed to delete the course');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Confirm Deletion</h1>
                        <p>Are you sure you want to delete this course?</p>
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

    return (
        <div>
            <ToastContainer />
            <AIvaluateNavBarAdmin navBarText="Admin Home Portal" />
            <div className="filler-div">
                <SideMenuBarAdmin tab="courseManager" />
                <div className="main-margin">
                    <div className="top-bar">
                        <div className="back-btn-div">
                            <button className="main-back-button" onClick={() => navigate(-1)}>
                                <CircumIcon name="circle_chev_left" />
                            </button>
                        </div>
                        <h1>Course Info</h1>
                    </div>
                    <div className="center-it">
                        <div className="user-info2">
                        <div className="user-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{course.courseName} ({course.courseCode})</span>
                            <span style={{ marginLeft: 'auto' }}>Course ID: {course.courseId}</span>
                        </div>
                            <div className="instructors" style={{ marginTop: '20px' }}>
                                <span>Assigned Instructor:</span>
                                {course.instructor ? (
                                    <ul>
                                        <li>{course.instructor.firstName} {course.instructor.lastName}</li>
                                    </ul>
                                ) : (
                                    <p>No instructor assigned to this course</p>
                                )}
                            </div>
                            <div className="tas">
                                <span>Assigned TAs:</span>
                                {course.tas && course.tas.length > 0 ? (
                                    <ul>
                                        {course.tas.map((ta, index) => (
                                            <li key={index}>{ta.firstName} {ta.lastName}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No TAs assigned to this course</p>
                                )}
                            </div>
                            <div className="assign-instructor" style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                <button
                                    onClick={handleAssignInstructor}
                                    style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', width: '150px', borderRadius: '5px' }}
                                >
                                    Assign Instructor
                                </button>
                                <select
                                    value={newInstructorId}
                                    onChange={(e) => setNewInstructorId(e.target.value)}
                                    className="select-dropdown"
                                >
                                    <option value="" style={{}}>Select Instructor</option>
                                    {allInstructors
                                        .filter(instructor => !instructor.isTA)
                                        .map((instructor) => (
                                            <option key={instructor.instructorId} value={instructor.instructorId}>
                                                {instructor.firstName} {instructor.lastName}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <button onClick={handleDelete} style={{ marginTop: '10px', backgroundColor: 'red', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', width: '150px', borderRadius: '5px' }}>
                                Delete course
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectCourseAdmin;