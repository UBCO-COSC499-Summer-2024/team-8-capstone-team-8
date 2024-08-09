import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Account.css';
import AIvaluateNavBarAdmin from '../components/AIvaluateNavBarAdmin';
import '../GeneralStyling.css';
import '../ToastStyles.css';

const AdminAccount = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [accountId, setAccountId] = useState("");
    const [prof, setProf] = useState(false);
    const idLabel = prof ? "Evaluator ID" : "Student ID";
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const { data: { adminId } } = await axios.get('http://localhost:5173/admin-api/admin/me', {
                    withCredentials: true
                });
                setAccountId(adminId);

                const firstNameResponse = await axios.get(`http://localhost:5173/admin-api/admin/${adminId}/firstName`);
                setFirstName(firstNameResponse.data.firstName);

                const lastNameResponse = await axios.get(`http://localhost:5173/admin-api/admin/${adminId}/lastName`);
                setLastName(lastNameResponse.data.lastName);

                const emailResponse = await axios.get(`http://localhost:5173/admin-api/admin/${adminId}/email`);
                setEmail(emailResponse.data.email);

            } catch (error) {
                console.error('There was an error fetching the admin data:', error);
            }
        };

        fetchAdminData();
    }, []);

    const handlePasswordEditClick = () => {
        setIsEditing(true);
    };

    const handlePasswordSaveClick = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            toast.error("All fields are required.");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5173/admin-api/admin/${accountId}/verifyPassword`, {
                currentPassword
            }, {
                withCredentials: true
            });

            if (!response.data.success) {
                toast.error("Current password is incorrect.");
                return;
            }

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

            await axios.put(`http://localhost:5173/admin-api/admin/${accountId}/password`, {
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
            <AIvaluateNavBarAdmin navBarText='Your Account' tab='account' />
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
                            <div>
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
                <div className="detail-label">Admin ID</div>
                <div className="detail-row">
                    <div className="primary-colorbg detail-value">{accountId}</div>
                </div>
            </div>
        </div>
    );
};

export default AdminAccount;
