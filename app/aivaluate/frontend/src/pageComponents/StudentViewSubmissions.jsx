import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../Auth.css';
import '../FileDirectory.css';
import '../GeneralStyling.css';
import '../SearchBar.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import SideMenuBar from '../components/SideMenuBar';

const StudentViewSubmissions = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const { courseId } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    //const [searchTerm, setSearchTerm] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await fetch(`/stu-api/courses/${courseId}/submissions`);
                if (response.ok) {
                    const data = await response.json();
                    setFiles(data);
                    setFilteredFiles(data);
                } else {
                    console.error('Error fetching submissions:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching submissions:', error);
            }
        };

        fetchSubmissions();
    }, [courseId]);

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

    const navBarText = `${courseCode} - ${courseName}`;

    return (
        <div>
            <AIvaluateNavBar navBarText={navBarText} tab='submissions' />
            <div className="filler-div">
            <SideMenuBar tab="submissions" />
                <div className="main-margin">
                    <div className="portal-container">
                        <div className="top-bar">
                            <h1>Submissions</h1>
                        </div>
                        <div className="filetab">
                            {currentFiles.map((file, index) => (
                                file && (
                                    <div className="file-item" key={index}>
                                        {console.log('File:', file)}
                                        {console.log('Assignment ID:', file.assignmentId)}
                                        <a 
                                            className="file-name" 
                                            href={`/stu-api/download-submission/${file.studentId}/${courseId}/${file.assignmentId}/${file.submissionFile.split('/').pop()}`}
                                            download
                                        >
                                            {file.submissionFile.split('/').pop()} Submission
                                        </a>
                                        {file.isGraded && <div className="file-status">Marked as graded</div>}
                                    </div>
                                )
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
