import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import React, { useState } from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import the package
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../CourseCards.css';
import '../ToastStyles.css';

const Card = ({ courseId, courseCode, courseName, isArchived, user="stu" }) => {
  console.log("Card props:", { courseId, courseCode, courseName, isArchived });
  const navigate = useNavigate();
  const [enrolled, SetEnrolled] = useState(false);

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleClick = async () => {
    if (courseCode === 'Create Course') {
      navigate('/eval/createcourse');
    } else if (user === 'prof') {
      navigate(`/eval/grades/${courseId}`);
      sessionStorage.clear('courseId');
      sessionStorage.clear('courseCode');
      sessionStorage.clear('courseName');
      sessionStorage.setItem('courseCode', courseCode);
      sessionStorage.setItem('courseName', courseName);
      sessionStorage.setItem('courseId', courseId);
      navigate(`/eval/grades/${courseId}`);
    } else if (user === 'stu') {
      sessionStorage.clear('courseId');
      sessionStorage.clear('courseCode');
      sessionStorage.clear('courseName');
      sessionStorage.setItem('courseCode', courseCode);
      sessionStorage.setItem('courseName', courseName);
      sessionStorage.setItem('courseId', courseId);
      navigate(`/stu/grades/${courseId}`);
    } else if (user === 'joinCourse') {
      confirmAlert({
        customUI: ({ onClose }) => {
          const handleButtonClick = async (label) => {
            if (label === 'Yes') {
              await handleConfirmEnroll();
            }
            onClose();
          };

          return (
            <div className="custom-ui">
              <h1>Confirm Enrollment</h1>
              <p>Are you sure you want to enroll in the course: {courseName} ({courseCode})?</p>
              <div className="button-group">
                <button onClick={() => handleButtonClick('No')} className="cancel-button">No</button>
                <button onClick={() => handleButtonClick('Yes')} className="confirm-button">Yes</button>
              </div>
            </div>
          );
        },
        overlayClassName: "custom-overlay", // Custom class for overlay
      });
    }
  };

  const handleConfirmEnroll = async () => {
    try {
      const response = await axios.post('http://localhost:5173/stu-api/enroll-course', { courseId }, { withCredentials: true });
      if (response.status === 200) {
        toast.success('Successfully enrolled in course!');
        SetEnrolled(true);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Error enrolling in course');
    }
  };

  return (
    <div className={courseCode === 'Create Course' ? "add-course-card course-card" : "course-card"} onClick={handleClick}>
      {(courseCode === 'Create Course' || user === 'joinCourse') ? (
        <img src="../../public/create-course2.svg" alt="Default Course Image" />
      ) : (
        user === 'stu' ? (
          <img src="../../public/student-course-image.svg" alt="Student Course Image" />
        ) : (
          <img src="../../public/prof-course-image.svg" alt="Professor Course Image" />
        )
      )}
      <h2>{courseCode}
        {isArchived && <span className="archive-status"> - Archived</span>}
      </h2>
      <p className="course-name-text">{truncateText(courseName, 30)}</p>
      {/* <p className="course-name-text">{courseName}</p> */}
      <div>
        {(courseCode === 'Create Course' || user === 'joinCourse') && <CircumIcon name="circle_plus" />}
      </div>
    </div>
  );
};

export default Card;
