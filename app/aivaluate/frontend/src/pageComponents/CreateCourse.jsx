import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CreateCourse.css';
import '../GeneralStyling.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import '../styles.css';

const CreateCourse = () => {
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [taId, setTaId] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [tas, setTAs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructorsAndTAs = async () => {
      try {
        const instructorResponse = await axios.get('http://localhost:4000/instructors');
        setInstructors(instructorResponse.data);

        const taResponse = await axios.get('http://localhost:4000/tas');
        setTAs(taResponse.data);
      } catch (error) {
        console.error('Error fetching instructors and TAs:', error);
      }
    };

    fetchInstructorsAndTAs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseName || !courseCode || !maxStudents) {
      setErrorMessage('All fields are required.');
      return;
    }

    // Check if instructor is selected
    if (!instructorId) {
      setErrorMessage('Instructor selection is required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/courses', {
        courseName,
        courseCode,
        maxStudents,
      });

      const courseId = response.data.courseId;

      // Add instructor to the Teaches table
      if (instructorId) {
        await axios.post('http://localhost:4000/teaches', {
          courseId,
          instructorId
        });
      }

      // Add TA to the Teaches table if selected
      if (taId) {
        await axios.post('http://localhost:4000/teaches', {
          courseId,
          instructorId: taId
        });
      }

      console.log('Course created successfully:', response.data);
      navigate('/dashboard'); // Redirect to dashboard after successful creation
    } catch (error) {
      console.error('There was an error creating the course:', error);
    }
  };

  return (
    <>
      <AIvaluateNavBar navBarText='Create a Course' />
      <div className='secondary-colorbg form-container'>
        <section>
          <div className="form-content">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <h3>Course Name</h3>
                <input 
                  type="text" 
                  name="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <h3>Course Number</h3>
                <input 
                  type="text" 
                  name="courseCode"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                />
              </div>
              <div className="form-group">
                <h3>Maximum Number of Students</h3>
                <input 
                  type="text" 
                  name="maxStudents"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                />
              </div>

              {/* Display a dropdown of instructors */}
              {/* Select the instructor for the course */}
              <div className="form-group">
                <h3>Instructor</h3>
                <select className="drop-down-menu" value={instructorId} onChange={(e) => setInstructorId(e.target.value)} required>
                  <option value="">Select Instructor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.instructorId} value={instructor.instructorId}>
                      {`${instructor.firstName} ${instructor.lastName}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display a dropdown of instructors */}
              {/* Select the TA for the course */}
              <div className="form-group">
                <h3>Teaching Assistant</h3>
                <select className="drop-down-menu"value={taId} onChange={(e) => setTaId(e.target.value)}>
                  <option value="">None</option>
                  {tas.map(ta => (
                    <option key={ta.instructorId} value={ta.instructorId}>
                      {`${ta.firstName} ${ta.lastName}`}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="create-course-button">Create Course</button>
              {errorMessage && <div className="error-message">{errorMessage}</div>}
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default CreateCourse;
