import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../DatePicker.css';
import '../GeneralStyling.css';
import '../GradingAssignments.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';

const GradingAssignments = () => {
  const { studentId, assignmentId } = useParams();
  const courseId = sessionStorage.getItem('courseId');
  const courseCode = sessionStorage.getItem('courseCode');
  const courseName = sessionStorage.getItem('courseName');
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [finalScore, setFinalScore] = useState('');
  const [assignmentDetails, setAssignmentDetails] = useState({});
  const [feedback, setFeedback] = useState('');
  const [instructorFeedback, setInstructorFeedback] = useState('');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const studentNumber = studentId;
  const [submittedFiles, setSubmittedFiles] = useState([]);
  const { fileName, submissionLink } = location.state || {};
  console.log("Received fileName:", fileName);

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5173/eval-api/assignment/${studentId}/${assignmentId}`, {
          withCredentials: true
        });
        const data = response.data;
        setAssignmentDetails(data);
        setDueDate(data.dueDate ? new Date(data.dueDate) : new Date());
        setFeedback(data.AIFeedbackText || '');
        setInstructorFeedback(data.InstructorFeedbackText || '');
        setFinalScore(data.InstructorAssignedFinalGrade ? data.InstructorAssignedFinalGrade.toString() : '');
        setSubmittedFiles(data.submissionFile ? data.submissionFile.split(',') : []);
      } catch (error) {
        console.error('Error fetching assignment details:', error);
      }
    };

    fetchAssignmentDetails();
  }, [studentId, assignmentId]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleDueDateChange = (date) => {
    setDueDate(date);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const saveDueDate = async () => {
    setIsEditing(false);
    try {
      await axios.put(`http://localhost:5173/eval-api/assignments/${studentId}/${assignmentId}/due-date`, {
        dueDate
      }, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error updating due date:', error);
    }
  };

  const handleScoreChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const numericValue = parseInt(value, 10);
      if (numericValue <= assignmentDetails.maxObtainableGrade || isNaN(numericValue)) {
        setFinalScore(value);
      }
    }
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleInstructorFeedbackChange = (e) => {
    setInstructorFeedback(e.target.value);
  };

  const toggleEditFeedback = () => {
    setIsEditingFeedback(!isEditingFeedback);
  };

  const handleMarkComplete = async () => {
    if (!finalScore || !instructorFeedback) {
      toast.error('Please fill in all required fields: Final Score and Instructor Feedback.');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5173/eval-api/assignment/complete/${studentId}/${assignmentId}`, {
        dueDate,
        InstructorAssignedFinalGrade: parseFloat(finalScore),
        AIFeedbackText: feedback,
        InstructorFeedbackText: instructorFeedback,
        maxObtainableGrade: assignmentDetails.maxObtainableGrade
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        toast.success('Assignment marked as complete');
      } else {
        toast.error('Failed to mark assignment as complete');
      }
    } catch (error) {
      console.error('Error marking assignment as complete:', error);
      toast.error('Failed to mark assignment as complete');
    }
  };

  const navBarText = `${courseCode} - ${courseName}`;

  return (
    <div>
      <AIvaluateNavBarEval navBarText={navBarText} />
      <div className="filler-div">
        <SideMenuBarEval tab="assignments" />
        <div className="main-margin">
          <div className="top-bar">
            <div className="back-btn-div">
              <button className="main-back-button" onClick={() => navigate(-1)}>
                <CircumIcon name="circle_chev_left" />
              </button>
            </div>
            <div className="assignment-text"><h1>{assignmentDetails.assignmentName}</h1></div>
          </div>
          <div className="align-flex">
            <h2 className="student-num">Student - {studentNumber}</h2>
            <div className="empty"></div>
            <div className="due-date-container">
              {isEditing ? (
                <>
                  <DatePicker
                    selected={dueDate}
                    onChange={handleDueDateChange}
                    showTimeSelect
                    className="due-date-picker"
                    dateFormat="MMMM d, yyyy h:mm aa"
                  />
                  <button className="save-button" onClick={saveDueDate}>Save</button>
                </>
              ) : (
                <>
                  <p className="due-date">Due: {dueDate.toLocaleString()}</p>
                  <div onClick={toggleEdit}>
                    <CircumIcon name="edit" />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="score-div">
            <h2 className="aiscore">AIScore: {assignmentDetails.AIassignedGrade}/{assignmentDetails.maxObtainableGrade}</h2>
            <div className="final-score">
              <label htmlFor="final-score-input">Confirm Final Score:</label>
              <input
                id="final-score-input"
                type="text"
                value={finalScore}
                onChange={handleScoreChange}
                placeholder="--"
              />
              <h2 className="full-score">/ {assignmentDetails.maxObtainableGrade}</h2>
            </div>
          </div>
          <div className="student-info">
            <div className="feedback">
              <h4>AI Feedback - This is not seen by the student!</h4>
              <textarea
                value={feedback}
                onChange={handleFeedbackChange}
                readOnly={!isEditingFeedback}
                onClick={toggleEditFeedback}
                onBlur={toggleEditFeedback}
              />
            </div>
            <div className="evaluator-comments">
              <h4>Evaluator Comments - To be submitted to the student</h4>
              <textarea
                value={instructorFeedback}
                onChange={handleInstructorFeedbackChange}
                placeholder="Please use the AI feedback to help you write your grading feedback. This is the feedback that will be returned to the student. Feel free to use markdown to make things easier to read for the student."
              ></textarea>
            </div>
            <div className="student-submission">
                <h4>Student Submission</h4>
                {fileName && (
                    <div>
                        <a 
                            href={`http://localhost:5173/eval-api/file/${studentId}/${courseId}/${assignmentId}/${fileName}`} 
                            download
                        >
                            {fileName}
                        </a>
                    </div>
                )}
                {submissionLink && (
                    <div>
                        <a 
                            href={submissionLink.startsWith('http://') || submissionLink.startsWith('https://') ? submissionLink : `https://${submissionLink}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            {submissionLink}
                        </a>
                    </div>
                )}
                {!fileName && !submissionLink && <p>No submissions uploaded yet.</p>}
            </div>
            <button className="mark-complete" onClick={handleMarkComplete}>Mark evaluation as complete</button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default GradingAssignments;