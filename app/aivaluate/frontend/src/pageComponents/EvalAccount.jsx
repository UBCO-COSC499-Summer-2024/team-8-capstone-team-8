import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Account.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import '../GeneralStyling.css';
import '../ToastStyles.css';

const EvalAccount = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [accountId, setAccountId] = useState("");
    const [prof, setProf] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                const { data: { instructorId } } = await axios.get('http://localhost:5173/eval-api/instructor/me', {
                    withCredentials: true
                });
                setAccountId(instructorId);

                const firstNameResponse = await axios.get(`http://localhost:5173/eval-api/instructor/${instructorId}/firstName`);
                setFirstName(firstNameResponse.data.firstName);

                const lastNameResponse = await axios.get(`http://localhost:5173/eval-api/instructor/${instructorId}/lastName`);
                setLastName(lastNameResponse.data.lastName);

                const emailResponse = await axios.get(`http://localhost:5173/eval-api/instructor/${instructorId}/email`);
                setEmail(emailResponse.data.email);

            } catch (error) {
                console.error('There was an error fetching the instructor data:', error);
            }
        };

        fetchInstructorData();
    }, []);

    const handlePasswordEditClick = () => {
        setIsEditing(true);
    };

    const handlePasswordSaveClick = async () => {
        // Check if all fields are filled in
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            toast.error("All fields are required.");
            return;
        }

        try {
            // Verify the current password
            const response = await axios.post(`http://localhost:5173/eval-api/instructor/${accountId}/verifyPassword`, {
                currentPassword
            }, {
                withCredentials: true
            });

            if (!response.data.success) {
                toast.error("Current password is incorrect.");
                return;
            }

            // Check if new password meets criteria
            if (newPassword.length < 6) {
                toast.error("New password must be at least 6 characters long.");
                return;
            }

            if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
                toast.error("New password must contain at least one letter and one number.");
                return;
            }

            if (newPassword === currentPassword) {
                toast.error("New password must be different from the current password.");
                return;
            }

            if (newPassword !== confirmNewPassword) {
                toast.error("New passwords do not match.");
                return;
            }

            // Update the password
            await axios.put(`http://localhost:5173/eval-api/instructor/${accountId}/password`, {
                password: newPassword
            }, {
                withCredentials: true
            });

            setIsEditing(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            toast.success("Password updated successfully!");

        } catch (error) {
            console.error('There was an error updating the password:', error);
            toast.error("There was an error updating the password. Please try again.");
        }
    };

    return (
        <div className="background-colour">
            <ToastContainer />
            <AIvaluateNavBarEval navBarText='Your Account' tab='account' />
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
                            <div className="password-edit-container-hidden">
                                <input
                                    type="password"
                                    className="primary-colorbg password-input"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className="password-edit-container-hidden">
                                <input
                                    type="password"
                                    className="primary-colorbg password-input"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="password-edit-container-hidden">
                                <input
                                    type="password"
                                    className="primary-colorbg password-input"
                                    placeholder="Confirm New Password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />
                                <button className="primary-button account-save-button" onClick={handlePasswordSaveClick}>Save</button>
                            </div>
                        </>
                    ) : (
                        <div className="password-edit-container">
                            <div className="primary-colorbg password-input">**********</div>
                            <button className="primary-button account-edit-button" onClick={handlePasswordEditClick}>Edit password</button>
                        </div>
                    )}
                </div>
                <div className="detail-label">Evaluator ID</div>
                <div className="detail-row">
                    <div className="primary-colorbg detail-value">{accountId}</div>
                </div>
            </div>
        </div>
    );
};

export default EvalAccount;
