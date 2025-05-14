import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Modal.css';

const SignUp = ({ isOpen, onClose, switchToLogin }) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await signup(email, password, nickname);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create an account');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Sign Up</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              id="nickname"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <button type="submit" className="auth-button">Sign Up</button>
          </div>
          
          <div className="switch-form">
            Already have an account? <button type="button" onClick={switchToLogin} className="switch-button">Log In</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;