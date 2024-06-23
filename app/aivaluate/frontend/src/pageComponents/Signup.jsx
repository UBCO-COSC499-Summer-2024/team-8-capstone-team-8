import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Auth.css';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [major, setMajor] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const divStyle = {
    border: '1px solid black',
    borderRadius: '25px'
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // At least one letter and one number, minimum 6 characters
    return re.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!firstName) newErrors.firstName = 'First Name is required';
    if (!lastName) newErrors.lastName = 'Last Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!password2) newErrors.password2 = 'Confirm Password is required';
    if (!major) newErrors.major = 'Major is required';

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters long and include at least one letter and one number';
    }

    if (password !== password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/stu/signup', {
        firstName,
        lastName,
        email,
        password,
        password2,
        major
      });
      console.log('Signup successful:', response.data);
      navigate('/stu/login'); // Redirect to login after successful signup
    } catch (error) {
      console.error('There was an error signing up:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        const serverErrors = error.response.data.errors.reduce((acc, curr) => {
          if (curr.message.includes("Email")) {
            acc.email = curr.message;
          } else {
            acc.server = curr.message;
          }
          return acc;
        }, {});
        setErrors({ ...newErrors, ...serverErrors });
      } else {
        setErrors({ ...newErrors, server: 'There was an error signing up. Please try again.' });
      }
    }
  };

  return (
    <div className="background">
      <div className="logo">
        <div className="logoText">
          <h1 className="primary-color-text">AI</h1><h1 className="secondary-color-bg">valuate</h1>
        </div>
      </div>
      <div className="auth-container">
        <div className="auth-form secondary-colorbg">
          <h2 className="auth-title third-color-text">Signup</h2>
          <div className="auth-toggle" style={divStyle}>
            <button className="auth-toggle-btn" onClick={() => navigate('/stu/login')}>Login</button>
            <button className="auth-toggle-btn active">Signup</button>
          </div>
          {errors.server && <p className="error-message">{errors.server}</p>}
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="First Name" 
              className="auth-input" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required 
            />
            {errors.firstName && <p className="error-message">{errors.firstName}</p>}
            <input 
              type="text" 
              placeholder="Last Name" 
              className="auth-input" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required 
            />
            {errors.lastName && <p className="error-message">{errors.lastName}</p>}
            <input 
              type="email" 
              placeholder="Email Address" 
              className="auth-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
            <input 
              type="password" 
              placeholder="Password" 
              className="auth-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
            <input 
              type="password" 
              placeholder="Confirm Password" 
              className="auth-input" 
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required 
            />

            {/* Major is not required for now*/}

            {errors.password2 && <p className="error-message">{errors.password2}</p>}
            <select 
              className="auth-input" 
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
            >
              <option value="">Select Major</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Engineering">Engineering</option>

            </select>
            {errors.major && <p className="error-message">{errors.major}</p>}
            <button className="auth-submit primary-colorbg" type="submit">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;