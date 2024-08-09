import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';
import '../CourseHome.css';
import '../GeneralStyling.css';
import '../ToastStyles.css';
import AssignTaModal from './AssignTaModal';
import CourseEditModal from './CourseEditModal';

const CourseHome = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState({});
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTaModalOpen, setIsTaModalOpen] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [loading, setLoading] = useState(true);
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
        axios.get(`http://localhost:5173/eval-api/courses/${courseId}`)
            .then(response => {
                setCourse(response.data);
                setIsArchived(response.data.isArchived);
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch course details', error);
                navigate('/eval/dashboard');
            });
    }, [courseId, navigate]);

    const handleEditCourse = () => {
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleTaModal = () => {
        setIsTaModalOpen(true);
    };

    const closeTaModal = () => {
        setIsTaModalOpen(false);
    };

    const saveCourseEdits = (editedCourse) => {
        axios.put(`http://localhost:5173/eval-api/courses/${courseId}`, editedCourse)
            .then(response => {
                setCourse(response.data);
                closeEditModal();
                toast.success('Course updated successfully');
            })
            .catch(error => {
                console.error('Failed to update course', error);
                toast.error('Failed to update course');
            });
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        console.log(`menu open - ${!menuOpen}`);
    };

    const handleArchiveCourse = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleArchive = async () => {
                    try {
                        const response = await axios.put(`http://localhost:5173/eval-api/courses/${courseId}/archive`);
                        setIsArchived(true);
                        toast.success('Course archived successfully');
                    } catch (error) {
                        console.error('Failed to archive course', error);
                        toast.error('Failed to archive course');
                    }
                    onClose();
                };

                const handleUnarchive = async () => {
                    try {
                        const response = await axios.put(`http://localhost:5173/eval-api/courses/${courseId}/unarchive`);
                        setIsArchived(false);
                        toast.success('Course unarchived successfully');
                    } catch (error) {
                        console.error('Failed to unarchive course', error);
                        toast.error('Failed to unarchive course');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>{isArchived ? 'Unarchive Course' : 'Archive Course'}</h1>
                        <p>
                            {isArchived
                                ? 'Are you sure you want to unarchive this course? Unarchiving this course will add it back to the active courses list.'
                                : 'Are you sure you want to archive this course? Archiving this course will remove it from the active courses list.'}
                        </p>
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={isArchived ? handleUnarchive : handleArchive} className="confirm-button">
                                {isArchived ? 'Unarchive' : 'Archive'}
                            </button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay",
        });
    };

    const handleDeleteCourse = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleDelete = async () => {
                    try {
                        const response = await axios.delete(`http://localhost:5173/eval-api/courses/${courseId}`);
                        toast.success('Course deleted successfully');
                        navigate('/eval/dashboard');
                    } catch (error) {
                        console.error('Failed to delete course', error);
                        toast.error('Failed to delete course');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Delete Course</h1>
                        <p>
                            Are you sure you want to delete this course? Deleting this course will remove all associated assignments, rubrics, and student grades permanently.
                        </p>
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={handleDelete} className="confirm-button">Delete</button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay",
        });
    };

    const handleAiTest = () => {
        navigate('/eval/ai-test');
    };

    const navBarText = `${courseCode} - ${courseName}`;

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <ToastContainer />
            <AIvaluateNavBarEval navBarText={navBarText} tab="home"/>
            <div className="filler-div">
                <SideMenuBarEval tab='management' />
                <div className="main-margin">
                    <div className="top-bar">
                        <h1>Course Management</h1>
                    </div>
                    <div>
                        <button className="course-button" onClick={handleEditCourse}>Edit Course</button>
                        <CourseEditModal isOpen={isEditModalOpen} onClose={closeEditModal} course={course} onSave={saveCourseEdits} />
                        <br />
                        <button className="course-button" onClick={handleTaModal}>Assign TA</button>
                        <AssignTaModal isOpen={isTaModalOpen} onClose={closeTaModal} courseId={courseId} />
                        <br />
                        <button className="course-button" onClick={handleArchiveCourse}>
                            {isArchived ? 'Unarchive Course' : 'Archive Course'}
                        </button>
                        <br />
                        <button className="course-button" onClick={handleDeleteCourse}>Delete Course</button>
                        <br />
                        <button className="course-button" onClick={handleAiTest}>AI Test</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseHome;
