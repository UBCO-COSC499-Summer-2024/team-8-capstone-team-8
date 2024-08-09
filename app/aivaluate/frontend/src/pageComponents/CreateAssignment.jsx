import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../CreateAssignment.css';
import '../GeneralStyling.css';
import '../ToastStyles.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';

axios.defaults.withCredentials = true;

const CreateAssignment = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const courseId = sessionStorage.getItem('courseId');
    const navBarText = `${courseCode} - ${courseName}`;
    const navigate = useNavigate();
    const availableRubricsRef = useRef(null);
    const criteriaRef = useRef(null);
    const [assignment, setAssignment] = useState({
        assignmentName: '',
        dueDate: new Date(),
        criteria: '',
        maxObtainableGrade: '',
        courseId: sessionStorage.getItem('courseId'),
        assignmentKey: ''
    });

    const [rubrics, setRubrics] = useState([]);
    const [assignmentKey, setAssignmentKey] = useState(null);
    const [dragging, setDragging] = useState(false);

    const setSessionData = useCallback(async (courseId, instructorId) => {
        try {
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
            toast.error('Failed to set session data.');
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
                console.log('Instructor ID fetched and set:', instructorId);
            } catch (error) {
                console.error('Failed to fetch instructor details:', error);
                toast.error('Failed to fetch instructor details.');
                return;
            }
        }
    
        if (!courseId) {
            console.error('Course ID is missing from session storage.');
            toast.error('Course ID is missing from session storage.');
            return;
        }
    
        await setSessionData(courseId, instructorId);
    }, [setSessionData]);
    
    useEffect(() => {
        ensureSessionData();
    }, [ensureSessionData]);

    useEffect(() => {
        sessionStorage.setItem('courseId', courseId);
    }, [courseId]);    

    useEffect(() => {
        const instructorId = sessionStorage.getItem('instructorId');
        if (instructorId) {
            axios.get(`http://localhost:5173/eval-api/rubrics/all/${instructorId}`)
                .then(response => {
                    setRubrics(response.data);
                })
                .catch(error => {
                    console.error('Error fetching rubrics:', error);
                    toast.error('Error fetching rubrics.');
                });
        } else {
            console.error('Instructor ID is missing from session storage.');
            // toast.error('Instructor ID is missing from session storage.');
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAssignment(prevAssignment => ({
            ...prevAssignment,
            [name]: value || ''
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const allowedExtensions = /(\.css|\.html|\.js|\.jsx)$/i;

        if (file && file.size === 0) {
            toast.error('Empty files are not allowed.');
            return false;
        }

        if (file && !allowedExtensions.exec(file.name)) {
            toast.error('Please upload file having extensions .css, .html, .js, or .jsx only.');
            return false;
        } else {
            setAssignmentKey(file);
            setAssignment(prevAssignment => ({
                ...prevAssignment,
                assignmentKey: file.name || ''
            }));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const selectedFiles = Array.from(e.dataTransfer.files);
        if (selectedFiles.length > 0) {
            handleFileChange({ target: { files: selectedFiles } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleConfirmSubmit = async () => {
        await ensureSessionData();
        
        if (!assignment.assignmentName || !assignment.criteria || !assignment.dueDate || !assignment.maxObtainableGrade) {
            toast.error('Please fill in all fields.');
            return;
        }
        const dueDate = new Date(assignment.dueDate);
        const today = new Date();
    
        if (dueDate < today) {
            toast.error('Due date cannot be in the past.');
            return;
        }
    
        try {
            const instructorId = sessionStorage.getItem('instructorId');
            const courseId = sessionStorage.getItem('courseId');
            const response = await axios.post('http://localhost:5173/eval-api/assignments', {
                ...assignment,
                instructorId,
                courseId,
                rubricName: 'Default Rubric',
            });
            toast.success('Assignment created successfully!');
            if (assignmentKey) {
                const formData = new FormData();
                formData.append('assignmentKey', assignmentKey);
                formData.append('instructorId', instructorId);
                formData.append('courseId', courseId);
                formData.append('assignmentId', response.data.assignmentId);
    
                await axios.post(`http://localhost:5173/eval-api/assignments/${response.data.assignmentId}/solutions`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Solution added successfully!');
            }
            navigate(`/eval/assignments/${courseId}`);
        } catch (error) {
            console.error('Error creating assignment:', error);
            toast.error('Error creating assignment.');
            if (error.response && error.response.data) {
                console.error('Error response data:', error.response.data);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleConfirm = async () => {
                    await handleConfirmSubmit();
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Confirm to create assignment</h1>
                        <p>Are you sure you want to create this assignment? Assignment grade cannot be changed after an assignment is created. </p>
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={handleConfirm} className="cancel-button">Confirm</button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay",
        });
    };

    const handleUsePastRubricClick = (e) => {
        e.preventDefault();
        if (availableRubricsRef.current) {
            availableRubricsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleRubricClick = (criteria) => {
        setAssignment(prevAssignment => ({
            ...prevAssignment,
            criteria: criteria
        }));
        if (criteriaRef.current) {
            criteriaRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div>
            <ToastContainer />
            <AIvaluateNavBarEval navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBarEval tab="assignments" />
                <div className="main-margin">
                    <div className="top-bar">
                        <div className="back-btn-div">
                            <button className="main-back-button" onClick={() => navigate(-1)}><CircumIcon name="circle_chev_left" /></button>
                        </div>
                        <div className="title-text"><h1>Create Assignment</h1></div>
                    </div>
                    <div className="scrollable-div">
                        <div className="create-assignment-content">
                            <form onSubmit={handleSubmit}>
                                <label htmlFor="assignmentName">Assignment Name:</label>
                                <input
                                    type="text"
                                    id="assignmentName"
                                    name="assignmentName"
                                    value={assignment.assignmentName || ''}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="criteria">Assignment Rubric</label>
                                <textarea
                                    id="criteria"
                                    name="criteria"
                                    ref={criteriaRef}
                                    placeholder="Enter assignment expectation, marking criteria, and what the student is expected to submit. Please be as detailed as possible. Markdown format is recommended. Example: student must submit a html file (2 points), a title which says 'Hello World' (1 point), and a paragraph with the text 'Hello World' (2 points)."
                                    value={assignment.criteria}
                                    onChange={handleInputChange}
                                />
                                <div className="rubric-options">
                                    <span>or</span>
                                    <button type="button" className="use-past-rubric" onClick={handleUsePastRubricClick}>Use a past Rubric</button>
                                </div>
                                <label htmlFor="dueDate">Due Date:</label>
                                <DatePicker
                                    selected={assignment.dueDate}
                                    onChange={(date) => setAssignment(prevAssignment => ({ ...prevAssignment, dueDate: date }))}
                                    showTimeSelect
                                    dateFormat="MMMM d 'at' h:mmaaa"
                                    className="date-picker"
                                    customInput={
                                        <input 
                                            type="text" 
                                            className="deadline-input" 
                                            value={assignment.dueDate ? assignment.dueDate.toLocaleString() : ''}
                                            readOnly
                                        />
                                    }
                                />
                                <label htmlFor="maxObtainableGrade">Max Points:</label>
                                <input
                                    type="number"
                                    id="maxObtainableGrade"
                                    name="maxObtainableGrade"
                                    value={assignment.maxObtainableGrade}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="solutionFile">Add a solution <span className="optional">*Not required</span></label>
                                <div
                                    className={`file-upload ${dragging ? 'dragging' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    <span>Drag files here or Click to browse files</span>
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        className="file-upload-input" 
                                        name="assignmentKey"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                {assignmentKey && (
                                <div className="file-preview">
                                    <p>Uploaded File: {assignmentKey.name}</p>
                                </div>
                                )}
                                <div className="form-footer">
                                    <button type="submit" className="post-button">Post</button>
                                </div>
                            </form>
                            <div className="available-rubrics" ref={availableRubricsRef}>
                                <h3>Available Rubrics</h3>
                                <ul>
                                    {rubrics.length > 0 ? (
                                        rubrics.map(rubric => (
                                            <li key={rubric.assignmentRubricId} onClick={() => handleRubricClick(rubric.criteria)}>
                                                {rubric.rubricName}
                                            </li>
                                        ))
                                    ) : (
                                        <li>No rubrics available</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAssignment;
