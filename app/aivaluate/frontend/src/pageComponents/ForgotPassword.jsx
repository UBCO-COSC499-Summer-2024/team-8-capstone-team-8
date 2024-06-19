import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email || !confirmEmail) {
      setError('Both email fields are required');
      return;
    }
    if (email !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }
    try {
      const response = await axios.post('http://localhost:4000/stu/forgotpassword', { email });
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      setMessage('Error sending reset email');
    }
  };

  return (
    <div className="background">
      <div className="logo">
        <div className="logoText">
          <h1 className="primary-color-text">AI</h1><h1 className="secondary-color-text">valuate</h1>
        </div>
      </div>
      <div className="auth-container">
        <div className="auth-form secondary-colorbg">
          <h2 className="auth-title third-color-text">Forgot Password</h2>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="message">{message}</p>}
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="auth-input" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Confirm Email Address" 
                className="auth-input" 
                value={confirmEmail} 
                onChange={(e) => setConfirmEmail(e.target.value)} 
                required 
              />
            </div>
            <button className="auth-submit primary-colorbg" type="submit">Send Email</button>
            <a href="/login" className="back-to-login primary-color-text">Back to login</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
