import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Auth.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!validateInput(email) || !validateInput(password)) {
      setError('Invalid input detected.');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors.email || newErrors.password);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5173/admin-api/login', {
        email: email.trim(),
        password: password.trim()
      }, { withCredentials: true });
      console.log('Login successful:', response.data);
      navigate('/admin/evaluatormanager');
    } catch (error) {
      console.error('There was an error logging in:', error);
      setError('Invalid email or password. Please try again.');
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
          <h2 className="auth-title third-color-text">Login</h2>
          <div className="auth-toggle" style={divStyle}>
            <button className="auth-toggle-btn active">Login</button>
            <button className="auth-toggle-btn" onClick={() => navigate('/admin/signup')}>Signup</button>
          </div>
          {error && <p className="error-message">{error}</p>}
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

export default AdminLogin;