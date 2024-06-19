import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../AllSubmissions.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import SideMenuBar2 from '../components/SideMenuBar2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';


const AllSubmissions = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleSubmissions, setVisibleSubmissions] = useState(6);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log(`menu open - ${!menuOpen}`);
  };

  const submissions = [
    { id: 39996201, label: 'Lab 1 Submission', graded: true },
    { id: 58886201, label: 'Lab 1 Submission', graded: true },
    { id: 57996231, label: 'Lab 1 Submission', graded: true },
    { id: 89496301, label: 'Lab 1 Submission', graded: true },
    { id: 12966231, label: 'Lab 1 Submission', graded: true },
    { id: 46698215, label: 'Lab 1 Submission', graded: true },
    { id: 58798211, label: 'Lab 1 Submission', graded: true },
    { id: 34598212, label: 'Lab 1 Submission', graded: true },
    { id: 78998213, label: 'Lab 1 Submission', graded: true },
    { id: 46798214, label: 'Lab 1 Submission', graded: true },
  ];

  const handleLoadMore = () => {
    setVisibleSubmissions(submissions.length);
    setIsExpanded(true);
  };

  const handleLoadLess = () => {
    setVisibleSubmissions(6);
    setIsExpanded(false);
  };

  
  return (
    <div>
      <AIvaluateNavBar navBarText='COSC 499 - Software Engineering Capstone' tab="All Submissions" />
      <div className="submissions-container">
        <SideMenuBar2 />
        <div className="content">
          <h2>All Submissions</h2>
          <div className="submission-list">
            {submissions.slice(0, visibleSubmissions).map((submission, index) => (
              <div key={submission.id} className={`submission-item ${index % 2 === 0 ? 'white' : 'gray'}`}>
                <FontAwesomeIcon icon={faFolder} className="folder-icon" />
                <div className="submission-text">{submission.id} - {submission.label}</div>
              </div>
            ))}
          </div>
          {!isExpanded ? (
            <button className="load-more-button" onClick={handleLoadMore}>
              Load More
            </button>
          ) : (
            <button className="load-less-button" onClick={handleLoadLess}>
              Load Less
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default AllSubmissions;