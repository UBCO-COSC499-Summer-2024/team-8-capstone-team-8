import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import '../Auth.css';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';

const Rubrics = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const navBarText = `${courseCode} - ${courseName}`;

    const navigate = useNavigate();
    const { courseId } = useParams();
    const courseIdFromSession = sessionStorage.getItem('courseId');
    const [effectiveCourseId, setEffectiveCourseId] = useState(courseIdFromSession || courseId);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [rubrics, setRubrics] = useState([]);
    const [courseDetails, setCourseDetails] = useState({ courseCode: '', courseName: '' });

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
        const fetchCourseDetails = async () => {
            try {
                const courseId = sessionStorage.getItem('courseId');
                const response = await axios.get(`/eval-api/rubrics/${courseId}`);
                if (response.status === 200) {
                    const data = response.data;
                    setCourseDetails(data);
                } else {
                    console.error('Error fetching course details:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };
    
        const fetchRubrics = async () => {
            try {
                const courseId = sessionStorage.getItem('courseId');
                const response = await axios.get(`/eval-api/rubrics/${courseId}`);
                if (response.status === 200) {
                    const data = response.data;
                    setRubrics(data);
                    setFilteredFiles(data);
                } else {
                    console.error('Error fetching rubrics:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching rubrics:', error);
            }
        };
    
        if (effectiveCourseId) {
            fetchCourseDetails();
            fetchRubrics();
        } else {
            console.error('No course ID available to fetch data.');
        }
    }, [effectiveCourseId]);        

    useEffect(() => {
        const filtered = rubrics.filter(file =>
            file.criteria.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFiles(filtered);
        setCurrentPage(1);
    }, [searchTerm, rubrics]);

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

    const handleRubric = (assignmentRubricId) => {
        navigate(`/eval/rubric/${assignmentRubricId}`);
    };

    return (
        <div>
            <AIvaluateNavBarEval navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBarEval tab="rubrics" />
                    <div className="main-margin">
                        <div className="portal-container">
                            <div className="top-bar">
                                <h1>Your Rubrics</h1>
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
                            {rubrics.length === 0 ? (
                                <div className="no-rubrics primary-color-text">You currently have no rubrics</div>
                            ) : (
                                <div className="filetab">
                                    {currentFiles.map((file, index) => (
                                        <div className="file-item" key={index} onClick={() => handleRubric(file.assignmentRubricId)}>
                                            <div className="folder-icon"><CircumIcon name="file_on"/></div>
                                            <div className="file-name">{file.rubricName}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
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

export default Rubrics;
