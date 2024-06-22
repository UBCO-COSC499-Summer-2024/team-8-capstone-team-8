import CircumIcon from "@klarr-agency/circum-icons-react";
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // run npm install react-icons
import '../FileDirectory.css';
import '../GeneralStyling.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import SideMenuBarAdmin from '../components/SideMenuBarAdmin';


const EvaluatorManager = () => {

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);

    const files = [
        'Colton Palfrey',
        'Chinmay Arvind',
        'Jerry Fan',
        'Omar Hemed',
        'Kenny Nguyen',
        'Aayush Chaudhary',
        'Rahul Kulkarni',
        'Sahil Patel',
        'Oakley Boren',
        'Karan Manchanda',
        'Yash Shah',
        'Wesley Chan',
        'Paul Tollo',
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
            <AIvaluateNavBar navBarText="Admin Home Portal"/>
            <SideMenuBarAdmin tab="evalManager" />
            <div className="accented-outside rborder">
                <div className="portal-all">
                    <div className="portal-container">
                        <div className="topBar">
                            <h1>Students</h1>
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
                                    <div className="file-name">{file}</div>
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
