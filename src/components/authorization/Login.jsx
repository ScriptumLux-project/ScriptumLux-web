import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Modal.css';

const Login = ({ isOpen, onClose, switchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorFields, setErrorFields] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const { login } = useAuth();

  // Reset form error animation
  useEffect(() => {
    if (showErrorAnimation) {
      const timer = setTimeout(() => {
        setShowErrorAnimation(false);
      }, 500); // Duration of the animation
      return () => clearTimeout(timer);
    }
  }, [showErrorAnimation]);

  // Clear field-specific error when user types in that field
  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (errorFields[field]) {
      setErrorFields(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorFields({});
    setIsLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err) {
      console.error("Login error:", err);
      setShowErrorAnimation(true);

      if (err.response && err.response.status === 401) {
        setError('Incorrect email or password');
        setErrorFields({
          email: 'Invalid credentials',
          password: 'Invalid credentials'
        });
      } else if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data.errors) {
          // Parse field-specific errors from the server
          const serverErrors = err.response.data.errors;
          const mappedErrors = {};

          // Map server error fields to our form fields
          Object.keys(serverErrors).forEach(key => {
            const fieldName = key.toLowerCase();
            if (fieldName.includes('email')) mappedErrors.email = serverErrors[key][0];
            else if (fieldName.includes('password')) mappedErrors.password = serverErrors[key][0];
            else setError(serverErrors[key][0]); // General error for unmapped fields
          });

          setErrorFields(mappedErrors);
        } else {
          setError('Failed to log in. Please try again.');
        }
      } else {
        setError(err.message || 'Failed to log in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="modal-overlay">
        <div className={`modal-content ${showErrorAnimation ? 'shake-animation' : ''}`}>
          <div className="modal-header">
            <h2>Log In</h2>
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>

          {error && (
              <div className="error-message-container">
                <div className="error-message">{error}</div>
              </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`form-group ${errorFields.email ? 'error' : ''}`}>
              <input
                  type="email"
                  id="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={handleInputChange(setEmail, 'email')}
                  className={errorFields.email ? 'input-error' : ''}
                  required
                  disabled={isLoading}
              />
              {errorFields.email && (
                  <div className="field-error">{errorFields.email}</div>
              )}
            </div>

            <div className={`form-group ${errorFields.password ? 'error' : ''}`}>
              <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={handleInputChange(setPassword, 'password')}
                  className={errorFields.password ? 'input-error' : ''}
                  required
                  disabled={isLoading}
              />
              {errorFields.password && (
                  <div className="field-error">{errorFields.password}</div>
              )}
            </div>

            <div className="form-group">
              <button
                  type="submit"
                  className={`auth-button`}
                  disabled={isLoading}
              >
                {isLoading ? (
                    <span className="loading-spinner"></span>
                ) : 'Log In'}
              </button>
            </div>

            <div className="switch-form">
              Don't have an account? <button type="button" onClick={switchToSignUp} className="switch-button" disabled={isLoading}>Sign Up</button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default Login;