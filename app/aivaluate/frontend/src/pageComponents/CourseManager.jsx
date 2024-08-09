import CircumIcon from "@klarr-agency/circum-icons-react";
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import AIvaluateNavBarAdmin from "../components/AIvaluateNavBarAdmin";
import SideMenuBarAdmin from '../components/SideMenuBarAdmin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const CourseManager = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [deletedCourses, setDeletedCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5173/admin-api/courses', {
                withCredentials: true
            });
            setCourses(response.data);
            setFilteredCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchDeletedCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5173/admin-api/deleted-courses', {
                withCredentials: true
            });
            setDeletedCourses(response.data);
        } catch (error) {
            console.error('Error fetching deleted courses:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchCourses(), fetchDeletedCourses()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = courses.filter(course =>
            `${course.courseName} ${course.courseCode}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(filtered);
        setCurrentPage(1);
    }, [searchTerm, courses]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleCourseClick = (courseId) => {
        navigate(`/admin/course/${courseId}`);
    };

    const handleRevertAction = async (courseId) => {
        try {
            const response = await axios.post(`http://localhost:5173/admin-api/course/restore/${courseId}`, {}, {
                withCredentials: true
            });
            if (response.status === 200) {
                toast.success('Course restored successfully.');
                await fetchCourses();
                await fetchDeletedCourses();
            } else {
                toast.error('Failed to restore the course.');
            }
        } catch (error) {
            console.error('Error restoring course:', error);
            toast.error('Failed to restore the course.');
        }
    };

    return (
        <div>
            <ToastContainer />
            <AIvaluateNavBarAdmin navBarText="Admin Home Portal" />
            <div className="filler-div">
                <SideMenuBarAdmin tab="courseManager" />
                <div className="main-margin">
                    <div className="portal-container">
                        <div className="top-bar">
                            <h1>Courses</h1>
                            <div className="search-container">
                                <div className="search-box">
                                    <FaSearch className="search-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="Search..." 
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            <div className="empty"> </div>
                            {!loading && deletedCourses.length > 0 && (
                                <button 
                                    className="revertEvalButton" 
                                    onClick={() => handleRevertAction(deletedCourses[0].courseId)}
                                >
                                    Undo Delete
                                </button>
                            )}
                        </div>
                        <div className="filetab">
                            {currentCourses.map((course) => (
                                <div 
                                    className="file-item" 
                                    key={course.courseId} 
                                    onClick={() => handleCourseClick(course.courseId)}
                                >
                                    <div className="file-name">{course.courseName} ({course.courseCode})</div>
                                    <div className="file-status">{course.isArchived ? "Archived" : ""}</div>
                                    <div className="file-icon"><CircumIcon name="edit" /></div>
                                </div>
                            ))}
                        </div>
                        <div className="pagination-controls">
                            <span>Page {currentPage} of {totalPages}</span>
                            <div className="pagination-buttons">
                                <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseManager;
