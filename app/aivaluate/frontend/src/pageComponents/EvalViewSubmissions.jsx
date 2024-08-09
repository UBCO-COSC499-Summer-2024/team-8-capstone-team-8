import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import '../SearchBar.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';

const EvalViewSubmissions = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const { paramCourseId } = useParams();
    const courseId = sessionStorage.getItem('courseId') || paramCourseId;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [files, setFiles] = useState([]);

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
        } catch (error) {
            console.error('Failed to set session data:', error);
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
                return;
            }
        }
    
        if (!courseId) {
            console.error('Course ID is missing from session storage.');
            return;
        }
    
        await setSessionData(courseId, instructorId);
    }, [setSessionData]);

    useEffect(() => {
        ensureSessionData();
    }, [ensureSessionData]);    

    useEffect(() => {
        const fetchSubmissions = async () => {
            const courseId = sessionStorage.getItem('courseId') || paramCourseId;
            if (!courseId) {
                console.error('Course ID is missing.');
                return;
            }
            try {
                const response = await fetch(`/eval-api/courses/${courseId}/submissions`);
                if (response.ok) {
                    const data = await response.json();
                    setFiles(data);
                    console.log(data);
                } else {
                    console.error('Error fetching submissions:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching submissions:', error);
            }
        };
    
        fetchSubmissions();
    }, [paramCourseId]);    

    useEffect(() => {
        const filtered = files.filter(file =>
            (file.assignmentKey && file.assignmentKey.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (file.studentId && file.studentId.toString().includes(searchTerm))
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

    const navBarText = `${courseCode} - ${courseName}`;

    return (
        <div>
            <AIvaluateNavBarEval navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBarEval tab="submissions" />
                <div className="main-margin">
                    <div className="portal-container">
                        <div className="top-bar">
                            <h1>Student Submissions</h1>
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
                                file && (
                                    <div className="file-item" key={index}>
                                        <div className="folder-icon"><CircumIcon name="folder_on"/></div>
                                        <div className="file-name">{file.studentId} - {file.assignmentId} Submission</div>
                                        {file.isGraded && <div className="file-status">Marked as graded</div>}
                                    </div>
                                )
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

export default EvalViewSubmissions;
