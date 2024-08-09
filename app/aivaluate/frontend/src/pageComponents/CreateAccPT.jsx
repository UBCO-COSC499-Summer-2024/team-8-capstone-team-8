import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import { useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import SideMenuBarAdmin from '../components/SideMenuBarAdmin';
import '../CreateAccPT.css'; // Ensure CSS is imported
import '../GeneralStyling.css';
import '../ToastStyles.css';

const CreateAccPT = () => {
  const navigate = useNavigate();
  const [isTeachingAssistant, setIsTeachingAssistant] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: ''
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validateInput = (input) => {
    const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|GRANT|REVOKE|TRUNCATE|REPLACE|MERGE|CALL|EXPLAIN|LOCK|UNLOCK|DESCRIBE|SHOW|USE|BEGIN|END|DECLARE|SET|RESET|ROLLBACK|SAVEPOINT|RELEASE)\b/i;
    return !sqlPattern.test(input);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return re.test(password);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = () => {
    setIsTeachingAssistant(!isTeachingAssistant);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!validateEmail(formData.email)) {
      toast.error('Invalid email address.');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 6 characters long and contain both letters and numbers.');
      return;
    }

    if (!validateInput(formData.firstName) || !validateInput(formData.lastName)) {
      toast.error('Invalid characters detected in name fields.');
      return;
    }

    confirmAlert({
      customUI: ({ onClose }) => {
        const handleRegister = async () => {
          const data = { ...formData, isTA: isTeachingAssistant };
          try {
            const response = await axios.post('http://localhost:5173/admin-api/evaluatorRegister', data, {
              withCredentials: true
            });

            if (response.status === 201) {
              toast.success('User successfully registered!');
              console.log('User successfully registered!');
              navigate('/admin/evaluatormanager'); // Navigate to evaluator manager page after successful registration
            } else if (response.status === 400) {
              console.error('Duplicate email error:', response.data.error);
              toast.error('Email already exists');
            } else {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            onClose();
          } catch (error) {
            console.error('Error registering evaluator:', error);
            toast.error('Failed to register evaluator, the email is already in use.');
            onClose();
          }
        };

        return (
          <div className="custom-ui">
            <h1>Confirm Registration</h1>
            <p>Are you sure you want to register this evaluator?</p>
            <div className="button-group">
              <button onClick={onClose} className="cancel-button">Cancel</button>
              <button onClick={handleRegister} className="cancel-button">Confirm</button>
            </div>
          </div>
        );
      },
      overlayClassName: "custom-overlay",
    });
  };

  return (
    <div className="admin-home-portal">
      <ToastContainer />
      <AIvaluateNavBar navBarText="Admin Home Portal" />
      <div className="filler-div">
        <SideMenuBarAdmin tab="evalManager" />
        <div className="main-margin">
          <div className="top-bar">
            <div className="back-btn-div">
              <button className="main-back-button" onClick={() => navigate(-1)}><CircumIcon name="circle_chev_left" /></button>
            </div>
            <h1 className="eval-text-up-top">Register Evaluator</h1>
          </div>
          <div className="CreateAccPT-content"> {/* Updated class name */}
            <form className="CreateAccPT-user-form" onSubmit={handleSubmit}> {/* Updated class name */}
              <div className="CreateAccPT-form-group"> {/* Updated class name */}
                <div className="CreateAccPT-box"> {/* Updated class name */}
                  <label className="primary-text">
                    First Name:
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                  </label>
                  <label>
                    Last Name:
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </label>
                </div>
                <div className="CreateAccPT-box"> {/* Updated class name */}
                  <h2>Is this a T.A.?</h2>
                  <label className="CreateAccPT-checkbox-label"> {/* Updated class name */}
                    <div>
                      <input type="checkbox" className="CreateAccPT-checkbox-input" checked={isTeachingAssistant} onChange={handleCheckboxChange} /> {/* Updated class name */}
                    </div>
                    <div>
                      <span className="CreateAccPT-checkbox-text">Teaching Assistant</span> {/* Updated class name */}
                    </div>
                  </label>
                </div>
              </div>
              <div className="CreateAccPT-form-group"> {/* Updated class name */}
                <div className="CreateAccPT-box"> {/* Updated class name */}
                  <label>
                    Email:
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </label>
                  <label>
                    Password:
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                  </label>
                </div>
              </div>
              <button type="submit" className="CreateAccPT-create-user-button">Create user</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccPT;