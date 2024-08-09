import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import the package
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../EditRubric.css';
import '../GeneralStyling.css';
import '../ToastStyles.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import SideMenuBarEval from '../components/SideMenuBarEval';

const EditRubric = () => {
    const courseCode = sessionStorage.getItem('courseCode');
    const courseName = sessionStorage.getItem('courseName');
    const navBarText = `${courseCode} - ${courseName}`;
    const navigate = useNavigate();
    const { assignmentRubricId } = useParams();
    const [title, setTitle] = useState("");
    const [rubricContent, setRubricContent] = useState("");
    const [isEdited, setIsEdited] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!assignmentRubricId) {
            setError('Invalid rubric ID');
            return;
        }

        axios.get(`/eval-api/rubric/${assignmentRubricId}`, { 
            withCredentials: true
        })
        .then(response => {
            if (response.data && response.data.length > 0) {
                const rubric = response.data[0];
                setTitle(rubric.rubricName);
                setRubricContent(rubric.criteria);
            } else {
                setError('Rubric data not found');
            }
        })
        .catch(error => {
            console.error('Error fetching rubric:', error);
            setError('An error occurred while fetching the rubric.');
        });
    }, [assignmentRubricId]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setIsEdited(true);
    };

    const handleContentChange = (e) => {
        setRubricContent(e.target.value);
        setIsEdited(true);
    };

    const handleSaveChanges = () => {
        if (!isEdited) return;

        const updatedRubric = {
            rubricName: title,
            criteria: rubricContent
        };

        axios.put(`/eval-api/rubric/${assignmentRubricId}`, updatedRubric, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
        .then(response => {
            setIsEdited(false); // Reset the edit flag
            toast.success('Rubric updated successfully!');
        })
        .catch(error => {
            console.error('Error updating rubric:', error);
            toast.error('An error occurred while updating the rubric.');
            setError('An error occurred while updating the rubric.');
        });
    };

    const handleConfirmSave = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleConfirm = () => {
                    handleSaveChanges();
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Confirm Changes</h1>
                        <p>Are you sure you want to save these changes?</p>
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={handleConfirm} className="cancel-button">Save</button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay",
        });
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <AIvaluateNavBarEval navBarText={navBarText} />
            <div className="filler-div">
                <SideMenuBarEval tab="rubrics" />
                <div className="main-margin">
                    <div className="top-bar">
                        <div className="back-btn-div">
                            <button className="main-back-button" onClick={() => navigate(-1)}><CircumIcon name="circle_chev_left"/></button>
                        </div>
                        <h1>Rubric:</h1>
                        <input 
                            type="text" 
                            className="title-rubric" 
                            value={title} 
                            onChange={handleTitleChange} 
                        /> 
                        <h3 className="edit-textt">Click to edit</h3>
                    </div>
                    <div className="main-text2">
                        <textarea
                            className="rubric-text2"
                            value={rubricContent}
                            onChange={handleContentChange}
                        />
                        <h3 className="edit-textt">Click to edit</h3>
                    </div>
                    <div className="bottom-bar">
                        <div className="empty"></div>
                        <button 
                            className="confirm-button-rubric"
                            onClick={handleConfirmSave}
                            disabled={!isEdited}
                        >
                            Confirm Changes
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default EditRubric;
