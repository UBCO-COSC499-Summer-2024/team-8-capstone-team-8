import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Auth.css';

const SignupAdmin = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [accessKey, setAccessKey] = useState('');
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

  const validateInput = (input) => {
    const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|GRANT|REVOKE|TRUNCATE|REPLACE|MERGE|CALL|EXPLAIN|LOCK|UNLOCK|DESCRIBE|SHOW|USE|BEGIN|END|DECLARE|SET|RESET|ROLLBACK|SAVEPOINT|RELEASE)\b/i;
    return !sqlPattern.test(input);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
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
    if (!accessKey) newErrors.accessKey = 'Access key is required';

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters long and include at least one letter and one number';
    }

    if (password !== password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    if (!validateInput(firstName) || !validateInput(lastName) || !validateInput(email) || !validateInput(password) || !validateInput(password2) || !validateInput(accessKey)) {
      setErrors({ form: 'Invalid input detected.' });
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5173/admin-api/signup', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        password2: password2.trim(),
        accessKey: accessKey.trim()
      });
      console.log('Signup successful:', response.data);
      navigate('/admin/login');
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
    <div className="background-div">
      <div className="logo">
        <div className="logoText">
          <h1 className="ai-text">AI</h1><h1 className="third-color-text">valuate</h1>
          <div className="center-text-admin"><h3>Administration</h3></div>
        </div>
      </div>
      <div className="auth-container">
        <div className="auth-form secondary-colorbg">
          <h2 className="auth-title third-color-text">Signup</h2>
          <h3 className="auth-title third-color-text">**ACCESS KEY NEEDED**</h3>
          <div className="auth-toggle" style={divStyle}>
            <button className="auth-toggle-btn" onClick={() => navigate('/admin/login')}>Login</button>
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
            {errors.password2 && <p className="error-message">{errors.password2}</p>}
            <input
              type="password"
              placeholder="Access Key"
              className="auth-input"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              required
            />
            {errors.accessKey && <p className="error-message">{errors.accessKey}</p>}
            <button className="auth-submit primary-colorbg" type="submit">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupAdmin;