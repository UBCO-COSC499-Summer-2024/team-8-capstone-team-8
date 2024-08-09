import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AssignmentProf.css';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import '../SearchBar.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';

const BrowseAllAssignmentsEval = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const courseId = sessionStorage.getItem('courseId');
    const navBarText = `${courseCode} - ${courseName}`;
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [totalAssignments, setTotalAssignments] = useState(0);
    const [error, setError] = useState(null);
    const [deleteVisible, setDeleteVisible] = useState(null);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        if (searchTerm) {
            const filtered = assignments.filter(assignment =>
                assignment.assignmentName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAssignments(filtered);
        } else {
            setFilteredAssignments(assignments);
        }
        setCurrentPage(1);
    }, [searchTerm, assignments]);

    useEffect(() => {
        if (!courseId) {
            console.error('Course ID is not set in session storage');
            return;
        }

        const fetchTotalAssignments = async () => {
            try {
                const response = await axios.get(`http://localhost:5173/eval-api/assignments/count/${courseId}/all`, {
                    withCredentials: true
                });
                if (response.status === 200) {
                    setTotalAssignments(response.data.totalAssignments);
                } else {
                    console.error('Failed to fetch total assignments:', response);
                }
            } catch (error) {
                console.error('Error fetching total assignments:', error);
            }
        };

        const fetchAssignments = async () => {
            try {
                const response = await axios.get(`http://localhost:5173/eval-api/assignments/course/${courseId}/all`, {
                    withCredentials: true
                });
                if (response.status === 200) {
                    setAssignments(response.data);
                    setFilteredAssignments(response.data);
                    setError(null);
                } else {
                    console.error('Expected an array but got:', response.data);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setError('No assignments found for this course.');
                    setAssignments([]);
                    setFilteredAssignments([]);
                } else {
                    console.error('Error fetching assignments:', error);
                }
            }
        };

        fetchTotalAssignments();
        fetchAssignments();
    }, [courseId]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFiles = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

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

    const handleAssignmentSelect = (assignmentId) => {
        navigate(`/eval/published/${assignmentId}`);
    };

    const toggleDeleteButton = (index) => {
        setDeleteVisible(deleteVisible === index ? null : index);
    };

    const confirmDeleteAssignment = (assignmentId) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleConfirmDelete = async () => {
                    try {
                        await axios.delete(`http://localhost:5173/eval-api/assignments/${assignmentId}`, {
                            withCredentials: true
                        });
                        setAssignments(assignments.filter(assignment => assignment.assignmentId !== assignmentId));
                        setFilteredAssignments(filteredAssignments.filter(assignment => assignment.assignmentId !== assignmentId));
                        setDeleteVisible(null);
                        toast.success('Assignment deleted successfully.');
                    } catch (error) {
                        console.error('Error deleting assignment:', error);
                        toast.error('Failed to delete assignment.');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Confirm Deletion</h1>
                        <p>Are you sure you want to delete this assignment?</p>
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={handleConfirmDelete} className="cancel-button">Confirm</button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay"
        });
    };

    return (
        <div>
            <ToastContainer />
            <AIvaluateNavBarEval navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBarEval tab="assignments" />
                <div className="main-margin">
                    <div className="portal-container">
                        <div className="top-bar">
                            <div className="back-btn-div">
                                <button className="main-back-button" onClick={() => navigate(-1)}>
                                    <CircumIcon name="circle_chev_left" />
                                </button>
                            </div>
                            <div className="title-text"><h1>All Assignments</h1></div>
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
                                    <div className="file-name" onClick={() => handleAssignmentSelect(file.assignmentId)}>
                                        {file.assignmentName}
                                    </div>
                                    <div className="file-status">{file.isPublished ? 'Published' : 'Unpublished'}</div>
                                    {deleteVisible === index && (
                                        <button
                                            className="delete-assign-button"
                                            onClick={() => confirmDeleteAssignment(file.assignmentId)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                    <div className="file-icon" onClick={() => toggleDeleteButton(index)}>
                                        <CircumIcon name="circle_more" />
                                    </div>
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

export default BrowseAllAssignmentsEval;
