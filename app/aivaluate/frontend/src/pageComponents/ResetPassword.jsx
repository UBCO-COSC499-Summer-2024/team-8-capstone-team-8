import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      setMessage('Password must be longer than 6 characters and include a combination of letters and numbers');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:5173/stu-api/stu/reset/${token}`, { password, confirmPassword });
      setMessage(response.data.message);
      if (response.data.message === 'Password has been reset successfully') {
        navigate('/stu/login');
      }
    } catch (error) {
      setMessage('Error resetting password');
    }
  };

  return (
    <div className="background-div">
    <div className="auth-container">
      <div className="auth-form secondary-colorbg">
        <h2 className="auth-title third-color-text">Reset Password</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="New Password" 
              className="auth-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Confirm New Password" 
              className="auth-input" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          <button className="auth-submit primary-colorbg" type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  </div>
  );
};

export default ResetPassword;