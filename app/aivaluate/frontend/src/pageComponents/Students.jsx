import { useEffect, useState, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import '../SearchBar.css';
import AIvaluateNavBarEval from "../components/AIvaluateNavBarEval";
import SideMenuBarEval from '../components/SideMenuBarEval';
import axios from 'axios';

const Students = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const navBarText = `${courseCode} - ${courseName}`;

    const { courseId: paramsCourseId } = useParams();
    const storedCourseId = sessionStorage.getItem('courseId');
    const [effectiveCourseId, setEffectiveCourseId] = useState(paramsCourseId || storedCourseId);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    const setSessionData = useCallback(async (courseId, instructorId) => {
        try {
            console.log('Setting session data:', { instructorId, courseId });
            await axios.post('http://localhost:5173/eval-api/set-session', {
                instructorId,
                courseId
            }, {
                withCredentials: true
            });
            sessionStorage.setItem('courseId', courseId);
            sessionStorage.setItem('instructorId', instructorId);
            setEffectiveCourseId(courseId);
        } catch (error) {
            console.error('Failed to set session data:', error);
            setError('Failed to set session data.');
        }
    }, []);

    const ensureSessionData = useCallback(async () => {
        let instructorId = sessionStorage.getItem('instructorId');
        let courseId = sessionStorage.getItem('courseId');

        if (!instructorId) {
            try {
                const response = await axios.get('http://localhost:5173/eval-api/me', {
                    withCredentials: true
                });
                instructorId = response.data.instructorId;
                sessionStorage.setItem('instructorId', instructorId);
            } catch (error) {
                console.error('Failed to fetch instructor details:', error);
                setError('Failed to fetch instructor details.');
                return;
            }
        }

        if (!courseId) {
            console.error('Course ID is missing from session storage.');
            setError('Course ID must be set in session storage.');
            return;
        }

        await setSessionData(courseId, instructorId);
    }, [setSessionData]);

    useEffect(() => {
        ensureSessionData();
    }, [ensureSessionData]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!effectiveCourseId) {
                setError('No course ID available.');
                return;
            }

            try {
                const response = await fetch(`http://localhost:5173/eval-api/students/show/${effectiveCourseId}`, { 
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const studentNames = data.map(student => `${student.firstName} ${student.lastName}`);
                setFiles(studentNames);
                setFilteredFiles(studentNames);
            } catch (error) {
                console.error('Error fetching students:', error);
                setError('An error occurred while fetching students.');
            }
        };

        fetchStudents();
    }, [effectiveCourseId]);

    useEffect(() => {
        const filtered = files.filter(file =>
            file.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFiles(filtered);
        setCurrentPage(1);
    }, [searchTerm, files]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFiles = filteredFiles.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

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

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <AIvaluateNavBarEval navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBarEval tab="students" />
                    <div className="main-margin">
                        <div className="portal-container">
                            <div className="top-bar">
                                <h1>Students</h1>
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
                            </div>
                            <div className="filetab">
                                {currentFiles.map((file, index) => (
                                    <div className="file-item" key={index}>
                                        <div className="file-name">{file}</div>
                                        <div className="file-icon"></div>
                                    </div>
                                ))}
                            </div>
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
    );
};

export default Students;