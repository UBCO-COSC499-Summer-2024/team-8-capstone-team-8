import CircumIcon from "@klarr-agency/circum-icons-react";
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import '../SearchBar.css';
import AIvaluateNavBarAdmin from '../components/AIvaluateNavBarAdmin';
import SideMenuBarAdmin from '../components/SideMenuBarAdmin';

const EvaluatorManager = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [deletedEvaluators, setDeletedEvaluators] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvaluators = async () => {
        try {
            const response = await fetch('http://localhost:5173/admin-api/evaluators', {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setFiles(data);
            setFilteredFiles(data);
        } catch (error) {
            console.error('Error fetching evaluators:', error);
        }
    };

    const fetchDeletedEvaluators = async () => {
        try {
            const response = await fetch('http://localhost:5173/admin-api/deleted-evaluators', {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDeletedEvaluators(data);
        } catch (error) {
            console.error('Error fetching deleted evaluators:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchEvaluators(), fetchDeletedEvaluators()]);
            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const filtered = files.filter(file =>
            file.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    };

    const handleEvaluatorClick = (instructorId) => {
        navigate(`/admin/evalManagerInfo/${instructorId}`);
    };

    const handleRevertAction = async (instructorId) => {
        try {
            const response = await fetch(`http://localhost:5173/admin-api/evaluator/restore/${instructorId}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await fetchDeletedEvaluators();
            await fetchEvaluators();
            toast.success('Evaluator restored successfully');
        } catch (error) {
            console.error('Error reverting evaluator:', error);
            toast.error('Failed to restore evaluator');
        }
    };

    return (
        <div>
            <ToastContainer />
            <AIvaluateNavBarAdmin navBarText="Admin Home Portal" />
            <div className="filler-div">
                <SideMenuBarAdmin tab="evalManager" />
                <div className="main-margin">
                    <div className="portal-container">
                        <div className="top-bar">
                            <h1>Evaluators</h1>
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
                            <button className="addEvalButton" onClick={() => navigate('/admin/CreateAccPT')}>Add Evaluator</button>
                            {!loading && deletedEvaluators.length > 0 && (
                                <button 
                                    className="revertEvalButton" 
                                    onClick={() => handleRevertAction(deletedEvaluators[0].instructorId)}
                                >
                                    Undo Delete
                                </button>
                            )}
                        </div>
                        <div className="filetab">
                            {currentFiles.map((file, index) => (
                                <div 
                                    className="file-item" 
                                    key={index} 
                                    onClick={() => handleEvaluatorClick(file.instructorId)}
                                >
                                    <div className="file-name">{file.name}</div>
                                    {file.TA && <div className="file-status">*Teaching Assistant</div>}
                                    <div className="file-icon"><CircumIcon name="edit" /></div>
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

export default EvaluatorManager;
