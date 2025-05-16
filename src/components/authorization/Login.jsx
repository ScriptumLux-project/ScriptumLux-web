import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Modal.css';

const Login = ({ isOpen, onClose, switchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      onClose(); 
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button modal-close-fixed" onClick={onClose}>&times;</button>

        <div className="login-content-wrapper">
          <div className="modal-header">
            <h2>Log In</h2>
            {error && <div className="error-message">{error}</div>}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
              <button type="submit" className="auth-button">Log In</button>
            </div>

            <div className="switch-form">
              Don't have an account? <button type="button" onClick={switchToSignUp} className="switch-button">Sign Up</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;