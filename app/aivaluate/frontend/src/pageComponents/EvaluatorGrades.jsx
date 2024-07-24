import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import '../GeneralStyling.css';
import '../Grades.css';
import '../HelpPage.css';
import '../SearchBar.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';

const EvaluatorGrades = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const navBarText = `${courseCode} - ${courseName}`;

    const { courseId } = useParams();
    const [grades, setGrades] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await axios.get(`http://localhost:5173/eval-api/evaluator-grades/${courseId}`, { withCredentials: true });
                setGrades(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching evaluator grades:', error);
                setLoading(false);
            }
        };

        fetchGrades();
    }, [courseId]);

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredGrades = grades.filter((grade) =>
        grade.name && grade.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    let sumOfAvgGrades = grades.reduce((sum, grade) => sum + grade.avgGrade, 0);
    let sumOfTotalGrades = grades.reduce((sum, grade) => sum + grade.totalGrade, 0);

    let average = ((sumOfAvgGrades / sumOfTotalGrades) * 100).toFixed(1);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <AIvaluateNavBarEval navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBarEval tab="grades"/>
                <div className="main-margin">
                        <div className="top-bar">
                            <div className="float-left">
                                <div className="grade-summary-text"><h1>Grade Summary</h1></div>
                                <div className="search-div">
                                    <div className="search-container">
                                        <div className="search-box">
                                            <FaSearch className="search-icon" />
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                value={searchQuery}
                                                onChange={handleSearch}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="float-right">
                                <div className="class-avg"><h2>Class Average: {average}%</h2></div>
                            </div>
                        </div>
                    <div className="scrollable-div">
                        <table className="grades-table secondary-colorbg">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Date</th>
                                    <th>Avg. Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                    {filteredGrades.map((grade, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="file-icon"></div>
                                                {grade.name}
                                            </td>
                                            <td>{new Date(grade.due).toLocaleDateString()}</td>
                                            <td>{((grade.avgGrade / grade.totalGrade)*100).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluatorGrades;
