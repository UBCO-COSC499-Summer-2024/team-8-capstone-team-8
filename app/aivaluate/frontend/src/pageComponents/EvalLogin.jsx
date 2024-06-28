import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Auth.css';

const EvalLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors.email || newErrors.password);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5173/eval-api/login', {
        email,
        password
      }, { withCredentials: true });
      console.log('Login successful:', response.data);
      navigate('/eval/dashboard');
    } catch (error) {
      console.error('There was an error logging in:', error);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="background">
      <div className="logo">
        <div className="logoText">
          <h1 className="primary-color-text">AI</h1><h1 className="secondary-color-text">valuate</h1>
          <div className="center-text-admin"><h3>Evaluators</h3></div>
        </div>
      </div>
      <div className="auth-container">
        <div className="auth-form secondary-colorbg">
        <h2 className="auth-title third-color-text">Login</h2>
        <form onSubmit={handleSubmit}>
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
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Password" 
                className="auth-input" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <a href="forgotpassword" className="forgot-password primary-color-text">Forgot Password?</a>
            <button className="auth-submit primary-colorbg" type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EvalLogin;