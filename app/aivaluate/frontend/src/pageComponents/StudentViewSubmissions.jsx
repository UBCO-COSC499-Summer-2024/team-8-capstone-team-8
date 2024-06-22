import CircumIcon from "@klarr-agency/circum-icons-react";
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // run npm install react-icons
import { useNavigate } from 'react-router-dom';
import '../Auth.css';
import '../FileDirectory.css';
import '../GeneralStyling.css';
// import '../StudentViewSubmissions.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import SideMenuBar from '../components/SideMenuBar';

const StudentViewSubmissions = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);

  const files = [
    'index.html',
    'index.css',
    'login.html',
    'login.css',
    'dashboard.html',
    'dashboard.css',
    'report.html',
    'report.css',
    'about.html',
    'about.css',
    'contact.html',
    'contact.css',
  ];

    useEffect(() => {
        const filtered = files.filter(file =>
            file.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFiles(filtered);
        setCurrentPage(1); // Reset to first page on new search
    }, [searchTerm]);

    // Calculates the current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFiles = filteredFiles.slice(indexOfFirstItem, indexOfLastItem);

    // This calculates the total number of pages based of the max number of items per page
    const totalPages = Math.ceil(files.length / itemsPerPage);

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

  return (
  <div>
    <AIvaluateNavBar navBarText='COSC 499 - Software Engineering Capstone' tab='submissions' />
    <SideMenuBar tab="submissions" />
    <div className="accented-outside rborder">
        <div className="portal-all">
            <div className="portal-container">
                <div className="topBar">
                    <h1>Submissions</h1>
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
                            <div className="folder-icon"><CircumIcon name="folder_on"/></div>
                            <div className="file-name">{file}</div>
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

export default StudentViewSubmissions;
