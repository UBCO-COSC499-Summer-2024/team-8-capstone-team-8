import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // run npm install react-icons

import '../CourseCards.css';
import '../SearchBar.css';
import Card from './card';

const CourseCards = ({ navBarText, page }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTA, setIsTA] = useState(false);
    const [taLoaded, setTaLoaded] = useState(false); // New state to track TA loading
    const [instructorID, setInstructorID] = useState('');

    if (page === "JoinCourse") {
        const [searchTerm, setSearchTerm] = useState('');
        
        useEffect(() => {
            const fetchCourses = async () => {
                try {
                    const response = await axios.get('http://localhost:5173/stu-api/not-enrolled-courses/active', { withCredentials: true });
                    console.log('Fetched Courses:', response.data); // Log fetched courses to verify
                    setCourses(response.data);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching not enrolled courses:', error);
                    setLoading(false);
                }
            };
    
            fetchCourses();
        }, []);
    
        if (loading) {
            return <div>Loading...</div>;
        }
        
        // Filter courses based on search term
        const filteredCourses = courses.filter(course =>
            course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.courseId.toString().includes(searchTerm)
        );

        const handleSearchChange = (e) => {
            setSearchTerm(e.target.value);
        };

        return (
            <div>
                <div className="center-search">
                    <div className="search-container">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search a course"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="dashboard">
                    {filteredCourses.map(course => (
                        <Card 
                            // key={course.courseId} 
                            courseCode={course.courseCode} 
                            courseName={course.courseName} 
                            courseId={course.courseId}
                            isArchived={course.isArchived}
                            user="joinCourse"
                        />
                    ))}
                </div>
            </div>
        );
    } else if (page === "stu/dashboard") {
        useEffect(() => {
            const fetchCourses = async () => {
                try {
                    const response = await axios.get('http://localhost:5173/stu-api/enrolled-courses/active', { withCredentials: true });
                    console.log('Fetched Courses:', response.data); // Log fetched courses to verify
                    setCourses(response.data);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching enrolled courses:', error);
                    setLoading(false);
                }
            };
    
            fetchCourses();
        }, []);
    
        if (loading) {
            return <div>Loading...</div>;
        }
        
        return (
            <div className="dashboard">
                {courses.map(course => (
                    <Card 
                        // key={course.courseId} 
                        courseCode={course.courseCode} 
                        courseName={course.courseName} 
                        courseId={course.courseId}
                        isArchived={course.isArchived}
                        user="stu"
                    />
                ))}
            </div>
        );
    } else     if (page === "prof/dashboard") {
        useEffect(() => {
            const fetchUserRole = async () => {
                try {
                    const response = await axios.get('http://localhost:5173/eval-api/instructor/me', { withCredentials: true });
                    const { data } = await axios.get(`http://localhost:5173/eval-api/instructor/${response.data.instructorId}/isTA`, { withCredentials: true });
                    setIsTA(data.isTA);
                    setTaLoaded(true);
                    setInstructorID(response.data.instructorId);
                    console.log('Fetched User Role:', response.data);
                    console.log('Fetched TA status:', data);
                    console.log('Fetched Instructor ID:', response.data.instructorId);
                } catch (error) {
                    console.error('Error fetching user role:', error);
                }
            };
    
            fetchUserRole();
        }, []);
        
        useEffect(() => {
            if (taLoaded && instructorID) {
                const fetchCourses = async () => {
                    try {
                        const response = await axios.get(`http://localhost:5173/eval-api/courses/me/${instructorID}`, { withCredentials: true });
                        console.log('Fetched Courses:', response.data); // Ensure this logs an array
                        setCourses(Array.isArray(response.data) ? response.data : [response.data]);
                        setLoading(false);
                    } catch (error) {
                        console.error('Error fetching courses:', error);
                        setLoading(false);
                    }
                };
        
                fetchCourses();
            }
        }, [taLoaded, instructorID]);
    
        if (loading) {
            return <div>Loading...</div>;
        }
        
        return (
            <div className="dashboard">
                {Array.isArray(courses) && courses.map(course => (
                    <Card 
                        key={course.courseId} 
                        courseCode={course.courseCode} 
                        courseName={course.courseName}
                        courseId={course.courseId}
                        isArchived={course.isArchived}
                        user="prof" 
                    />
                ))}
                {!isTA && (
                    <Card 
                        courseCode="Create Course" 
                        courseName="Click to create a new course" 
                    />
                )}
            </div>
        );
    }
};

export default CourseCards;
