import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, signup as apiSignup } from '../../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { user, token } = await apiLogin(email, password);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const signup = async (email, password, nickname) => {
    const { user, token } = await apiSignup(email, password, nickname);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const isAuthenticated = () => !!localStorage.getItem('accessToken');

  return (
      <AuthContext.Provider value={{
        currentUser, loading,
        login, signup, logout, isAuthenticated
      }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);