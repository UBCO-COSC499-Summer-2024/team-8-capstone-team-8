import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';

import { format, parseISO } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../GeneralStyling.css';
import '../PublishAssignment.css';
import '../ToastStyles.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';
import '../GeneralStyling.css';
import '../PublishAssignment.css';

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

    const fetchAssignment = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5173/eval-api/assignments/${assignmentId}`, {
                withCredentials: true
            });
            if (response.status === 200) {
                const { assignmentName, dueDate, criteria, isPublished } = response.data;
                setTitle(assignmentName);
                setDeadline(new Date(dueDate)); // Convert the dueDate to Date object
                setRubricContent(criteria);
                setIsPublished(isPublished);
                console.log("Fetched assignment:", response.data);
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
                console.log(`Assignment ${isPublished ? 'unpublished' : 'published'} successfully`);
            } else {
                console.error(`Failed to ${isPublished ? 'unpublish' : 'publish'} assignment:`, response);
            }
        } catch (error) {
            console.error(`Error ${isPublished ? 'unpublishing' : 'publishing'} assignment:`, error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const selectedFiles = Array.from(e.dataTransfer.files);
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
        try {
            await axios.put(`http://localhost:5173/eval-api/assignments/${assignmentId}`, {
                assignmentName: title,
                dueDate: deadline.toISOString(), // Convert Date object to ISO string
                criteria: rubricContent,
                courseId: courseId
            }, {
                withCredentials: true
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
                <SideMenuBarEval tab="rubrics"/>
                <div className="main-margin">
                    <div className="rubric-div">
                        <div className="top-bar">
                            <div className="back-btn-div">
                                <button className="main-back-button" onClick={() => navigate(-1)}><CircumIcon name="circle_chev_left"/></button>
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
                                <h2>Due:</h2>
                                <DatePicker
                                    selected={deadline}
                                    onChange={handleDeadlineChange}
                                    showTimeSelect
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    className="deadline-input"
                                />
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
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        className="file-upload-input" 
                                        onChange={handleFileChange}
                                        multiple 
                                    />
                                    <span>Click to add a file or drag your file here</span>
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
