import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import '../CourseEditModal.css';

const EditCourseModal = ({ isOpen, onClose, course, onSave }) => {
    const [editedCourse, setEditedCourse] = useState({ ...course });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setEditedCourse(course); // Update state when course prop changes
    }, [course]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedCourse(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();

        // Check if the course name or course code exceeds the specified length limits
        if (editedCourse.courseName.length > 50) {
            setErrorMessage('Course name must be less than 50 characters.');
            return;
        }

        if (editedCourse.courseCode.length > 10) {
            setErrorMessage('Course code must be less than 10 characters.');
            return;
        }

        setErrorMessage(''); // Clear any existing error message
        onSave(editedCourse);
        sessionStorage.setItem('courseName', editedCourse.courseName);
        sessionStorage.setItem('courseCode', editedCourse.courseCode);

        // Reload the page to reflect the updated course details
        window.location.reload();
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Edit Course" className="modal" overlayClassName="overlay">
            <h2 className="modal-title">Edit Course Details</h2>
            <form onSubmit={handleSave} className="edit-course-form">
                <div className="form-group">
                    <label htmlFor="courseName" className="form-label">
                        Course Name:
                    </label>
                    <input
                        type="text"
                        id="courseName"
                        name="courseName"
                        className="course-form-input"
                        value={editedCourse.courseName || ''}
                        onChange={handleChange}
                        maxLength="50" // Limit the course name to 50 characters
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="courseCode" className="form-label">
                        Course Code:
                    </label>
                    <input
                        type="text"
                        id="courseCode"
                        name="courseCode"
                        className="course-form-input"
                        value={editedCourse.courseCode || ''}
                        onChange={handleChange}
                        maxLength="10" // Limit the course code to 10 characters
                    />
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="form-actions">
                    <button type="button" className="course-cancel-button" onClick={onClose}>Cancel</button>
                    <button type="submit" className="course-save-button">Save Changes</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditCourseModal;
