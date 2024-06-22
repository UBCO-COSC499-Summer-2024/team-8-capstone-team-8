import React, { useState, useEffect } from 'react';
import '../Account.css';
import '../GeneralStyling.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import '../styles.css';
import axios from 'axios';

const Account = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [accountId, setAccountId] = useState("");
    const [prof, setProf] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const idLabel = prof ? "Evaluator ID" : "Student ID";

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const { data: { studentId } } = await axios.get('http://localhost:4000/student/me', {
                    withCredentials: true
                });
                setAccountId(studentId);

                const firstNameResponse = await axios.get(`http://localhost:4000/student/${studentId}/firstName`);
                setFirstName(firstNameResponse.data.firstName);

                const lastNameResponse = await axios.get(`http://localhost:4000/student/${studentId}/lastName`);
                setLastName(lastNameResponse.data.lastName);

                const emailResponse = await axios.get(`http://localhost:4000/student/${studentId}/email`);
                setEmail(emailResponse.data.email);

                // Password is not fetched for security reasons
            } catch (error) {
                console.error('There was an error fetching the student data:', error);
            }
        };

        fetchStudentData();
    }, []);

    const handlePasswordEditClick = () => {
        setIsEditing(true);
    };

    const handlePasswordSaveClick = async () => {
        setSuccessMessage("Password updated successfully!"); // Set default success message
        setErrorMessage(""); // Set default error message

        // Check if all fields are filled in
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setErrorMessage("All fields are required."); // Set error message
            setSuccessMessage(""); // Clear any existing success messages
            return;
        }

        try {
            // Verify the current password
            const response = await axios.post(`http://localhost:4000/student/${accountId}/verifyPassword`, {
                currentPassword
            }, {
                withCredentials: true
            });

            if (!response.data.success) {
                setErrorMessage("Current password is incorrect.");
                setSuccessMessage("");
                return;
            }

            // Check if new password meets criteria, not shorter than 6 characters, not the same as current password, and matches confirm password
            if (newPassword.length < 6) {
                setErrorMessage("New password must be at least 6 characters long.");
                setSuccessMessage(""); 
                return;
            }

            if (newPassword === currentPassword) {
                setErrorMessage("New password must be different from the current password.");
                setSuccessMessage(""); // Clear any existing success messages
                return;
            }

            if (newPassword !== confirmNewPassword) {
                setErrorMessage("New passwords do not match.");
                setSuccessMessage(""); // Clear any existing success messages
                return;
            }

            // Update the password
            await axios.put(`http://localhost:4000/student/${accountId}/password`, {
                password: newPassword
            }, {
                withCredentials: true
            });

            setIsEditing(false); // hide the password edit fields after successful update
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setSuccessMessage("Password updated successfully!");

        } catch (error) {
            console.error('There was an error updating the password:', error);
            setErrorMessage("The current password is incorrect.");
            setSuccessMessage("");
        }
    };

    return (
        <div className="background-colour">
            <AIvaluateNavBar navBarText='Your Account' tab='account' />
            <div className="fourth-colorbg account-details">
                <div className="detail-label">First Name</div>
                <div className="detail-row">
                    <div className="primary-colorbg detail-value">{firstName}</div>
                </div>
                <div className="detail-label">Last Name</div>
                <div className="detail-row">
                    <div className="primary-colorbg detail-value">{lastName}</div>
                </div>
                <div className="detail-label">Email</div>
                <div className="detail-row">
                    <div className="primary-colorbg detail-value">{email}</div>
                </div>
                <div className="detail-label">Password</div>
                <div>
                    {isEditing ? (
                        <>
                            <div className="input-container">
                                <input
                                    type="password"
                                    className="primary-colorbg detail-value"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className="input-container">
                                <input
                                    type="password"
                                    className="primary-colorbg detail-value"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="password-edit-container">
                                <input
                                    type="password"
                                    className="primary-colorbg detail-value"
                                    placeholder="Confirm New Password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />
                                <button className="primary-button save-button" onClick={handlePasswordSaveClick}>Save</button>
                            </div>
                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                        </>
                    ) : (
                        <div className="password-edit-container">
                            <div className="primary-colorbg detail-value">**********</div>
                            <button className="primary-button edit-button" onClick={handlePasswordEditClick}>Edit</button>
                        </div>
                    )}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                </div>
                <div className="detail-label">{idLabel}</div>
                <div className="detail-row">
                    <div className="primary-colorbg detail-value">{accountId}</div>
                </div>
            </div>
        </div>
    );
};

export default Account;
