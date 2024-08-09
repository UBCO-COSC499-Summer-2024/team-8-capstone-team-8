import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { FaFile, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../AssignmentOverview.css';
import '../GeneralStyling.css';
import '../SearchBar.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import SideMenuBar from '../components/SideMenuBar';

const AssignmentOverview = () => {
  const courseCode = sessionStorage.getItem('courseCode');
  const courseName = sessionStorage.getItem('courseName');
  const courseId = sessionStorage.getItem('courseId');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [error, setError] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!courseId) {
        setError('Course ID is not set in session storage');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5173/stu-api/assignments/course/${courseId}`, {
          withCredentials: true
        });

        if (response.status === 200) {
          if (Array.isArray(response.data)) {
            setAssignments(response.data);
            setFilteredAssignments(response.data);
            setError(null);
          } else {
            console.error('Expected an array but got:', response.data);
            setError('Unexpected response format');
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError('No assignments found for this course.');
        } else {
          setError('Error fetching assignments.');
          console.error('Error fetching assignments:', error);
        }
        setAssignments([]);
        setFilteredAssignments([]);
      }
    };

    fetchAssignments();
  }, [courseId]);

  const handleNavigate = (assignmentId) => {
    navigate(`/stu/submit/${courseId}/${assignmentId}`);
  };

  useEffect(() => {
    if (searchTerm) {
      const results = assignments.filter(assignment =>
        assignment.assignmentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssignments(results);
    } else {
      setFilteredAssignments(assignments);
    }
  }, [searchTerm, assignments]);

  const navBarText = `${courseCode} - ${courseName}`;

  const formatDueDate = (dueDate) => {
    const date = parseISO(dueDate);
    return format(date, "MMMM do 'at' h:mmaaa");
  };

  return (
    <div>
      <AIvaluateNavBar navBarText={navBarText} />
      <div className="filler-div">
        <SideMenuBar tab="assignments" />
        <div className="main-margin">
            <div className="top-bar">
              <h1>Assignments</h1>
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
          <div className="scrollable-div">
            <main className="assignment-table-content">
              <section className="table-section">
                {error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <table className="assignment-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Due Date</th>
                        <th>Obtainable Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                      {filteredAssignments.map((assignment, index) => (
                        <tr key={index}>
                          <td>
                            <button className="icon-button" onClick={() => handleNavigate(assignment.assignmentId)}>
                              <FaFile className="file-icon" />
                            </button>
                          </td>
                          <td>
                            <button className="link-button" onClick={() => handleNavigate(assignment.assignmentId)}>
                              {assignment.assignmentName}
                            </button>
                          </td>
                          <td>{formatDueDate(assignment.dueDate)}</td>
                          <td>{assignment.maxObtainableGrade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentOverview;
