import CircumIcon from "@klarr-agency/circum-icons-react";
import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // run npm install react-icons
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import AIvaluateNavBarAdmin from "../components/AIvaluateNavBarAdmin";
import SideMenuBarAdmin from '../components/SideMenuBarAdmin';

const StudentManager = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [deletedStudents, setDeletedStudents] = useState([]);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5173/admin-api/students', {
                credentials: 'include'
            });
            const data = await response.json();
            setStudents(data);
            setFilteredStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        }
    };

    const fetchDeletedStudents = async () => {
        try {
            const response = await fetch('http://localhost:5173/admin-api/deleted-students', {
                credentials: 'include'
            });
            const data = await response.json();
            setDeletedStudents(data);
        } catch (error) {
            console.error('Error fetching deleted students:', error);
            toast.error('Failed to fetch deleted students');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchStudents();
            await fetchDeletedStudents();
        };

        fetchData();
    }, []);

    useEffect(() => {
        const filtered = students.filter(student =>
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filtered);
        setCurrentPage(1); // Reset to first page on new search
    }, [searchTerm, students]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

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

    const handleStudentClick = (studentId) => {
        navigate(`/admin/student/${studentId}`);
    };

    const handleRestoreStudent = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5173/admin-api/student/restore/${studentId}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                toast.success('Student restored successfully');
                await fetchStudents(); // Refresh the student list
                await fetchDeletedStudents(); // Refresh the deleted students list
            } else {
                toast.error('Failed to restore student');
            }
        } catch (error) {
            console.error('Error restoring student:', error);
            toast.error('Failed to restore student');
        }
    };

    return (
        <div>
            <ToastContainer />
            <AIvaluateNavBarAdmin navBarText="Admin Home Portal" />
            <div className="filler-div">
                <SideMenuBarAdmin tab="studentManager" />
                <div className="main-margin">
                    <div className="portal-container">
                        <div className="top-bar">
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
                            {currentStudents.map((student) => (
                                <div 
                                    className="file-item" 
                                    key={student.studentId} 
                                    onClick={() => handleStudentClick(student.studentId)}
                                >
                                    <div className="file-name">{student.firstName} {student.lastName}</div>
                                    <div className="file-icon"><CircumIcon name="edit" /></div>
                                </div>
                            ))}
                        </div>
                        <div className="pagination-controls">
                            <span>Page {currentPage} of {totalPages}</span>
                            <div className="pagination-buttons">
                                <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                            </div>
                        </div>
                        {deletedStudents.length > 0 && (
                            <div className="filetab">
                                <h2>Deleted Students</h2>
                                {deletedStudents.map((student) => (
                                    <div 
                                        className="file-item-deleted" 
                                        key={student.studentId}
                                        onClick={() => handleRestoreStudent(student.studentId)}
                                    >
                                        <div className="file-name">{student.firstName} {student.lastName}</div>
                                        <div 
                                            className="file-icon" 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the student click
                                                handleRestoreStudent(student.studentId);
                                            }}
                                        >
                                            <CircumIcon name="undo" className="file-icon" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentManager;
