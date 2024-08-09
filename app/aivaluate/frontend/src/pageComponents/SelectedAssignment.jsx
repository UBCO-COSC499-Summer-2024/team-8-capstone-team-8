import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import '../SearchBar.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';

const SelectedAssignment = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const courseId = sessionStorage.getItem('courseId');
    const navBarText = `${courseCode} - ${courseName}`;
    const navigate = useNavigate();
    const { assignmentId } = useParams(); // Assuming assignmentId is passed as a URL parameter
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [instructorId, setInstructorId] = useState('');
    const [gradesHidden, setGradesHidden] = useState(false);

    // Fetch grades hidden status
    const fetchGradesHidden = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5173/eval-api/assignments/${assignmentId}/grades-hidden`, {
                withCredentials: true
            });
    
            if (response.status === 200) {
                setGradesHidden(response.data.gradeHidden);
            } else {
                console.error('Failed to fetch grades hidden status:', response.data);
                toast.error('Failed to fetch grades hidden status.');
            }
        } catch (error) {
            console.error('Error fetching grades hidden status:', error);
            toast.error('Error fetching grades hidden status.');
        }
    }, [assignmentId]);

    // Fetch grades hidden status when component mounts
    useEffect(() => {
        fetchGradesHidden();
    }, [fetchGradesHidden]);

    const fetchSubmissions = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5173/eval-api/assignments/${assignmentId}/submissions`, {
                withCredentials: true
            });
    
            if (response.status === 200) {
                setSubmissions(response.data);
                setFilteredFiles(response.data);
                console.log(response.data);
            } else {
                console.error('Expected an array but got:', response.data);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('No submissions found for this assignment.');
                setSubmissions([]);
                setFilteredFiles([]);
            } else {
                console.error('Error fetching submissions:', error);
            }
        }
    }, [assignmentId]); 
    
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const { data: { instructorId } } = await axios.get('http://localhost:5173/eval-api/instructor/me', {
                    withCredentials: true
                });
                setInstructorId(instructorId);
            } catch (error) {
                console.error('There was an error fetching the instructor data:', error);
            }
        };

        fetchAdminData();
    }, []);
    
    useEffect(() => {
        fetchSubmissions();
    }, [assignmentId, fetchSubmissions]);       

    useEffect(() => {
        if (searchTerm) {
            const results = submissions.filter(file => {
                const studentId = file.studentId ? String(file.studentId) : '';
                const submissionFile = file.submissionFile ? String(file.submissionFile).toLowerCase() : '';
                return studentId.includes(searchTerm) || submissionFile.includes(searchTerm.toLowerCase());
            });
            setFilteredFiles(results);
        } else {
            setFilteredFiles(submissions);
        }
    }, [searchTerm, submissions]);

    // Calculates the current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFiles = filteredFiles.slice(indexOfFirstItem, indexOfLastItem);

    // This calculates the total number of pages based on the max number of items per page
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
        setCurrentPage(1); // Reset to first page on new search
    };

    const truncateFileName = (fileName, maxLength = 30) => {
        return fileName.length > maxLength 
            ? `${fileName.slice(0, maxLength)}...` 
            : fileName;
    };

    const handleMarkAssignment = (studentId, assignmentId, submissionFile, submissionLink) => {
        const fileName = submissionFile ? submissionFile.split('/').pop() : null;
        console.log("Navigating with fileName:", fileName);
        navigate(`/eval/${studentId}/${assignmentId}/grading`, { state: { fileName, submissionLink } });
    };

    const handleGradeWithAI = async () => {
        const courseId = sessionStorage.getItem('courseId');
    
        if (!instructorId || !courseId) {
            console.error('Instructor ID or Course ID is missing.');
            setError('Instructor ID or Course ID is missing.');
            return;
        }
    
        try {
            console.log('Sending request to grade with AI:', { instructorId, courseId });
            setIsLoading(true);
    
            const response = await axios.post(`http://localhost:5173/eval-api/ai/assignments/${assignmentId}/process-submissions`, {
                instructorId,
                courseId
            }, {
                withCredentials: true
            });
    
            if (response.status === 200) {
                toast.success('Submissions graded successfully.');
                fetchSubmissions();
            } else {
                console.error('Failed to grade submissions:', response.data);
                toast.error('Failed to grade submissions.');
            }
        } catch (error) {
            console.error('Error grading submissions:', error);
            if (!error.response) {
                toast.error('AI server is currently unreachable. Please check your internet connection or try again later.');
            } else {
                toast.error('Failed to grade submissions. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle hiding grades
    const handleHideGrades = async () => {
        // Verify the current state before proceeding
        if (gradesHidden) {
            toast.error('Grades are already hidden.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5173/eval-api/assignments/${assignmentId}/hide-grades`, {}, {
                withCredentials: true
            });

            if (response.status === 200) {
                toast.success('Grades hidden successfully.');
                setGradesHidden(true); // Update state to reflect change
            } else {
                console.error('Failed to hide grades:', response.data);
                toast.error('Failed to hide grades.');
            }
        } catch (error) {
            console.error('Error hiding grades:', error);
            toast.error('Failed to hide grades. Please try again.');
        }
    };

    // Function to handle releasing grades
    const handleReleaseGrades = async () => {
        // Verify the current state before proceeding
        if (!gradesHidden) {
            toast.error('Grades are already released.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5173/eval-api/assignments/${assignmentId}/release-grades`, {}, {
                withCredentials: true
            });

            if (response.status === 200) {
                toast.success('Grades released successfully.');
                setGradesHidden(false); // Update state to reflect change
            } else {
                console.error('Failed to release grades:', response.data);
                toast.error('Failed to release grades.');
            }
        } catch (error) {
            console.error('Error releasing grades:', error);
            toast.error('Failed to release grades. Please try again.');
        }
    };

    return (
        <div>
            <AIvaluateNavBarEval navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBarEval tab="assignments" />
                    <div className="main-margin">
                        <div className="portal-container">
                            <div className="top-bar">
                                <div className="back-btn-div">
                                    <button className="main-back-button" onClick={() => navigate(-1)}><CircumIcon name="circle_chev_left"/></button>
                                </div>
                                <div className="float-left">
                                    <div className="title-text"><h1>All Submissions</h1></div>
                                </div>
                                <div className="float-right">
                                    <button className="grades-button" onClick={handleGradeWithAI}>
                                        Grade With AI
                                    </button>
                                    <button className="grades-button" onClick={handleHideGrades}>
                                        Hide Grades
                                    </button>
                                    <button className="grades-button" onClick={handleReleaseGrades}>
                                        Publish Grades
                                    </button>
                                </div>
                            </div>
                            {isLoading && (
                            <div className="spinner-container">
                                <ClipLoader color="#123abc" loading={isLoading} size={50} />
                                <p className="loading-text primary-color-text">AI Grading in Progress...</p>
                            </div>
                            )}
                            <div className="filetab">
                                {currentFiles.map((file, index) => (
                                <div className="file-item" key={index} onClick={() => handleMarkAssignment(file.studentId, file.assignmentId, file.submissionFile, file.submissionLink)}>
                                    <div className="folder-icon"><CircumIcon name="folder_on"/></div>
                                    <div className="file-name"><div className="file-name-text">Student ID: {file.studentId} - {file.submissionFile ? truncateFileName(file.submissionFile.split('/').pop()) : file.submissionLink}</div></div>
                                    {file.isGraded && <div className="file-status">*Marked as graded</div>}
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
            <ToastContainer />
        </div>
    );
};

export default SelectedAssignment;
