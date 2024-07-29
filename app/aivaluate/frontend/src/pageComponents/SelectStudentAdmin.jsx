import CircumIcon from "@klarr-agency/circum-icons-react";
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AIvaluateNavBarAdmin from "../components/AIvaluateNavBarAdmin";
import SideMenuBarAdmin from "../components/SideMenuBarAdmin";
import '../GeneralStyling.css';
import '../SelectStudentAdmin.css';
import '../ToastStyles.css';

const SelectStudentAdmin = () => {
    const navigate = useNavigate();
    const { studentId } = useParams();
    const [student, setStudent] = useState({});
    const [courses, setCourses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5173/admin-api/student/${studentId}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                setStudent(data);
                setCourses(data.courses);
                setEditedName(`${data.firstName} ${data.lastName}`);
                setEditedEmail(data.email);
            } catch (error) {
                console.error('Error fetching student details:', error);
            }
        };

        fetchStudentDetails();
    }, [studentId]);

    const handleDelete = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleConfirmDelete = async () => {
                    try {
                        const response = await fetch(`http://localhost:5173/admin-api/student/${studentId}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });
                        if (response.ok) {
                            toast.success("User deleted successfully.");
                            navigate('/admin/studentManager');
                        } else {
                            toast.error('Failed to delete the user');
                        }
                    } catch (error) {
                        console.error('Error deleting user:', error);
                        toast.error('Failed to delete the user');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Confirm Deletion</h1>
                        <p>Are you sure you want to delete this user?</p>
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

    const handleDropCourse = (courseCode) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleConfirmDrop = async () => {
                    try {
                        const response = await fetch(`http://localhost:5173/admin-api/student/${studentId}/drop/${courseCode}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });
                        if (response.ok) {
                            setCourses(courses.filter(course => course.courseCode !== courseCode));
                            toast.success(`Dropped course: ${courseCode}`);
                        } else {
                            toast.error('Failed to drop the course');
                        }
                    } catch (error) {
                        console.error('Error dropping course:', error);
                        toast.error('Failed to drop the course');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Confirm Drop</h1>
                        <p>Are you sure you want to drop the course {courseCode}?</p>
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={handleConfirmDrop} className="confirm-button">Confirm</button>
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
        const [firstName, lastName] = editedName.split(' ');
        try {
            const response = await fetch(`http://localhost:5173/admin-api/student/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email: editedEmail,
                }),
            });
            if (response.ok) {
                setStudent({ ...student, firstName, lastName, email: editedEmail });
                toast.success('Your new information has been updated');
            } else {
                toast.error('Failed to update student');
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('Failed to update student');
        }
    };

    const maskedPassword = student.password ? '*'.repeat(student.password.length) : '';

    return (
        <div>
            <ToastContainer />
            <AIvaluateNavBarAdmin navBarText="Admin Home Portal" />
            <div className="filler-div">
                <SideMenuBarAdmin tab="studentManager" />
                <div className="main-margin">
                    <div className="top-bar">
                        <div className="back-btn-div">
                            <button className="main-back-button" onClick={() => navigate(-1)}><CircumIcon name="circle_chev_left" /></button>
                        </div>
                        <h1>Student Info</h1>
                    </div>
                    <div className="center-it">
                        <div>
                            <div className="user-info2">
                                <div className="user-name">
                                    {isEditing ? (
                                        <div>
                                            <input 
                                                type="text" 
                                                value={editedName} 
                                                onChange={(e) => setEditedName(e.target.value)} 
                                            />
                                            <input 
                                                type="email" 
                                                value={editedEmail} 
                                                onChange={(e) => setEditedEmail(e.target.value)} 
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <span>{student.firstName} {student.lastName}</span>
                                            <span>{student.studentId}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="major">Major: {student.major}</div>
                                <div className="email">
                                    <span>Email:</span>
                                    <span>{student.email}</span>
                                </div>
                                <div className="password">
                                    <span>Password:</span>
                                    <span>{maskedPassword}</span>
                                </div>
                                <div className="courses">
                                    <span>Courses:</span>
                                    <ul>
                                        {courses.map((course, index) => (
                                            <li key={index}>
                                                {course.courseCode}
                                                <button className="drop-button" onClick={() => handleDropCourse(course.courseCode)}>Drop</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="action-buttons">
                                    {isEditing ? (
                                        <button className="confirm-button" onClick={handleConfirmClick}>Confirm</button>
                                    ) : (
                                        <button className="edit-button" onClick={handleEditClick}>Edit</button>
                                    )}
                                    <button className="delete-button" onClick={handleDelete}>Delete user</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectStudentAdmin;
