import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Modal.css';

const SignUp = ({ isOpen, onClose, switchToLogin }) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errorFields, setErrorFields] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const { signup } = useAuth();

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

    // Client-side validation
    const newErrorFields = {};
    let hasErrors = false;

    if (password !== confirmPassword) {
      newErrorFields.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }

    if (password.length < 6) {
      newErrorFields.password = 'Password must be at least 6 characters';
      hasErrors = true;
    }

    if (!email.includes('@')) {
      newErrorFields.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    if (nickname.trim().length < 2) {
      newErrorFields.nickname = 'Nickname must be at least 2 characters';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrorFields(newErrorFields);
      setShowErrorAnimation(true);
      setIsLoading(false);
      return;
    }

    try {
      await signup(email, password, nickname, confirmPassword, "string");
      onClose();
    } catch (err) {
      console.error("Registration error:", err);
      setShowErrorAnimation(true);

      if (err.response && err.response.data) {
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
            else if (fieldName.includes('nickname') || fieldName.includes('username')) mappedErrors.nickname = serverErrors[key][0];
            else setError(serverErrors[key][0]); // General error for unmapped fields
          });

          setErrorFields(mappedErrors);
        } else {
          setError('Failed to create an account. Please try again.');
        }
      } else {
        setError(err.message || 'Failed to create an account');
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
            <h2>Sign Up</h2>
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>

          {error && (
              <div className="error-message-container">
                <div className="error-message">{error}</div>
              </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`form-group ${errorFields.nickname ? 'error' : ''}`}>
              <input
                  type="text"
                  id="nickname"
                  placeholder="Enter your nickname"
                  value={nickname}
                  onChange={handleInputChange(setNickname, 'nickname')}
                  className={errorFields.nickname ? 'input-error' : ''}
                  required
                  disabled={isLoading}
              />
              {errorFields.nickname && (
                  <div className="field-error">{errorFields.nickname}</div>
              )}
            </div>

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
                  autoComplete="new-password"
              />
              {errorFields.password && (
                  <div className="field-error">{errorFields.password}</div>
              )}
            </div>

            <div className={`form-group ${errorFields.confirmPassword ? 'error' : ''}`}>
              <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
                  className={errorFields.confirmPassword ? 'input-error' : ''}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
              />
              {errorFields.confirmPassword && (
                  <div className="field-error">{errorFields.confirmPassword}</div>
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
                ) : 'Sign Up'}
              </button>
            </div>

            <div className="switch-form">
              Already have an account? <button type="button" onClick={switchToLogin} className="switch-button" disabled={isLoading}>Log In</button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default SignUp;