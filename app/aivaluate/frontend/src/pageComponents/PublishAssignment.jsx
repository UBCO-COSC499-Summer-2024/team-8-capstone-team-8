import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';
import '../GeneralStyling.css';
import '../PublishAssignment.css';
import '../ToastStyles.css';

const PublishAssignment = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const courseId = sessionStorage.getItem('courseId');
    const navBarText = `${courseCode} - ${courseName}`;
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [deadline, setDeadline] = useState(new Date());
    const [rubricContent, setRubricContent] = useState("");
    const [isEdited, setIsEdited] = useState(false);
    const [isPublished, setIsPublished] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const [file, setFile] = useState(null);

    const setSessionData = useCallback(async (courseId, instructorId) => {
        try {
            await axios.post('http://localhost:5173/eval-api/set-course', {
                courseId,
                instructorId
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

    const fetchAssignment = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5173/eval-api/assignments/${assignmentId}`, {
                withCredentials: true
            });
            if (response.status === 200) {
                const { assignmentName, dueDate, criteria, isPublished } = response.data;
                setTitle(assignmentName);
                setDeadline(new Date(dueDate));
                setRubricContent(criteria);
                setIsPublished(isPublished);
            } else {
                console.error('Failed to fetch assignment:', response);
            }
        } catch (error) {
            console.error('Error fetching assignment:', error);
        }
    }, [assignmentId]);

    useEffect(() => {
        fetchAssignment();
    }, [fetchAssignment]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setIsEdited(true);
    };

    const handleDeadlineChange = (date) => {
        setDeadline(date);
        setIsEdited(true);
    };

    const handleContentChange = (e) => {
        setRubricContent(e.target.value);
        setIsEdited(true);
    };

    const handleViewSubmissions = () => {
        navigate(`/eval/selected/${assignmentId}`);
    };

    const handlePublishToggle = async () => {
        try {
            const response = await axios.put(`http://localhost:5173/eval-api/assignments/${assignmentId}/${isPublished ? 'unpublish' : 'publish'}`, {}, {
                withCredentials: true
            });
            if (response.status === 200) {
                fetchAssignment();
            } else {
                console.error(`Failed to ${isPublished ? 'unpublish' : 'publish'} assignment:`, response);
            }
        } catch (error) {
            console.error(`Error ${isPublished ? 'unpublishing' : 'publishing'} assignment:`, error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size === 0) {
            toast.error('Empty files are not allowed.');
            return;
        }
        setFile(selectedFile);
        setFiles([selectedFile]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const selectedFiles = Array.from(e.dataTransfer.files);
        const emptyFiles = selectedFiles.filter(file => file.size === 0);
        if (emptyFiles.length > 0) {
            toast.error('Empty files are not allowed.');
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

    const handleSubmitChanges = async () => {
        const formData = new FormData();
        formData.append('assignmentName', title);
        formData.append('dueDate', deadline.toISOString());
        formData.append('criteria', rubricContent || "");
        formData.append('courseId', courseId);
        formData.append('assignmentId', assignmentId);
        if (file) {
            formData.append('assignmentKey', file);
        }
    
        console.log('Submitting the following form data:');
        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });
    
        try {
            await axios.put(`http://localhost:5173/eval-api/assignments/${assignmentId}`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsEdited(false);
            toast.success('Assignment updated successfully');
        } catch (error) {
            console.error('Error updating assignment:', error);
            toast.error('Failed to update assignment');
        }
    };    

    const formatDueDate = (dueDate) => {
        const date = parseISO(dueDate);
        return format(date, "MMMM do 'at' h:mmaaa");
    };

    return (
        <div>
            <AIvaluateNavBarEval navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBarEval tab="assignments" />
                <div className="main-margin">
                    <div className="rubric-div">
                        <div className="top-bar">
                            <div className="back-btn-div">
                                <button className="main-back-button" onClick={() => navigate(-1)}><CircumIcon name="circle_chev_left" /></button>
                            </div>
                            <input 
                                type="text" 
                                className="title-input" 
                                value={title} 
                                onChange={handleTitleChange} 
                            /> 
                            <p className="click-to-edit">Click to edit</p>
                        </div>
                        <div>
                            <div className="deadline">
                                <div className="center-deadline">
                                    <h2>Due:</h2>
                                    <DatePicker
                                        selected={deadline}
                                        onChange={handleDeadlineChange}
                                        showTimeSelect
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        className="deadline-input"
                                    />
                                </div>
                                <p className="click-to-edit">Click to edit</p>
                                <button className="assignment-button" onClick={handleViewSubmissions}>
                                    View Submissions
                                </button>
                                <button className="assignment-button" onClick={handlePublishToggle}>
                                    {isPublished ? 'Unpublish Assignment' : 'Publish Assignment'}
                                </button>
                            </div>
                            <div className="main-text">
                                <textarea
                                    className="rubric-text"
                                    value={rubricContent}
                                    onChange={handleContentChange}
                                />
                            </div>
                            <p className="click-to-edit2">Click to edit</p>
                            <div className="submitFile">
                                <div
                                    className={`file-upload ${dragging ? 'dragging' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <label htmlFor="file-upload" className="file-upload-label">
                                        <span>Click to add a file or drag your file here</span>
                                        <input 
                                            type="file" 
                                            id="file-upload" 
                                            className="file-upload-input" 
                                            onChange={handleFileChange} 
                                        />
                                    </label>
                                </div>
                                {files.length > 0 && (
                                    <div className="file-preview">
                                        <h3>Selected Files:</h3>
                                        <ul>
                                            {files.map((file, index) => (
                                                <li key={index}>{file.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="center-button">
                                <button className="assignment-button2" onClick={handleSubmitChanges}>
                                    Submit Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default PublishAssignment;
