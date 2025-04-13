import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../style.css';
import API_BASE_URL from '../config';

const Login = () => {
  // Access the login function from AuthContext
  const { login } = useContext(AuthContext);

  // State for form inputs and messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Hook for navigation
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send login request to backend
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // If login successful:
        // 1. Call login function from context to update auth state
        // 2. Redirect to products page
        login(data.token, username);
        navigate('/products');
      } else {
        // Show error message if login failed
        setMessage(data.message);
        setMessageType('error');
      }
    } catch (error) {
      // Handle network errors
      setMessage('Login failed. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>

      {/* Display message if exists (error/success) */}
      {message && <div className={`message ${messageType}`}>{message}</div>}

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
