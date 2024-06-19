import React, { useState, useEffect } from 'react';
import '../Account.css';
import '../GeneralStyling.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import '../styles.css';
import axios from 'axios';//looks greattttttttt

const Account = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("*********");
    const [accountId, setAccountId] = useState("");
    const [prof, setProf] = useState(false);
    const idLabel = prof ? "Evaluator ID" : "Student ID";

    const [isEditing, setIsEditing] = useState({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
    });

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

    const handleEditClick = (field) => {
        setIsEditing({ ...isEditing, [field]: true });
    };

    const handleSaveClick = async (field) => {
        setIsEditing({ ...isEditing, [field]: false });

        try {
            await axios.put(`http://localhost:4000/student/${accountId}/${field}`, {
                [field]: eval(field)  // dynamically get the value of the field from state
            }, {
                withCredentials: true
            });
        } catch (error) {
            console.error(`There was an error updating the ${field}:`, error);
        }
    };

    return (
        <div className="background-colour">
            <AIvaluateNavBar navBarText='Your Account' tab='account' />
            <div className="fourth-colorbg account-details">
                <div className="detail-label">First Name</div>
                <div className="detail-row">
                    {isEditing.firstName ? (
                        <input
                            className="primary-colorbg detail-value"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            onBlur={() => handleSaveClick('firstName')}
                        />
                    ) : (
                        <>
                            <div className="primary-colorbg detail-value">{firstName}</div>
                            <button className="primary-button edit-button" onClick={() => handleEditClick('firstName')}>Edit</button>
                        </>
                    )}
                </div>
                <div className="detail-label">Last Name</div>
                <div className="detail-row">
                    {isEditing.lastName ? (
                        <input
                            className="primary-colorbg detail-value"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            onBlur={() => handleSaveClick('lastName')}
                        />
                    ) : (
                        <>
                            <div className="primary-colorbg detail-value">{lastName}</div>
                            <button className="primary-button edit-button" onClick={() => handleEditClick('lastName')}>Edit</button>
                        </>
                    )}
                </div>
                <div className="detail-label">Email</div>
                <div className="detail-row">
                    {isEditing.email ? (
                        <input
                            className="primary-colorbg detail-value"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleSaveClick('email')}
                        />
                    ) : (
                        <>
                            <div className="primary-colorbg detail-value">{email}</div>
                            <button className="primary-button edit-button" onClick={() => handleEditClick('email')}>Edit</button>
                        </>
                    )}
                </div>
                <div className="detail-label">Password</div>
                <div className="detail-row">
                    {isEditing.password ? (
                        <input
                            type="password"
                            className="primary-colorbg detail-value"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleSaveClick('password')}
                        />
                    ) : (
                        <>
                            <div className="primary-colorbg detail-value">**********</div>
                            <button className="primary-button edit-button" onClick={() => handleEditClick('password')}>Edit</button>
                        </>
                    )}
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
