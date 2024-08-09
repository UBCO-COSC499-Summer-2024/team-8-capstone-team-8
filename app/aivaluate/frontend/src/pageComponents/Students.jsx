import { useEffect, useState, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import '../SearchBar.css';
import AIvaluateNavBarEval from "../components/AIvaluateNavBarEval";
import SideMenuBarEval from '../components/SideMenuBarEval';

const Students = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const navBarText = `${courseCode} - ${courseName}`;

    const courseId = sessionStorage.getItem('courseId');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    const setSessionData = useCallback(async (courseId) => {
        try {
            await axios.post('http://localhost:5173/eval-api/set-course-only', {
                courseId
            }, {
                withCredentials: true
            });
            sessionStorage.setItem('courseId', courseId);
        } catch (error) {
            console.error('Failed to set session data:', error);
        }
    }, []);
    
    const ensureSessionData = useCallback(async () => {
        let courseId = sessionStorage.getItem('courseId');
    
        if (!courseId) {
            console.error('Course ID is missing from session storage.');
            return;
        }
    
        await setSessionData(courseId);
    }, [setSessionData]);
    
    useEffect(() => {
        ensureSessionData();
    }, [ensureSessionData]);    

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`http://localhost:5173/eval-api/students/show/${courseId}`, { 
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
    }, [courseId]);

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
                                    <div className="file-item-no-click" key={index}>
                                        <div className="file-name-no-click">{file}</div>
                                        <div className="file-icon-no-click"></div>
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
