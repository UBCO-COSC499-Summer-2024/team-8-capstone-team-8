import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../GeneralStyling.css';
import '../Grades.css';
import '../HelpPage.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import SideMenuBar from '../components/SideMenuBar';

const StudentGrades = () => {
  const courseCode = sessionStorage.getItem('courseCode');
  const courseName = sessionStorage.getItem('courseName');
  const navBarText = `${courseCode} - ${courseName}`;

  const { courseId } = useParams();
  const [studentName, setStudentName] = useState('');
  const [totalGrade, setTotalGrade] = useState(0);
  const [totalMaxGrade, setTotalMaxGrade] = useState(0);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await axios.get(`http://localhost:5173/stu-api/student-grades/${courseId}`, { withCredentials: true });
        const data = response.data;
        console.log(data); // Log data to ensure assignmentId is present
        setStudentName(data.studentName);
        setTotalGrade(data.totalGrade);
        setTotalMaxGrade(data.totalMaxGrade);
        setGrades(data.assignments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student grades:', error);
        setLoading(false);
      }
    };

    fetchGrades();
  }, [courseId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const total = ((totalGrade / totalMaxGrade) * 100).toFixed(1);

  return (
    <div>
      <AIvaluateNavBar navBarText={navBarText} />
      <div className="filler-div">
        <SideMenuBar tab="grades"/>
        <div className="main-margin">
          <div className="grades-section">
            <div className="top-bar">
              <h1 className="primary-color-text">Grades for {studentName}</h1>
            </div>
            <div className="scrollable-div">
              <table className="grades-table secondary-colorbg">
                <thead>
                  <tr>
                    <th className="fourth-colorbg">Name</th>
                    <th className="fourth-colorbg">Due</th>
                    <th className="fourth-colorbg">Submitted</th>
                    <th className="fourth-colorbg">Marked</th>
                    <th className="fourth-colorbg">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, index) => (
                    <tr key={index}>
                      <td>{grade.name}</td>
                      <td>{new Date(grade.due).toLocaleDateString()}</td>
                      <td>{grade.submitted ? <span className="checkmark">✔️</span> : <span className="cross">❌</span>}</td>
                      <td>{grade.marked ? <span className="checkmark">✔️</span> : <span className="cross">❌</span>}</td>
                      <td>{grade.score.toFixed(1)}/{grade.total}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="4" className="total fourth-colorbg">Total</td>
                    <td className="total fourth-colorbg">{total}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;
