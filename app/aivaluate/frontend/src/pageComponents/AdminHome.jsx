import React, { useEffect, useState } from 'react';
import '../Admin.css';
import '../GeneralStyling.css';
import AIvaluateNavBarAdmin from '../components/AIvaluateNavBar';
import SideMenuBarAdmin from '../components/SideMenuBarAdmin';

const AdminHome = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:5173/admin-api/students');
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, []);

    const handleDeleteStudent = async (studentId) => {
        try {
            await fetch(`http://localhost:5173/admin-api/students/${studentId}`, { method: 'DELETE' });
            setStudents(students.filter(student => student.studentId !== studentId));
            setSelectedStudent(null);
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
    };

    const handleDropCourse = async (courseCode) => {
        if (selectedStudent) {
            const updatedCourses = selectedStudent.courses.filter(course => course.courseCode !== courseCode);
            setSelectedStudent({ ...selectedStudent, courses: updatedCourses });

            try {
                await fetch(`http://localhost:5173/admin-api/students/${selectedStudent.studentId}/courses`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ courses: updatedCourses }),
                });
            } catch (error) {
                console.error('Error updating courses:', error);
            }
        }
    };

    const handleBackButtonClick = () => {
        setSelectedStudent(null);
    };

    return (
        <div>
            <SideMenuBarAdmin tab="home"/>
            <AIvaluateNavBarAdmin navBarText="Admin Home Portal" tab="home"/>
            <div className="admin-container">
                <div className="main-content">
                    
                    {selectedStudent ? (
                        <div className="user-info">
                            <button className="back-button" onClick={handleBackButtonClick}>Back</button>
                            <div className="user-details">
                                <span><strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</span>
                                <span><strong>Email:</strong> {selectedStudent.email}</span>
                                <span><strong>Student ID:</strong> {selectedStudent.studentId}</span>
                                <span><strong>Major:</strong> {selectedStudent.major}</span>
                                <span><strong>Password:</strong> **********</span>
                            </div>
                            <button onClick={() => handleDeleteStudent(selectedStudent.studentId)} className="delete-button">Delete user</button>
                            <h3>Courses:</h3>
                            <ul className="student-list">
                                {selectedStudent.courses && selectedStudent.courses.map(course => (
                                    <li key={course.courseCode}>
                                        {course.courseName} ({course.courseCode})
                                        <button className="delete-button" onClick={() => handleDropCourse(course.courseCode)}>Drop</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <ul className="student-list">
                            {students.map(student => (
                                <li key={student.studentId} onClick={() => handleSelectStudent(student)}>
                                    {student.firstName} {student.lastName} ({student.email})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHome;