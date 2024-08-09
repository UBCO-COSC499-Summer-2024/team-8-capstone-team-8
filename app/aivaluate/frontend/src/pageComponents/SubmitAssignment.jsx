import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import remarkGfm from 'remark-gfm';
import '../GeneralStyling.css';
import '../SubmitAssignment.css';
import '../ToastStyles.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import SideMenuBar from '../components/SideMenuBar';

const SubmitAssignment = () => {
    const navigate = useNavigate();
    const { courseId, assignmentId } = useParams();
    const [files, setFiles] = useState([]);
    const [isGraded, setIsGraded] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [assignmentDetails, setAssignmentDetails] = useState({
        assignmentName: '',
        rubricName: '',
        criteria: '',
        dueDate: '',
        maxObtainableGrade: '',
        InstructorAssignedFinalGrade: '',
        assignmentDescription: '',
        AIFeedbackText: '',
        InstructorFeedbackText: '',
        isGraded: false // Include isGraded in the state
    });
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [submissionLink, setSubmissionLink] = useState('');

    const fetchAssignmentDetails = useCallback(async () => {
        try {
            const response = await axios.get(`/stu-api/assignment/${courseId}/${assignmentId}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            const data = response.data;
            setAssignmentDetails(data);
            setIsGraded(data.isGraded);
        } catch (error) {
            console.error('Error fetching assignment details:', error);
        } finally {
            setLoading(false);
        }
    }, [courseId, assignmentId]);

    const fetchUploadedFiles = useCallback(async () => {
        try {
            const response = await axios.get(`/stu-api/submission/${courseId}/${assignmentId}`);
            setUploadedFiles(response.data);
        } catch (err) {
            console.error('Error fetching uploaded files:', err);
        }
    }, [courseId, assignmentId]);

    useEffect(() => {
        fetchAssignmentDetails();
        fetchUploadedFiles();
    }, [fetchAssignmentDetails, fetchUploadedFiles]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const allowedExtensions = /(\.css|\.html|\.js|\.jsx)$/i;
        const emptyFiles = selectedFiles.filter(file => file.size === 0);
        
        if (emptyFiles.length > 0) {
            toast.error('Empty files are not allowed.');
            setErrorMessage('Empty files are not allowed.');
            setFiles([]);
            return;
        }

        if (selectedFiles.length > 7) {
            toast.error('You can only upload a maximum of 7 files.');
            setErrorMessage('You can only upload a maximum of 7 files.');
            setFiles([]);
            return;
        }

        const invalidFiles = selectedFiles.filter(file => !allowedExtensions.exec(file.name));
        if (invalidFiles.length > 0) {
            toast.error('Please upload files with extensions .css, .html, .js, or .jsx only.');
            setErrorMessage('Please upload files with extensions .css, .html, .js, or .jsx only.');
            setFiles([]);
        } else {
            setErrorMessage('');
            setFiles(selectedFiles);
            setSubmissionLink('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const selectedFiles = Array.from(e.dataTransfer.files);
        const emptyFiles = selectedFiles.filter(file => file.size === 0);
        if (emptyFiles.length > 0) {
            toast.error('Empty files are not allowed.');
            setErrorMessage('Empty files are not allowed.');
            setFiles([]);
            return;
        }

        if (selectedFiles.length > 7) {
            toast.error('You can only upload a maximum of 7 files.');
            setErrorMessage('You can only upload a maximum of 7 files.');
            setFiles([]);
            return;
        }
        handleFileChange({ target: { files: selectedFiles } });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleLinkChange = (e) => {
        const linkValue = e.target.value;
        setSubmissionLink(linkValue);
    
        if (linkValue) {
            setFiles([]);
            setErrorMessage(''); 
        }
    };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (files.length === 0 && !submissionLink) {
            setErrorMessage('Please select files or provide a submission link.');
            return;
        }
        
        const allowedPlatform = 'gist.github.com';

        if (submissionLink) {
            const url = new URL(submissionLink.startsWith('http://') || submissionLink.startsWith('https://') 
                ? submissionLink 
                : `https://${submissionLink}`);
                const isAllowed = url.hostname.includes(allowedPlatform);
    
            if (!isAllowed) {
                toast.error('Only links from Github Gists are allowed.');
                return;
            }
        }
    
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        if (submissionLink && !submissionLink.startsWith('http://') && !submissionLink.startsWith('https://')) {
            formData.append('submissionLink', `https://${submissionLink}`);
        } else {
            formData.append('submissionLink', submissionLink);
        }
    
        try {
            await axios.post(`/stu-api/upload/${courseId}/${assignmentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Submission successful');
            setFiles([]);
            setSubmissionLink('');
            fetchUploadedFiles();
        } catch (err) {
            toast.error('Submission failed. Please try again.');
            console.error('Submission failed:', err);
            setErrorMessage('Submission failed. Please try again.');
        }
    };    

    if (loading) {
        return <div>Loading...</div>;
    }

    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const navBarText = `${courseCode} - ${courseName}`;

    const formatDueDate = (dueDate) => {
        const date = parseISO(dueDate);
        return format(date, "MMMM do 'at' h:mmaaa");
    };

    return (
        <div>
            <ToastContainer /> 
            <AIvaluateNavBar navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBar tab="assignments" />
                <div className="main-margin">
                    <div className="assignment-container secondary-colorbg">
                        <div className="top-bar">
                            <div className="drop-top">
                                <div className="button-box-div">
                                    <button className="main-back-button" onClick={() => navigate(-1)}>
                                        <CircumIcon name="circle_chev_left" className="back-button-icon-size" />
                                    </button>
                                </div>
                                <div className="header-content">
                                    <h1 className="assignment-title primary-color-text">{assignmentDetails.assignmentName}</h1>
                                </div>
                            </div>
                        </div>
                        <div className="scrollable-div">
                            <p className="file-upload-display">
                                {uploadedFiles.length > 0 ? (
                                    <div>
                                        <b>Uploaded Files: </b>
                                        {uploadedFiles.flatMap(submission => (
                                            Array.isArray(submission.files) ? submission.files.map((file, index) => (
                                                    <span> {String(file).split('/').pop()} |</span>
                                            )) : null
                                        ))}
                                    </div>
                                ) : (
                                    <p></p>
                                )}
                            </p>
                            <div className="due-date-div">
                                <div className="due-date-submit-assign"><h3>Due: {formatDueDate(assignmentDetails.dueDate)}</h3></div>
                                <div className="empty"> </div>
                                <div className="score">
                                    <h3>Score: {assignmentDetails.InstructorAssignedFinalGrade}/{assignmentDetails.maxObtainableGrade}</h3>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="file-upload">
                                    <label htmlFor="file-upload" className="file-upload-label">
                                        Click here to browse files
                                    </label>
                                    <div
                                        className={`file-upload-inner ${dragging ? 'dragging' : ''}`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        style={{ 
                                            pointerEvents: submissionLink ? 'none' : 'auto', 
                                            opacity: submissionLink ? 0.5 : 1 
                                        }}
                                    >
                                        <input 
                                            type="file" 
                                            id="file-upload" 
                                            className="file-upload-input" 
                                            name="files"
                                            onChange={handleFileChange}
                                            multiple 
                                            disabled={!!submissionLink}
                                        />
                                    </div>
                                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                                </div>
                                <p className="file-upload-display-2">
                                {files.length > 0 ? (
                                    <div>
                                        <b>Files to be uploaded: </b> 
                                        {files.map((file, index) => (
                                            <span> {file.name} |</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p></p>
                                )}
                                </p>
                        
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="Have a link? Upload it here! Please ensure the access is public."
                                        className="link-upload"
                                        onChange={handleLinkChange}
                                        value={submissionLink}
                                        disabled={files.length > 0}
                                        style={{ 
                                            pointerEvents: files.length > 0 ? 'none' : 'auto', 
                                            opacity: files.length > 0 ? 0.5 : 1 
                                        }}
                                     />
                                </div>
                                <div className="submit-right">
                                    <h2 className="assignment-text">Assignment Rubric/Details</h2>
                                    <div className="empty"> </div>
                                    <button className="submit-button rborder" type="submit" disabled={isGraded}>Submit</button>
                                </div>
                            </form>
                            <div className="assignment-details">
                                <div className="details-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{assignmentDetails.criteria}</ReactMarkdown>
                                </div>
                            </div>
                            <h2>Feedback</h2>
                            <div className="feedback-container">
                                {typeof assignmentDetails.InstructorFeedbackText === 'string' && assignmentDetails.InstructorFeedbackText.trim().length > 0 ? (
                                    <div className="feedback">
                                        <div className="score-class">
                                            <div className="empty"> </div>
                                        </div>
                                        <div className="both-feedback">
                                            <div className="feedback-text">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{assignmentDetails.InstructorFeedbackText}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <h3 className="no-feedback">No feedback available yet...</h3>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitAssignment;
