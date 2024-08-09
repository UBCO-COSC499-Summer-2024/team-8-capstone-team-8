import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // run npm install react-icons
import { useParams } from 'react-router-dom';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import '../SearchBar.css';
import AIvaluateNavBar from "../components/AIvaluateNavBar";
import SideMenuBar from '../components/SideMenuBar';

const People = () => {
    const { courseId } = useParams();
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`http://localhost:5173/stu-api/students/display/${courseId}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                const studentNames = data.map(student => `${student.firstName} ${student.lastName}`);
                setFiles(studentNames);
                setFilteredFiles(studentNames);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, [courseId]);

    useEffect(() => {
        const filtered = files.filter(file =>
            file.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFiles(filtered);
        setCurrentPage(1); // Reset to first page on new search
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
        setCurrentPage(1); // Reset to first page on new search
    };

    const navBarText = `${courseCode} - ${courseName}`;

    return (
        <div>
            <AIvaluateNavBar navBarText={navBarText}/>
            <div className="filler-div">
                <SideMenuBar tab="people" />
                    <div className="main-margin">
                        <div className="portal-container">
                            <div className="top-bar">
                                <h1>People</h1>
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
                                    <div className="file-item-no-click" key={index}>
                                        <div className="file-name-no-click">{file}</div>
                                        <div className="file-icon-no-click"></div>
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

export default People;
